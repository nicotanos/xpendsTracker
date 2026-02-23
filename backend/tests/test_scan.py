import io
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from routes.scan import _extract_amount, _extract_provider_name, _extract_rut

import pytest

# ──────────────────────────────────────────────────────────────────────────────
# Sample OCR text that mimics a typical Chilean boleta electrónica
# ──────────────────────────────────────────────────────────────────────────────
BOLETA_TEXT = """
BOLETA ELECTRONICA N° 004521
Emisor: Supermercado El Ahorro S.A.
RUT: 76.123.456-7
Razón Social: Supermercado El Ahorro S.A.
Dirección: Av. Providencia 1234, Santiago

Lechuga           $1.200
Pan Integral       $2.500
Leche Entera       $1.800

Total             $5.500
"""

FACTURA_TEXT = """
FACTURA ELECTRONICA N° 001234
RUT Emisor: 96543210-K
Nombre: Distribuidora Santiago Ltda.
Monto Total: 12.300
"""

NO_DATA_TEXT = "Este texto no tiene RUT ni monto ni razón social."


# ──────────────────────────────────────────────────────────────────────────────
# Part 1 — Unit tests for extraction helpers (pure Python, no API)
# ──────────────────────────────────────────────────────────────────────────────

class TestExtractRut:
    def test_found_with_dots(self):
        assert _extract_rut(BOLETA_TEXT) == "76.123.456-7"

    def test_found_without_dots(self):
        text = "RUT del emisor: 76123456-7 en el documento"
        result = _extract_rut(text)
        assert result == "76123456-7"

    def test_found_with_k_verifier(self):
        result = _extract_rut(FACTURA_TEXT)
        assert result == "96543210-K"

    def test_not_found(self):
        assert _extract_rut(NO_DATA_TEXT) is None

    def test_returns_first_rut(self):
        text = "Emisor: 12.345.678-9  Receptor: 98.765.432-1"
        assert _extract_rut(text) == "12.345.678-9"


class TestExtractAmount:
    def test_total_chilean_format(self):
        # "Total $5.500" → dots are thousands separators → 5500.0
        assert _extract_amount(BOLETA_TEXT) == 5500.0

    def test_monto_total(self):
        assert _extract_amount(FACTURA_TEXT) == 12300.0

    def test_a_pagar(self):
        text = "Subtotal $8.000\nA Pagar $9.500"
        assert _extract_amount(text) == 9500.0

    def test_not_found(self):
        assert _extract_amount(NO_DATA_TEXT) is None

    def test_importe_keyword(self):
        text = "Importe: 3.750"
        assert _extract_amount(text) == 3750.0


class TestExtractProviderName:
    def test_razon_social(self):
        result = _extract_provider_name(BOLETA_TEXT)
        assert result is not None
        assert "Supermercado El Ahorro" in result

    def test_nombre_keyword(self):
        result = _extract_provider_name(FACTURA_TEXT)
        assert result is not None
        assert "Distribuidora Santiago" in result

    def test_company_suffix_fallback(self):
        text = "SERV. CLINICA ALEMANA LTDA\nRUT 25029126-4"
        result = _extract_provider_name(text)
        assert result is not None
        assert "CLINICA ALEMANA" in result

    def test_not_found(self):
        assert _extract_provider_name(NO_DATA_TEXT) is None


# ──────────────────────────────────────────────────────────────────────────────
# Part 2 — Endpoint validation tests (no Vision API call needed)
# ──────────────────────────────────────────────────────────────────────────────

class TestScanEndpointValidation:
    def test_requires_auth(self, client):
        res = client.post(
            "/scan/receipt",
            files={"file": ("test.jpg", b"fake", "image/jpeg")},
        )
        assert res.status_code == 401

    def test_rejects_unsupported_type(self, client, auth_headers):
        res = client.post(
            "/scan/receipt",
            files={"file": ("doc.txt", b"hello", "text/plain")},
            headers=auth_headers,
        )
        assert res.status_code == 415
        assert "Unsupported" in res.json()["detail"]

    def test_rejects_oversized_file(self, client, auth_headers):
        big = b"x" * (11 * 1024 * 1024)  # 11 MB
        res = client.post(
            "/scan/receipt",
            files={"file": ("big.jpg", io.BytesIO(big), "image/jpeg")},
            headers=auth_headers,
        )
        assert res.status_code == 413
        assert "large" in res.json()["detail"].lower()

    def test_accepts_pdf_mime(self, client, auth_headers):
        # A tiny valid-mime-type PDF — will fail at Vision API, but passes validation
        fake_pdf = b"%PDF-1.4 fake"
        res = client.post(
            "/scan/receipt",
            files={"file": ("receipt.pdf", io.BytesIO(fake_pdf), "application/pdf")},
            headers=auth_headers,
        )
        # 200 (if Vision API is available) or 502 (no credentials) — never 415/413
        assert res.status_code in (200, 502)


# ──────────────────────────────────────────────────────────────────────────────
# Part 3 — Integration test with a real receipt image + real Vision API
#
# To run: place your receipt photo at  backend/tests/fixtures/boleta.jpg
#         then: gcloud auth application-default login
#         then: cd backend && pytest tests/ -v -s
# ──────────────────────────────────────────────────────────────────────────────

FIXTURE_IMAGE = os.path.join(os.path.dirname(__file__), "fixtures", "boleta.jpg")


@pytest.mark.skipif(
    not os.path.exists(FIXTURE_IMAGE),
    reason="No fixture image — place a receipt at backend/tests/fixtures/boleta.jpg",
)
def test_scan_real_receipt(client, auth_headers):
    with open(FIXTURE_IMAGE, "rb") as f:
        res = client.post(
            "/scan/receipt",
            files={"file": ("boleta.jpg", f, "image/jpeg")},
            headers=auth_headers,
        )

    assert res.status_code == 200, f"Unexpected error: {res.text}"
    data = res.json()

    assert "raw_text" in data
    assert isinstance(data["raw_text"], str)
    assert len(data["raw_text"]) > 0, "Vision returned empty text — check credentials"

    # At least one field must be extracted
    extracted = [data["amount"], data["rut"], data["provider_name"]]
    assert any(v is not None for v in extracted), (
        "No fields extracted. Raw text:\n" + data["raw_text"]
    )

    # Print results so you can verify against the physical receipt
    print("\n" + "─" * 50)
    print(f"  amount:        {data['amount']}")
    print(f"  rut:           {data['rut']}")
    print(f"  provider_name: {data['provider_name']}")
    print("  raw_text (first 300 chars):")
    print("  " + data["raw_text"][:300].replace("\n", "\n  "))
    print("─" * 50)
