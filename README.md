# Start Química — Mocks CRM + AzulIA

Protótipos clicáveis (dados fictícios) baseados no resumo de reunião e nos protótipos de tela da Onze para a Start Química. Divididos em **dois produtos independentes**, cada um deployável separadamente:

| Pasta | Produto | Público | Login |
|---|---|---|---|
| [`web/`](web/) | Start CRM (desktop) | Diretores/Gerentes | `admin` / `admin` |
| [`app/`](app/) | App do RCA (mobile) | 750 Representantes Comerciais | `admin` / `admin` |

Cada pasta é 100% autocontida: `index.html` (HTML+CSS+JS puro, zero build, zero dependências), `server.js` (servidor Node minimalista), `package.json`, `Dockerfile`, `.dockerignore`. Login com sessão persistida no navegador (`localStorage`), efeitos de clique e ações que realmente mudam o estado do app (cockpit, agenda, visitas, leads, reativação, risco).

## Rodar localmente

Cada site roda independente, na porta que você definir via `PORT` (padrão 6000 — mas navegadores baseados em Chromium bloqueiam acesso local a `:6000`/`ERR_UNSAFE_PORT`, então para testar no navegador do computador use outra porta, ex. `PORT=6100`):

```bash
cd web && PORT=6100 npm start     # Start CRM em http://localhost:6100
cd app && PORT=6101 npm start     # App do RCA em http://localhost:6101
```

O app do RCA foi feito para ser aberto direto no celular: em telas largas (desktop) ele mostra uma moldura de celular para demonstração; em telas de celular de verdade (`max-width: 480px`) ele ocupa a tela inteira, como um app real.

## Deploy no EasyPanel (2 serviços separados)

Para **cada pasta** (`web/` e `app/`), crie um app separado no EasyPanel:

1. Aponte para a pasta correspondente do repositório (ou faça upload dela).
2. EasyPanel detecta o `Dockerfile` automaticamente.
3. Configure a **Porta** como `6000` (já exposta via `EXPOSE 6000` / `ENV PORT=6000` no Dockerfile — como são containers separados, não há conflito entre os dois usarem a mesma porta interna).
4. Deploy. Healthcheck em `GET /health` (retorna `ok`).
5. Dê domínios diferentes a cada app (ex. `crm.suaempresa.com` para o `web/` e `rca.suaempresa.com` para o `app/`).

Se preferir builder Nixpacks/Node em vez de Dockerfile: comando de start `node server.js`, porta `6000`, variável `PORT=6000`.

## O que está em cada mock

**`web/` — Start CRM:** Dashboard comercial, Cockpit de IA (AzulIA), Equipe & carteira, Mapa de mercado, Ranking de RCAs.

**`app/` — App do RCA:** Início (cartões / foco do dia por IA), Carteira com filtros, Cliente 360º (ficha + briefing de IA), Timeline, Agenda com fluxo de visita completo (check-in → objetivo → produtos → pedido → observações → fotos → resumo), Cadastro de lead com sugestão de IA, Reativação de base, Semáforo de clientes em risco.

Todos os textos e valores são fictícios, para validação de UX/UI antes da modelagem real no Salesforce.
