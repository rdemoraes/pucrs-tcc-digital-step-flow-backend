# Guia de Desenvolvimento Local - Backend

Este guia cobre a configuração do backend Digital Step Flow para desenvolvimento local, incluindo **Docker Compose** com stack completa (backend, frontend, Postgres, Redis e observabilidade).

## Pré-requisitos

- Node.js v24.13.0
- npm 11.6.3
- **Docker e Docker Compose** (para desenvolvimento com compose)
- PostgreSQL e Redis (opcionais se rodar só com `npm run dev`)

---

## Opção 1: Desenvolvimento com Docker Compose (recomendado)

O repositório do backend inclui um **Docker Compose** com toda a stack para desenvolvimento local:

| Serviço      | Descrição                    | Porta local |
|--------------|------------------------------|-------------|
| **backend**  | API Express                  | 8080 (API), 8081 (health), 8082 (metrics) |
| **frontend** | App React (Vite)             | 3000        |
| **postgres** | Banco PostgreSQL 16          | 5432        |
| **redis**    | Cache/sessões                | 6379        |
| **prometheus** | Métricas                    | 9090        |
| **grafana**  | Dashboards (Prometheus, Loki, Tempo) | 3001   |
| **loki**     | Agregação de logs            | 3100        |
| **tempo**    | Rastreamento distribuído     | 3200, 4317 (gRPC), 4318 (HTTP) |

### Pré-requisito para stack completa (backend + frontend)

Clone o repositório do frontend **ao lado** do backend, com o nome esperado pelo compose:

```bash
# Exemplo: se o backend está em ~/git/pucrs-tcc-digital-step-flow-backend
cd ~/git
git clone <url-do-repo> pucrs-tcc-digital-step-flow-frontend
```

Estrutura esperada:

```
git/
├── pucrs-tcc-digital-step-flow-backend/
└── pucrs-tcc-digital-step-flow-frontend/
```

### Subir a stack completa (backend + frontend + Postgres + Redis + observabilidade)

Na raiz do repositório do **backend**:

```bash
# Criar .env se ainda não tiver (veja Variáveis de Ambiente abaixo)
cp env.example .env

# Subir todos os serviços
docker compose up -d

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend
```

- **API:** http://localhost:8080  
- **Frontend:** http://localhost:3000  
- **Grafana:** http://localhost:3001 (admin / senha em `GRAFANA_ADMIN_PASSWORD`, padrão `admin`)  
- **Prometheus:** http://localhost:9090  

### Subir só backend + infra (sem frontend em container)

Se preferir rodar o frontend localmente com `npm run dev` no repo do frontend, ou não precisar do frontend em container:

```bash
docker compose -f docker-compose.backend-only.yml up -d
```

Backend, Postgres, Redis, Prometheus, Grafana, Loki e Tempo sobem; o frontend você roda no repo do frontend com `npm run dev` apontando para `http://localhost:8080/api`.

### Comandos úteis

```bash
# Parar todos os serviços
docker compose down

# Parar e remover volumes
docker compose down -v

# Rebuild após mudar Dockerfile ou dependências
docker compose build --no-cache backend
docker compose up -d
```

### Variáveis de ambiente para Docker Compose

Crie um `.env` na raiz do backend (pode usar `env.example` como base). Exemplo mínimo:

```env
# Backend
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development

# Postgres (usado pelo backend no compose)
POSTGRES_DB=digitalstepflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Grafana (opcional)
GRAFANA_ADMIN_PASSWORD=admin
```

O backend no compose já recebe `POSTGRES_HOST=postgres`, `REDIS_HOST=redis`, etc.; não é preciso definir host/porta desses serviços no `.env` para uso com compose.

---

## Opção 2: Desenvolvimento sem Docker (só Node)

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O backend estará em http://localhost:8080 (API), 8081 (health), 8082 (metrics).

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
SERVICE_NAME=digital-step-flow-backend
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=digitalstepflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento (hot reload)
- `npm run build` - Compila TypeScript
- `npm start` - Executa aplicação compilada
- `npm test` - Executa testes
- `npm run test:coverage` - Executa testes com cobertura
- `npm run lint` - Executa linter
- `npm run type-check` - Verifica tipos TypeScript

---

## Estrutura do Projeto

```
src/
├── controllers/    # Controladores de rotas
├── middleware/     # Middlewares Express
├── routes/         # Definição de rotas
├── repositories/   # Camada de acesso a dados
├── schemas/        # Schemas de validação (Zod)
├── utils/          # Utilitários (logger, etc.)
└── index.ts        # Ponto de entrada
```

---

## Testes

```bash
# Executar testes
npm test

# Com cobertura
npm run test:coverage
```

---

## Logging

O backend usa logging estruturado em JSON. Veja [docs/logging.md](./logging.md) para mais detalhes.

---

## Health Check

O endpoint `/health` está disponível no servidor de health (porta 8081 por padrão):

```bash
curl http://localhost:8081/health
```

---

## Build para Produção

```bash
npm run build
```

A saída compilada estará em `dist/`.
