# Guia de Desenvolvimento Local - Backend

Este guia cobre a configuração do backend Digital Step Flow para desenvolvimento local.

## Pré-requisitos

- Node.js v24.13.0
- npm 11.6.3
- Docker e Docker Compose (opcional)
- PostgreSQL (opcional, para testes locais)

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O backend estará disponível em http://localhost:8080

## Variáveis de Ambiente

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
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento (hot reload)
- `npm run build` - Compila TypeScript
- `npm start` - Executa aplicação compilada
- `npm test` - Executa testes
- `npm run test:coverage` - Executa testes com cobertura
- `npm run lint` - Executa linter
- `npm run type-check` - Verifica tipos TypeScript

## Desenvolvimento com Docker

```bash
# Build e executa com Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

## Estrutura do Projeto

```
src/
├── controllers/    # Controladores de rotas
├── middleware/     # Middlewares Express
├── routes/         # Definição de rotas
├── repositories/    # Camada de acesso a dados
├── schemas/        # Schemas de validação (Zod)
├── utils/          # Utilitários (logger, etc.)
└── index.ts        # Ponto de entrada
```

## Testes

```bash
# Executar testes
npm test

# Com cobertura
npm run test:coverage
```

## Logging

O backend usa logging estruturado em JSON. Veja [docs/logging.md](./logging.md) para mais detalhes.

## Health Check

O endpoint `/health` está disponível para verificar o status do serviço:

```bash
curl http://localhost:8080/health
```

## Build para Produção

```bash
npm run build
```

A saída compilada estará em `dist/`

