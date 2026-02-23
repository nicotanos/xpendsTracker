import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from auth import get_current_user

router = APIRouter(prefix="/scan", tags=["scan"])

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "image/tiff", "application/pdf",
}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


def _ocr(content: bytes, mime_type: str) -> str:
    from google.cloud import vision

    client = vision.ImageAnnotatorClient()

    if mime_type == "application/pdf":
        input_config = vision.InputConfig(content=content, mime_type="application/pdf")
        feature = vision.Feature(type_=vision.Feature.Type.DOCUMENT_TEXT_DETECTION)
        file_req = vision.AnnotateFileRequest(
            input_config=input_config, features=[feature], pages=[1]
        )
        resp = client.batch_annotate_files(requests=[file_req])
        annotation = resp.responses[0].responses[0].full_text_annotation
    else:
        image = vision.Image(content=content)
        resp = client.document_text_detection(image=image)
        annotation = resp.full_text_annotation

    return annotation.text if annotation else ""


def _extract_rut(text: str) -> str | None:
    # Chilean RUT: XX.XXX.XXX-X or XXXXXXXX-X
    pattern = r'\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b'
    matches = re.findall(pattern, text)
    return matches[0] if matches else None


def _extract_amount(text: str) -> float | None:
    # Chilean pesos (CLP): dot is thousands separator, no decimal places.
    # Try dotted format first (e.g. "5.500", "180.784"), then plain integer.
    patterns = [
        r'(?<!\w)(?:total|monto total|a pagar|importe neto|importe)[\s:$]*([0-9]{1,3}(?:\.[0-9]{3})+)',
        r'(?<!\w)(?:total|monto total|a pagar|importe neto|importe)[\s:$]*([0-9]{2,})',
    ]
    for p in patterns:
        m = re.search(p, text.lower())
        if m:
            raw = m.group(1).replace('.', '')
            try:
                return float(raw)
            except ValueError:
                continue
    return None


def _extract_provider_name(text: str) -> str | None:
    # 1. Labeled keyword: "Razón Social: ...", "Nombre: ...", "Emisor: ..."
    m = re.search(r'(?:raz[oó]n social|nombre|emisor)[:\s]+([A-ZÁÉÍÓÚÑ][^\n]{3,60})', text, re.IGNORECASE)
    if m:
        name = m.group(1).strip()
        if name:
            return name
    # 2. Fallback: all-caps line ending with a Chilean company legal suffix
    m = re.search(r'([A-ZÁÉÍÓÚÑ]{2,}[^\n]{0,55}(?:LTDA|S\.A\.|S\.P\.A\.|EIRL|SpA))', text)
    if m:
        name = m.group(1).strip()
        if name:
            return name
    return None


@router.post("/receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    mime_type = file.content_type or ""
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{mime_type}'. Upload an image or PDF.",
        )

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum is 10 MB.")

    try:
        raw_text = _ocr(content, mime_type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OCR service error: {str(e)}")

    return {
        "amount": _extract_amount(raw_text),
        "rut": _extract_rut(raw_text),
        "provider_name": _extract_provider_name(raw_text),
        "raw_text": raw_text,
    }
