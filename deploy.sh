#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# deploy.sh — Build and deploy xpendsTracker to Google Cloud Run
#
# Usage:
#   export PROJECT_ID=your-gcp-project-id
#   export REGION=us-central1          # or your preferred region
#   export DB_PASS=your-db-password    # Cloud SQL postgres user password
#   ./deploy.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID environment variable}"
: "${REGION:=us-central1}"
: "${DB_REGION:=southamerica-west1}"
: "${DB_PASS:?Set DB_PASS environment variable}"

APP_NAME="xpends-tracker"
IMAGE="gcr.io/${PROJECT_ID}/${APP_NAME}"
DB_INSTANCE="${PROJECT_ID}:${DB_REGION}:${APP_NAME}-db"
DB_NAME="xpends"
DB_USER="xpends"
# URL-encode the password so special chars don't break the connection string
DB_PASS_ENCODED=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "${DB_PASS}")

echo "▶ Building React frontend..."
(cd frontend && npm run build)

echo "▶ Copying build into backend/static..."
rm -rf backend/static
cp -r frontend/dist backend/static

echo "▶ Building Docker image..."
docker build --platform linux/amd64 -t "${IMAGE}" backend/

echo "▶ Pushing image to GCR..."
docker push "${IMAGE}"

echo "▶ Deploying to Cloud Run..."
gcloud run deploy "${APP_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --add-cloudsql-instances "${DB_INSTANCE}" \
  --set-env-vars "\
DATABASE_URL=postgresql+psycopg2://${DB_USER}:${DB_PASS_ENCODED}@/${DB_NAME}?host=/cloudsql/${DB_INSTANCE},\
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))'),\
ALLOWED_ORIGINS=https://$(gcloud run services describe ${APP_NAME} --region ${REGION} --format 'value(status.url)' 2>/dev/null | sed 's|https://||' || echo 'localhost')"

echo ""
echo "✓ Deployment complete!"
echo "  Service URL: $(gcloud run services describe ${APP_NAME} --region ${REGION} --format 'value(status.url)')"
