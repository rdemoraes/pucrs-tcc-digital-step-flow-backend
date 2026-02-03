# Docker Compose secrets

Sensitive values are provided to the stack via **Docker secrets** (file-based). Create one plain-text file per secret; the file content is mounted read-only inside the container.

**Required files** (create these before `docker compose up`):

| File | Used by | Description |
|------|--------|-------------|
| `jwt_secret.txt` | backend | Secret for signing/verifying JWT tokens. |
| `postgres_password.txt` | backend, postgres | PostgreSQL password (must match for both services). |
| `grafana_admin_password.txt` | grafana | Grafana admin UI password. |

**Example (do not commit real values):**

```bash
# From repo root
mkdir -p secrets

echo -n 'your-jwt-secret-at-least-32-chars' > secrets/jwt_secret.txt
echo -n 'postgres' > secrets/postgres_password.txt
echo -n 'admin' > secrets/grafana_admin_password.txt
```

These files are ignored by git (`secrets/*.txt` in `.gitignore`). Use strong values in any non-local environment.
