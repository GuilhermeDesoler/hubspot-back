# Backend NestJS - Integração HubSpot + MongoDB

Backend completo para gerenciar opções customizadas no HubSpot através de API REST com persistência em MongoDB.

## 🎯 POC Ready!

**✅ Sistema pronto para testar!**

```bash
npm install
npm run start:dev
./test-poc.sh  # Teste automatizado completo
```

Veja [README_POC.md](README_POC.md) para guia completo da POC.

## 🚀 Funcionalidades

- ✅ **MongoDB Integration** - Persistência com Mongoose
- ✅ **HubSpot API** - Sincronização automática
- ✅ **REST API** - 8 endpoints completos
- ✅ **Validações** - Prevenção de duplicatas
- ✅ **Scripts de Teste** - Testes automatizados
- ✅ **Health Check** - Monitoramento de conexões

## 📋 Pré-requisitos

- Node.js v18 ou superior
- NPM ou Yarn
- Conta HubSpot com acesso à API
- Token de acesso do HubSpot

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e adicione seu token do HubSpot:

```env
HUBSPOT_ACCESS_TOKEN=seu-token-aqui
PORT=3000
DEFAULT_OBJECT_TYPE=contacts
DEFAULT_PROPERTY_NAME=sua_propriedade_customizada
```

## 🏗️ Estrutura do Projeto

```
back/
├── src/
│   ├── hubspot/
│   │   ├── hubspot.controller.ts    # Endpoints da API
│   │   ├── hubspot.service.ts       # Lógica de integração HubSpot
│   │   └── hubspot.module.ts        # Módulo NestJS
│   ├── app.module.ts                # Módulo principal
│   └── main.ts                      # Entry point
├── .env.example                      # Exemplo de variáveis
├── tsconfig.json                     # Configuração TypeScript
└── package.json
```

## 🔨 Como Usar

### Desenvolvimento

```bash
npm run start:dev
```

### Build para Produção

```bash
npm run build
npm run start:prod
```

## 📡 Endpoints da API

### 1. Adicionar Opção
**POST** `/api/add-option`

Adiciona uma nova opção à propriedade do HubSpot.

```json
{
  "name": "Novo Status",
  "value": "novo_status",
  "objectType": "contacts",
  "propertyName": "status_customizado"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Opção adicionada e sincronizada com sucesso",
  "data": { ... }
}
```

### 2. Sincronizar com HubSpot
**POST** `/api/sync-to-hubspot`

Sincroniza todas as opções do banco externo com o HubSpot.

```json
{
  "objectType": "contacts",
  "propertyName": "status_customizado"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "5 opções sincronizadas com sucesso"
}
```

### 3. Buscar Opções Externas
**GET** `/api/external-options`

Retorna todas as opções salvas no banco de dados externo.

### 4. Buscar Opções do HubSpot
**GET** `/api/hubspot-options`

Retorna as opções atuais de uma propriedade no HubSpot.

## 🔐 Obtendo o Token do HubSpot

1. Acesse sua conta HubSpot
2. Vá em **Settings** > **Integrations** > **Private Apps**
3. Crie um novo Private App
4. Adicione as permissões necessárias:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.schemas.contacts.read`
   - `crm.schemas.contacts.write`
5. Copie o Access Token gerado

## 🎯 Integração com Iframe do HubSpot

No seu iframe do HubSpot Card, faça requisições para este backend:

```javascript
// Adicionar nova opção
fetch('http://localhost:3000/api/add-option', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nova Opção',
    value: 'nova_opcao'
  })
});

// Sincronizar
fetch('http://localhost:3000/api/sync-to-hubspot', {
  method: 'POST'
});
```

## 📝 Próximos Passos

### Banco de Dados Real

Atualmente, o projeto usa um mock de banco de dados em memória. Para produção, integre com:

- **PostgreSQL + TypeORM**
- **MongoDB + Mongoose**
- **Prisma ORM**

### Exemplo com TypeORM:

```bash
npm install @nestjs/typeorm typeorm pg
```

Crie uma entidade:

```typescript
// src/entities/option.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column({ default: false })
  synced: boolean;

  @Column()
  createdAt: Date;
}
```

## 🐛 Troubleshooting

### Erro de CORS
Verifique se o domínio do HubSpot está permitido em `src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://app.hubspot.com', 'https://app-eu1.hubspot.com']
});
```

### Erro de Autenticação
Verifique se o token do HubSpot está correto no arquivo `.env`.

## 📄 Licença

ISC
