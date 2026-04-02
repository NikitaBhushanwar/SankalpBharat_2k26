#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-117.239.42.27}"
USER_NAME="${DEPLOY_USER:-sanbha}"
APP_DIR="${DEPLOY_APP_DIR:-/var/www/sankalpbharat.stvincentngp.edu.in/app}"
APP_NAME="${DEPLOY_APP_NAME:-sankalpbharat}"
APP_PORT="${DEPLOY_APP_PORT:-3001}"
HEALTH_PATH="${DEPLOY_HEALTH_PATH:-/api/health}"
HEALTH_RETRIES="${DEPLOY_HEALTH_RETRIES:-12}"
HEALTH_SLEEP_SECONDS="${DEPLOY_HEALTH_SLEEP_SECONDS:-5}"
SSH_OPTS=(-o StrictHostKeyChecking=no)
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
RELEASES_DIR="${APP_DIR}/releases"
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
CURRENT_LINK="${APP_DIR}/current"
PREVIOUS_LINK="${APP_DIR}/previous"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "Error: sshpass is required. Install with: brew install hudochenkov/sshpass/sshpass"
  exit 1
fi

if [[ -z "${DEPLOY_PASSWORD:-}" ]]; then
  read -rsp "Server password for ${USER_NAME}@${HOST}: " DEPLOY_PASSWORD
  echo
fi

SSH_BASE=(sshpass -p "${DEPLOY_PASSWORD}" ssh "${SSH_OPTS[@]}" "${USER_NAME}@${HOST}")

echo "[1/5] Uploading release to ${HOST}:${RELEASE_DIR}"
COPYFILE_DISABLE=1 tar --no-xattrs \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='.DS_Store' \
  -czf - . | "${SSH_BASE[@]}" "mkdir -p '${RELEASE_DIR}' '${RELEASES_DIR}' && tar -xzf - -C '${RELEASE_DIR}'"

echo "[2/5] Installing dependencies and building release"
"${SSH_BASE[@]}" "cd '${RELEASE_DIR}' && npm install --silent && npm run build"

echo "[3/5] Switching release and restarting PM2"
"${SSH_BASE[@]}" "
set -euo pipefail

if [ -L '${CURRENT_LINK}' ]; then
  rm -f '${PREVIOUS_LINK}'
  cp -P '${CURRENT_LINK}' '${PREVIOUS_LINK}'
fi

ln -sfn '${RELEASE_DIR}' '${CURRENT_LINK}'

if pm2 describe '${APP_NAME}' >/dev/null 2>&1; then
  pm2 delete '${APP_NAME}'
fi

pm2 start npm --name '${APP_NAME}' --cwd '${CURRENT_LINK}' -- run start -- --port '${APP_PORT}' --hostname 0.0.0.0
pm2 save
"

echo "[4/5] Verifying health with retries"
if ! "${SSH_BASE[@]}" "
set -euo pipefail

attempt=1
while [ \"\${attempt}\" -le '${HEALTH_RETRIES}' ]; do
  if curl -fsS 'http://127.0.0.1:${APP_PORT}${HEALTH_PATH}' >/dev/null; then
    echo 'Health check passed.'
    exit 0
  fi

  echo \"Health check failed (attempt \${attempt}/${HEALTH_RETRIES}); retrying in ${HEALTH_SLEEP_SECONDS}s...\"
  sleep '${HEALTH_SLEEP_SECONDS}'
  attempt=\$((attempt + 1))
done

exit 1
"; then
  echo "[!] New release failed health checks. Rolling back to previous release..."
  "${SSH_BASE[@]}" "
set -euo pipefail

if [ -L '${PREVIOUS_LINK}' ]; then
  rm -f '${CURRENT_LINK}'
  cp -P '${PREVIOUS_LINK}' '${CURRENT_LINK}'
  pm2 delete '${APP_NAME}' >/dev/null 2>&1 || true
  pm2 start npm --name '${APP_NAME}' --cwd '${CURRENT_LINK}' -- run start -- --port '${APP_PORT}' --hostname 0.0.0.0
  pm2 save
else
  echo 'Rollback failed: no previous release symlink found.'
  exit 1
fi
"

  echo "[5/5] Validating rollback health"
  "${SSH_BASE[@]}" "curl -fsS 'http://127.0.0.1:${APP_PORT}${HEALTH_PATH}' >/dev/null"
  echo "Rollback succeeded. Previous release restored."
  exit 1
fi

echo "[5/5] Cleaning older releases (keeping latest 5)"
"${SSH_BASE[@]}" "
set -euo pipefail
ls -1dt '${RELEASES_DIR}'/* 2>/dev/null | tail -n +6 | xargs rm -rf -- 2>/dev/null || true
"

echo
echo "Deployment complete: http://${HOST}:${APP_PORT}"
