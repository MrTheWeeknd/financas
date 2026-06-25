# Deploy

Este repositório é um monorepo com a aplicação principal em `frontend/`:

- `frontend/`: aplicação Next.js + API serverless em Route Handlers para hospedar na Vercel.
- `backend/`: API Express legada/opcional, mantida como alternativa local ou para outro provedor.

## Aplicação na Vercel

Na Vercel, importe o repositório e configure:

- Framework Preset: `Next.js`
- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: deixe vazio/não preenchido. Não coloque `.next`, `frontend/.next` nem `public`.

Não use `npm --prefix frontend ...` quando o `Root Directory` já estiver configurado como `frontend`, porque a Vercel passa a executar os comandos dentro dessa pasta.

Não crie configuração manual de `functions` para `app/api/...` no painel ou em `frontend/vercel.json`. Os Route Handlers do Next são detectados automaticamente pela Vercel.

Se aparecer `ENOENT: no such file or directory, lstat '/vercel/path0/.next/package.json'` mesmo com o log mostrando `Build Completed in /vercel/output`, a falha está depois do build, na etapa de empacotar o output.

Nesse caso, no painel da Vercel:

1. Abra `Project Settings > Build and Development Settings`.
2. Em `Output Directory`, clique em `Override` se existir.
3. Apague qualquer valor como `.next`, `frontend/.next`, `public` ou `/vercel/path0/.next`.
4. Salve com o campo vazio ou use `Reset to Default`.
5. Faça um redeploy com `Redeploy > Use existing Build Cache` desmarcado.

Esse erro costuma acontecer quando a Vercel tenta tratar `.next` como saída manual em vez de usar a integração nativa de Next.js. Para Next.js na Vercel, quem gera o output final é a própria integração, em `/vercel/output`.

Se aparecer `No Output Directory named "public" found after the Build completed`, a Vercel está tratando o projeto como saída estática/manual. Corrija o `Framework Preset` para `Next.js`, apague o `Output Directory` e faça redeploy sem cache.

Variável de ambiente obrigatória:

```env
MONGODB_URI=mongodb+srv://...
```

O backend foi adaptado para Route Handlers do Next.js em `frontend/app/api`, então não é necessário hospedar um Express separado para usar a aplicação na Vercel.

Variável opcional:

```env
NEXT_PUBLIC_API_URL=https://url-de-uma-api-externa
```

Se ela não existir, o app usa a API interna do próprio deploy.

## Backend Express legado

O diretório `backend/` continua existindo como servidor Express para desenvolvimento/alternativa de hospedagem externa, mas não é mais necessário para o deploy principal na Vercel.

Configure no provedor do backend:

```env
PORT=3001
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://url-do-seu-frontend.vercel.app
```

Comandos:

```bash
npm install
npm run build
npm run start
```

## Por que o deploy estava falhando/confuso

A raiz do repositório ainda contém um app Next.js de template. Se a Vercel usar a raiz como projeto, ela executa o `package.json` da raiz e não o app real em `frontend/`.

O caminho correto é configurar o projeto da Vercel com `Root Directory = frontend`.
