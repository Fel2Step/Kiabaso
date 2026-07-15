# Deploy do Kiabasso

## Pré-requisitos

- Conta em [GitHub](https://github.com)
- Conta em [Render](https://render.com) (back-end)
- Conta em [Vercel](https://vercel.com) (front-end)
- Conta em [TiDB Serverless](https://tidbcloud.com) (MySQL grátis)

---

## 1. Base de Dados (TiDB Serverless)

1. Aceder a https://tidbcloud.com → **Start Free** → criar cluster
2. Em **Connect** → criar utilizador e copiar string de conexão
3. Guardar: `host`, `port`, `user`, `password`, `database`

---

## 2. Backend (Render)

1. Fazer push do projecto para GitHub
2. Em https://render.com → **New +** → **Web Service**
3. Conectar repositório GitHub
4. Configurar:

   | Campo | Valor |
   |-------|-------|
   | **Root Directory** | `kiabasso-backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | Free |

5. Adicionar **Environment Variables** (valores do TiDB + os teus):

   ```
   NODE_ENV=production
   DB_HOST=         ← do TiDB
   DB_PORT=3306
   DB_USER=         ← do TiDB
   DB_PASSWORD=     ← do TiDB
   DB_NAME=         ← do TiDB
   JWT_SECRET=      ← gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   JWT_REFRESH_SECRET= ← outro hash
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=https://teu-projeto.vercel.app  ← (depois do passo 4)
   ```

6. **Deploy** → aguardar build
7. Guardar URL: `https://teu-backend.onrender.com`

### Executar migrações

```bash
# Local:
node scripts/prod-migrate.js

# Ou via Render Shell (após deploy):
# Ir ao dashboard do Render -> Shell -> correr:
node migrations/run.js
```

---

## 3. Frontend (Vercel)

1. Em https://vercel.com → **Add New** → **Project**
2. Importar mesmo repositório GitHub
3. Configurar:

   | Campo | Valor |
   |-------|-------|
   | **Root Directory** | `kiabasso-frontend` |
   | **Framework Preset** | Next.js |

4. **Environment Variables**:

   ```
   NEXT_PUBLIC_API_URL=https://teu-backend.onrender.com/api
   NEXT_PUBLIC_WS_URL=https://teu-backend.onrender.com
   NEXT_PUBLIC_APP_NAME=Kiabasso
   ```

5. **Deploy**
6. Guardar URL: `https://teu-projeto.vercel.app`

---

## 4. Actualizar FRONTEND_URL no Render

Voltar ao Render → Environment Variables → editar `FRONTEND_URL`:
```
FRONTEND_URL=https://teu-projeto.vercel.app
```

Fazer **Manual Deploy** → **Clear build cache & deploy**

---

## 5. (Opcional) Keep awake do Render Free

Render Free dorme após 15 min sem actividade.

Criar conta em https://cron-job.org → criar job:

- **URL**: `https://teu-backend.onrender.com/api/health`
- **Every**: `5 minutes`

---

## Testar

```
https://teu-projeto.vercel.app/api/health
```

Deve responder: `{ "success": true, "message": "Kiabasso API funcionando", ... }`
