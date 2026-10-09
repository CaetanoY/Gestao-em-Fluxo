# Frota Modelo

Criado por **Gabriel Caetano**. Modelo open source de programação de veículos, com calendário público, solicitações autenticadas, administração e aplicativo Windows. Mantém o design com temas claro e escuro do projeto original.

Inclui reservas por horário, dia inteiro ou vários dias; aprovação de pedidos; urgência; gerenciamento de usuários; exportação Excel e PDF semanal; resumo para WhatsApp; API Cloudflare Worker com D1 e aplicativo Electron.

Esta distribuição tem base vazia, marca genérica e imagens ilustrativas. Não contém contas, programações, senha administrativa ou configurações da instalação original. Personalize a marca em `web/assets/logo.svg` e os exemplos de veículos/motorista no código.

## Executar localmente

Instale Node.js 24 e npm. No PowerShell 7, dentro desta pasta:

```powershell
npm ci
$env:FROTA_ADMIN_PASSWORD = Read-Host 'Senha administrativa (mínimo 10 caracteres)' -MaskInput
node scripts/setup-secret.mjs
Remove-Item Env:FROTA_ADMIN_PASSWORD
npm start
```

Abra http://localhost:8080. Não existe senha administrativa padrão. O servidor local atende somente este computador.

## Publicar na Cloudflare

Cada instalação deve ter sua própria conta, banco e credenciais:

```powershell
npx wrangler login
npx wrangler d1 create frota-modelo
```

Preencha o `database_id` em `wrangler.jsonc`. Escolha nomes disponíveis para Worker e banco; se mudar o nome do banco, use o mesmo nome no comando seguinte.

```powershell
npx wrangler d1 migrations apply frota-modelo --remote
Get-Content secrets/admin-hash.txt -Raw | npx wrangler secret put ADMIN_PASSWORD_HASH
npm run cf:deploy
```

Configure primeiro a senha pelo procedimento local acima. O deploy informa o endereço público. O uso está sujeito às cotas e condições do provedor.

## Aplicativo Windows

```powershell
npm run desktop
npm run build:win
```

O executável será gerado em `dist/`. Na primeira abertura, informe o endereço da sua API publicada. O aplicativo e o HTML usam a mesma base de dados; o aplicativo mantém uma cópia para consulta offline.

## Validar

```powershell
npm test
npm run lint
npm run verify:toolkit
```

## Compartilhar no GitHub

Crie um novo repositório público e envie somente esta pasta. Mantenha o repositório operacional privado. Não publique `.dev.vars`, `secrets/`, bases locais, dados reais ou arquivos de configuração com credenciais.

Licença MIT: consulte `LICENSE`. As regras ESLint derivam do [vibe-coding-toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), também MIT, com sua licença preservada em `eslint-rules/LICENSE`.

**Idealização e criação do projeto: Gabriel Caetano.**
