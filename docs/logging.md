# Guia de Logging Estruturado - Backend

Este documento descreve os princípios e práticas de logging estruturado implementadas no backend.

## Princípios Fundamentais

### 1. Log para stdout e stderr

**Este é o método recomendado e mais comum no Kubernetes.** O container runtime (ex: Docker, containerd) captura esses streams e os salva em arquivos no nó host, que são gerenciados pelo kubelet.

- **stdout**: Use para mensagens rotineiras (INFO, DEBUG)
- **stderr**: Use para erros e exceções (ERROR, WARN)

### 2. Formato JSON

O JSON fornece um formato consistente e padronizado que é fácil para máquinas analisarem, pesquisarem e processarem.

**Estrutura padrão de log:**
```json
{
  "timestamp": "2025-01-29T12:34:56Z",
  "level": "INFO",
  "service": "digital-step-flow-backend",
  "message": "User login successful",
  "request_id": "abc-123",
  "user_id": "42"
}
```

**Campos obrigatórios:**
- `timestamp`: ISO 8601 timestamp
- `level`: DEBUG, INFO, WARN, ERROR
- `service`: Nome do serviço
- `message`: Mensagem descritiva do evento

**Campos contextuais comuns:**
- `request_id`: ID único para rastrear requisições
- `user_id`: ID do usuário (quando aplicável)
- `method`: Método HTTP
- `path`: Caminho da requisição
- `status_code`: Código de status HTTP
- `duration_ms`: Duração da requisição em milissegundos

## Implementação

### Logger

O logger está implementado em `src/utils/logger.ts`:

```typescript
import { logger } from './utils/logger'

// Log simples
logger.info('Operação realizada com sucesso')

// Log com contexto
logger.info('User login successful', {
  request_id: 'abc-123',
  user_id: '42',
  email: 'user@example.com'
})

// Log de erro
logger.error('Falha ao processar requisição', {
  request_id: 'abc-123',
  error: error.message,
  stack: error.stack
})
```

### Middleware de Request Logger

O middleware `requestLogger` automaticamente:
- Gera um `request_id` único para cada requisição
- Registra requisições de entrada
- Registra conclusão de requisições com métricas
- Inclui `user_id` quando disponível (após autenticação)

**Uso:**
```typescript
import { requestLogger } from './middleware/requestLogger.middleware'

app.use(requestLogger)
```

## Níveis de Log

- **DEBUG**: Informações detalhadas para debugging (desenvolvimento)
- **INFO**: Informações gerais sobre operações normais
- **WARN**: Avisos sobre situações que podem precisar de atenção
- **ERROR**: Erros que requerem atenção imediata

## Variáveis de Ambiente

- `SERVICE_NAME`: Nome do serviço usado nos logs (padrão: `digital-step-flow-backend`)
- `NODE_ENV`: Ambiente (development/production) - afeta nível de detalhe dos logs

## Acessando Logs

### Desenvolvimento Local

```bash
# Logs diretos do processo
npm run dev

# Logs via Docker
docker-compose logs -f backend
```

### Kubernetes

```bash
# Logs do deployment
kubectl logs -n digital-step-flow deployment/digital-step-flow-backend

# Logs em tempo real
kubectl logs -f -n digital-step-flow deployment/digital-step-flow-backend
```

