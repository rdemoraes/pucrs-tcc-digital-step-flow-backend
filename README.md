# Digital Step Flow - Backend

Backend Express/Node.js da plataforma Digital Step Flow.

## Stack Tecnológico

- Node.js v24.13.0 com Express
- TypeScript para segurança de tipos
- JWT para autenticação
- bcrypt para hash de senhas
- Zod para validação de schemas
- Helmet para cabeçalhos de segurança

## Desenvolvimento Local

Para instruções detalhadas de desenvolvimento local, consulte [docs/local-development.md](./docs/local-development.md).

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar aplicação
npm start

# Executar testes
npm test
```

## Estrutura do Projeto

```
src/
├── controllers/    # Controladores de rotas
├── middleware/     # Middlewares Express
│   ├── auth.middleware.ts
│   ├── errorHandler.ts
│   ├── requestLogger.middleware.ts
│   └── validateRequest.ts
├── routes/         # Definição de rotas
├── repositories/   # Camada de acesso a dados
├── schemas/        # Schemas de validação (Zod)
├── utils/          # Utilitários (logger, etc.)
└── index.ts        # Ponto de entrada
```

## Kubernetes

Os manifests Kubernetes estão em `k8s/` e incluem:
- Deployment
- Service
- Kustomization (usa remote base do repositório principal)

## Argo CD

A application do Argo CD está em `argocd/application.yaml` e aponta para este repositório.

## Build Docker

```bash
# Build local
docker buildx bake -f docker-bake.hcl --load

# Build com versão específica
docker buildx bake -f docker-bake.hcl --load \
  --set backend.args.BACKEND_IMAGE_VERSION=1.0.0 \
  --set backend.args.BASE_IMAGE_VERSION=1.0.0
```

## Logging

O backend usa logging estruturado em JSON. Veja [docs/logging.md](./docs/logging.md) para mais detalhes.

## Health Check

O endpoint `/health` está disponível para verificar o status do serviço:

```bash
curl http://localhost:8080/health
```

## Versionamento

Este projeto segue [Semantic Versioning 2.0.0](https://semver.org/).

Para criar uma release:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## CI/CD

O pipeline CI/CD constrói e publica automaticamente as imagens quando:
- Um PR é mergeado para `main` ou `develop`
- Uma tag semântica é criada (ex: `v1.0.0`)

Após o build bem-sucedido, os manifests Kubernetes são atualizados automaticamente com a nova tag da imagem.

## Documentação

- [Desenvolvimento Local](./docs/local-development.md)
- [Logging Estruturado](./docs/logging.md)
- [Versionamento](./docs/versioning.md)
