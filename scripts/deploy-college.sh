#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-117.239.42.27}"
USER_NAME="${DEPLOY_USER:-sanbha}"
APP_DIR="${DEPLOY_APP_DIR:-/var/www/sankalpbharat.stvincentngp.edu.in/app}"
APP_NAME="${DEPLOY_APP_NAME:-sankalpbharat}"
APP_PORT="${DEPLOY_APP_PORT:-3001}"
SSH_OPTS=(-o StrictHostKeyChecking=no)

if ! command -v sshpass >/dev/null 2>&1; then
  echo "Error: sshpass is required. Install with: brew install hudochenkov/sshpass/sshpass"
  exit 1
fi

if [[ -z "${DEPLOY_PASSWORD:-}" ]]; then
  read -rsp "Server password for ${USER_NAME}@${HOST}: " DEPLOY_PASSWORD
  echo
fi

SSH_BASE=(sshpass -p "${DEPLOY_PASSWORD}" ssh "${SSH_OPTS[@]}" "${USER_NAME}@${HOST}")

echo "[1/4] Uploading project to ${HOST}:${APP_DIR}"
COPYFILE_DISABLE=1 tar --no-xattrs \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='.DS_Store' \
  -czf - . | "${SSH_BASE[@]}" "mkdir -p '${APP_DIR}' && tar -xzf - -C '${APP_DIR}'"

echo "[2/4] Installing dependencies and building"
"${SSH_BASE[@]}" "cd '${APP_DIR}' && npm install --silent && npm run build"

echo "[3/4] Restarting PM2 app (${APP_NAME}) on port ${APP_PORT}"
"${SSH_BASE[@]}" "pm2 delete '${APP_NAME}' >/dev/null 2>&1 || true; pm2 start npm --name '${APP_NAME}' --cwd '${APP_DIR}' -- run start -- --port '${APP_PORT}' --hostname 0.0.0.0 && pm2 save"

echo "[4/4] Verifying health"
"${SSH_BASE[@]}" "curl -sS 'http://127.0.0.1:${APP_PORT}/api/health'"
echo
echo "Deployment complete: http://${HOST}:${APP_PORT}"
