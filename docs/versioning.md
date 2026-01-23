# Versionamento Semântico - Backend

Este projeto adota o [Semantic Versioning 2.0.0](https://semver.org/) para todas as imagens Docker e releases.

## Princípios

O versionamento semântico segue o formato `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incrementado quando há mudanças incompatíveis na API
- **MINOR**: Incrementado quando funcionalidades são adicionadas de forma compatível
- **PATCH**: Incrementado quando correções de bugs compatíveis são feitas

## Estratégia de Versionamento

### Imagens Docker

A imagem Docker é versionada usando SemVer:

- **Backend**: `raphaelmoraes/digital-step-flow-backend:1.0.0`

### Tags Múltiplas

Cada build gera múltiplas tags:

- Versão completa: `1.2.3`
- Versão major: `1` (atualiza automaticamente para a última 1.x.x)
- Versão minor: `1.2` (atualiza automaticamente para a última 1.2.x)

## Versionamento no CI/CD

### GitHub Actions

O pipeline CI/CD extrai versões automaticamente:

1. **Tags Git**: Se um push contém uma tag `v1.0.0`, essa versão é usada
2. **Branches**: Para branches sem tag, usa `0.0.<short-sha>` (ex: `0.0.abc1234`)

### Criando uma Release

```bash
# 1. Atualize o código e faça commit
git add .
git commit -m "feat: nova funcionalidade"

# 2. Crie uma tag seguindo SemVer
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. Push da tag (dispara o build no CI/CD)
git push origin v1.0.0
```

## Atualização Automática de Manifests

O pipeline CI/CD atualiza automaticamente os manifests Kubernetes após cada build bem-sucedido:

1. **Quando ocorre**: Após merge de PR para `main` ou `develop` (não em PRs abertos)
2. **O que é atualizado**:
   - `k8s/kustomization.yaml` - Referência da imagem
   - `k8s/deployment.yaml` - Tag da imagem no deployment

3. **Como funciona**:
   - O job `update-k8s-manifests` roda após builds bem-sucedidos
   - Usa `kustomize edit set image` para atualizar as referências
   - Faz commit e push automático com mensagem `[skip ci]` para evitar loops

## Referências

- [Semantic Versioning 2.0.0](https://semver.org/)

