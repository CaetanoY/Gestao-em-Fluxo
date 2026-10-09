# Gestão em Fluxo

**Gestão em Fluxo** é um projeto open source para organizar solicitações, agendamentos e aprovações. Sua primeira aplicação é a programação de veículos, com estrutura que pode ser adaptada para outros processos.

Inclui calendário público, solicitações com login, painel administrativo e aplicativo Windows, com temas claro e escuro. Permite reservas por horário ou vários dias, indicação de urgência, gerenciamento de usuários, exportação para Excel e PDF e geração de resumos para WhatsApp. Utiliza API Cloudflare Worker com D1 e aplicativo Electron.

Esta versão é distribuída com base vazia, marca genérica e imagens ilustrativas. Cada instalação utiliza suas próprias contas, dados e credenciais. A identidade visual pode ser personalizada em `web/assets/logo.svg`; adaptações para outros recursos e processos exigem ajustes no código.

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

## Referências do projeto

- Design: [rtadewald/skills](https://github.com/rtadewald/skills), referência utilizada no ajuste da interface.
- Organização e qualidade do código: [vibe-coding-toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit). A licença das regras incorporadas está preservada em `eslint-rules/LICENSE`.

**Idealização e criação do projeto: Gabriel Caetano.**
