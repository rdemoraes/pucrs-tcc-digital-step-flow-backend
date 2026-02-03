#!/bin/sh
# When running with Docker Compose secrets, read secret files into env and exec the main process.
# Secrets are mounted at /run/secrets/<name> (see docker-compose.yml).
set -e
if [ -f /run/secrets/jwt_secret ]; then
  JWT_SECRET="$(tr -d '\n\r' < /run/secrets/jwt_secret)"
  export JWT_SECRET
fi
if [ -f /run/secrets/postgres_password ]; then
  POSTGRES_PASSWORD="$(tr -d '\n\r' < /run/secrets/postgres_password)"
  export POSTGRES_PASSWORD
fi
exec "$@"
