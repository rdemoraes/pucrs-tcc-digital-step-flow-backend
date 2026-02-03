#!/bin/sh
# When running with Docker Compose secrets, read secret files into env and exec the main process.
# Secrets are mounted at /run/secrets/<name> (see docker-compose.yml).
set -e
if [ -f /run/secrets/jwt_secret ]; then
  export JWT_SECRET=$(cat /run/secrets/jwt_secret | tr -d '\n\r')
fi
if [ -f /run/secrets/postgres_password ]; then
  export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password | tr -d '\n\r')
fi
exec "$@"
