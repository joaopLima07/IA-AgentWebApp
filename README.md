<p align="center">
  <img src="src/assets/logo-wordmark.png" alt="AI Nexus" width="320" />
</p>

# AI Nexus — Plataforma Empresarial de Agentes de IA (Frontend)

Frontend de nível de produção para uma plataforma SaaS B2B onde empresas configuram e conversam
com agentes de IA especializados. Construído com React, TypeScript, Vite, Tailwind CSS e shadcn/ui.

Este repositório contém apenas o frontend. O backend (Java 21 + Spring Boot) vive no
[repositório do backend](https://github.com/joaopLima07/IA-Agent-functioApp), e o
[repositório central](https://github.com/joaopLima07/IA-Agent) reúne a visão geral do projeto.

**Aplicação no ar:** https://witty-coast-0d3519b10.5.azurestaticapps.net

**Toda a aplicação fala com a API real**: autenticação, agentes, conversas (incluindo renomear,
arquivar e apagar), chat em streaming (SSE) e o painel de métricas. Já não existe camada de dados
simulada. Ferramentas, fontes de conhecimento e permissões dos agentes ainda não existem no
backend (ver [Limitações](#limitações-atuais)).

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Primeiros passos](#primeiros-passos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Rotas](#rotas)
- [Arquitetura](#arquitetura)
- [Integração com o backend](#integração-com-o-backend)
- [Fluxo de autenticação](#fluxo-de-autenticação)
- [Chat em streaming](#chat-em-streaming)
- [Limitações atuais](#limitações-atuais)
- [Decisões relevantes](#decisões-relevantes)
- [Deploy](#deploy)
- [Contribuir](#contribuir)

## Funcionalidades

- **Chat** — conversas em streaming (SSE) com Markdown (GFM), blocos de código com realce de
  sintaxe e indicador de escrita. O backend escolhe o agente que responde a cada mensagem.
- **Conversas** — listar, abrir (com as últimas mensagens e carregamento das mais antigas), criar,
  renomear, arquivar, desarquivar, apagar e pesquisar pelo título.
- **Agentes** — listar agentes e editar a configuração (nome, descrição, estado, fornecedor e nome
  do modelo, temperatura, máximo de tokens, prompt de sistema, visibilidade). Só `OWNER` e `ADMIN`
  podem editar.
- **Dashboard** — cartões de métricas e gráficos Recharts: conversas ao longo do tempo, uso por
  agente, uso de tokens e tempo de resposta. Visível só para `OWNER` e `ADMIN`.
- **Autenticação** — login, registo, recuperação e redefinição de palavra-passe por código de
  e-mail, restauro de sessão e renovação automática do token.
- **Definições** — perfil da conta.
- **Tema** — claro, escuro ou do sistema; persistido e aplicado sem "flash" no carregamento.
- **Responsivo** — barra lateral no desktop e gaveta (drawer) no mobile.

## Stack

| Área | Tecnologia |
| --- | --- |
| Framework | React 19, TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v4, shadcn/ui (primitivos Radix), `class-variance-authority`, `tailwind-merge` |
| Rotas | React Router 7 |
| Estado do servidor | TanStack Query |
| Validação | Zod |
| Ícones | Lucide React |
| Markdown | `react-markdown`, `remark-gfm`, `rehype-highlight`, `rehype-raw` |
| Gráficos | Recharts |
| Notificações | Sonner |
| Datas | date-fns |
| Lint | oxlint |

## Primeiros passos

### Pré-requisitos

- Node.js 20 ou superior (recomendado 24) e npm
- O backend Spring Boot a correr em `http://localhost:8080` (ver o README do
  [repositório do backend](https://github.com/joaopLima07/IA-Agent-functioApp)); sem ele, o login
  e as restantes telas falham

### Instalar e executar

```bash
npm install
npm run dev       # inicia o servidor de desenvolvimento
```

Abre o URL que o Vite mostrar (o servidor escuta em todas as interfaces, por isso também fica
acessível a partir de outros dispositivos da rede).

Em desenvolvimento, os pedidos a `/api` passam por um proxy para `http://localhost:8080`, pelo que
o browser não faz pedidos cross-origin e o backend não precisa de configuração de CORS. Para apontar
para outro backend:

```bash
# bash
VITE_PROXY_TARGET=http://localhost:9090 npm run dev
# PowerShell
$env:VITE_PROXY_TARGET = "http://localhost:9090"; npm run dev
```

## Variáveis de ambiente

Há uma variável de build, lida em [src/services/config.ts](src/services/config.ts), e uma de
desenvolvimento, lida por [vite.config.ts](vite.config.ts). Ambas são opcionais. Há um exemplo em
[.env.example](.env.example).

| Variável | Valor por omissão | Descrição |
| --- | --- | --- |
| `VITE_API_BASE_URL` | vazio | Origem do backend, sem barra final e **sem** `/api` (ex.: `https://minha-api.azurewebsites.net`). Vazia, os pedidos vão para caminhos relativos `/api/...`, atendidos pelo proxy do Vite. É gravada no bundle no build |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Destino do proxy de `/api` em desenvolvimento |

Coloca as alterações num ficheiro `.env.local` (ignorado pelo git através de `*.local`). As rotas
(`/api/auth`, `/api/agents`, `/api/conversations`, `/api/panel`) são fixas em `config.ts`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite com hot reload |
| `npm run build` | Verifica os tipos (`tsc -b`) e gera o build de produção em `dist/` |
| `npm run preview` | Serve localmente o build de produção |
| `npm run lint` | Analisa o projeto com oxlint (configuração em `.oxlintrc.json`) |

## Rotas

| Caminho | Página | Acesso |
| --- | --- | --- |
| `/login` | Login | Apenas público |
| `/register` | Registo | Apenas público |
| `/forgot-password` | Recuperar palavra-passe | Apenas público |
| `/reset-password` | Redefinir palavra-passe | Apenas público |
| `/` | Novo chat | Autenticado |
| `/c/:conversationId` | Conversa existente | Autenticado |
| `/dashboard` | Dashboard de utilização | `OWNER` ou `ADMIN` (os outros voltam para `/`) |
| `/agents` | Lista de agentes | Autenticado |
| `/agents/:agentId` | Configuração do agente | Autenticado |
| `/settings` | Definições | Autenticado |
| `/404` | Não encontrado (qualquer caminho desconhecido redireciona para aqui) | Qualquer |

As rotas "apenas públicas" redirecionam utilizadores autenticados para a aplicação; as rotas
protegidas redirecionam utilizadores anónimos para `/login`, e `OwnerAdminRoute` restringe o dashboard a `OWNER`/`ADMIN` (ver [src/routes/](src/routes)). Essa restrição é só de interface: o backend ainda não verifica o papel.

## Arquitetura

```
src/
├── components/
│   ├── ui/            primitivos shadcn/ui (button, dialog, table, tabs, …)
│   ├── layout/        estrutura da app: header, sidebar, drawer mobile, navegação, menus de utilizador e notificações
│   └── common/        UI partilhada: PageHeader, EmptyState, ErrorState, PageLoader, Toaster
├── features/
│   ├── chat/          renderização de mensagens, markdown/código, cartões de tool calls, hook e serviço de streaming (SSE)
│   ├── conversations/ lista de conversas, pesquisa, renomear, arquivar, apagar
│   ├── agents/        cartões de agentes, badge de estado, configuração
│   ├── dashboard/     cartões de métricas + gráficos Recharts
│   └── auth/          fluxos de login/registo/recuperação + AuthContext (useAuth)
├── services/          camada de transporte: api.ts (cliente fetch), sse.ts (transporte EventSource, hoje sem uso), config.ts
├── hooks/             hooks partilhados (tema, media query, local storage)
├── layouts/           AppLayout (estrutura autenticada), AuthLayout
├── pages/             componentes ao nível da rota, um por ecrã
├── routes/            guardas ProtectedRoute / PublicOnlyRoute
├── lib/               utilitários: utils (cn), formatação de datas e números, permissões por papel
├── types/             modelos de domínio partilhados (Message, Agent, Conversation, User, eventos SSE, …)
└── assets/            logótipos
```

Cada pasta de feature contém os seus próprios `components/`, `hooks/`, `services/` e `types/` —
UI, lógica de negócio, obtenção de dados e tipagem ficam separadas, de modo a que uma feature possa
ser estendida (ou reescrita) sem afetar as outras.

O alias `@` aponta para `src/` (configurado em `vite.config.ts` e nos ficheiros tsconfig), por
exemplo `import { cn } from "@/lib/utils"`.

## Integração com o backend

| Funcionalidade | Serviço | Rotas |
| --- | --- | --- |
| Autenticação (registo, login, me, refresh, logout, recuperar/redefinir palavra-passe) | `authService` | `/api/auth/*` |
| Agentes (listar, obter, atualizar) | `agentService` | `/api/agents` |
| Conversas (listar, obter, mensagens anteriores, criar, renomear, arquivar, desarquivar, apagar) | `conversationService` | `/api/conversations` |
| Chat em streaming | `aiService` | `POST /api/conversations/{id}/messages` (SSE) |
| Métricas do dashboard | `dashboardService` | `/api/panel/*` |

Cada serviço expõe funções assíncronas simples (`getAll()`, `create()`, `delete()`, …) sobre o
`apiClient` de `services/api.ts` e mapeia os DTOs da API para os tipos de domínio do frontend (ver
[agentService.ts](src/features/agents/services/agentService.ts) como exemplo). O `apiClient` é um
wrapper fino sobre `fetch`: JSON de entrada e saída, cabeçalho com bearer token, `ApiRequestError`
tipado e renovação transparente do token em caso de `401`.

## Fluxo de autenticação

- `POST /api/auth/login` devolve um `accessToken` de curta duração (e `expiresIn`); o refresh token
  é um **cookie httpOnly** e nunca é legível a partir de JavaScript.
- O access token e a sessão ficam no `localStorage` (`access_token`, `auth_session`).
  `GET /api/auth/me` fornece o perfil do utilizador (id, nome completo, email, telefone, papel).
- Quando um pedido devolve `401`, o `apiClient` chama `POST /api/auth/refresh` uma vez (pedidos
  concorrentes partilham a mesma chamada), guarda o novo token e repete o pedido.
- A recuperação de palavra-passe tem três passos: `forgotPassword` → `verifyResetCode` (devolve um
  token de redefinição) → `resetPassword`.
- `types/user.ts` define `AuthSession`, `Permission` e um mapa papel → permissões, prontos para
  aplicar RBAC na interface.

## Chat em streaming

`features/chat/services/aiService.ts` envia `POST /api/conversations/{id}/messages` com
`{ "content": "..." }` e lê a resposta como Server-Sent Events. Como `EventSource` não faz `POST`
nem envia o cabeçalho `Authorization`, o serviço usa `fetch` e interpreta o fluxo à mão (com uma
nova tentativa depois de renovar o token em caso de `401`).

- Cada evento `data:` traz um pedaço de texto puro, convertido num evento `token`.
- Um evento nomeado `error` (`{ code, message }`) interrompe a resposta e mostra a mensagem de erro.
- Falhas antes do início do fluxo chegam como JSON normal; erros de validação (`400`) mostram o
  limite de caracteres da mensagem (`MAX_MESSAGE_LENGTH`).
- O backend grava as duas mensagens, por isso, no fim do fluxo, a conversa é recarregada.

O hook `useChatStream` consome a união `StreamEvent` (`message_start` · `token` · `tool_start` ·
`tool_end` · `message_end` · `error`). Os eventos de ferramentas e os cartões de tool call
(`ToolCallCard`) já estão prontos na interface, mas o backend ainda não os emite.

## Limitações atuais

- A listagem de conversas devolve só `id`, `title` e `status`: não há data de atividade nem
  pré-visualização da última mensagem, por isso a lista não é ordenada por data.
- A pesquisa de conversas filtra apenas pelo título.
- O gráfico de resultados de ferramentas (`ToolOutcomesChart`) existe, mas não está no dashboard,
  porque o backend não tem tool calling.
- O papel do utilizador só controla a interface (dashboard e edição de agentes); o backend não
  verifica o papel.
- Ferramentas, fontes de conhecimento e permissões dos agentes não existem no backend.

## Decisões relevantes

- **Autenticação** com JWT de curta duração + cookie de refresh `HttpOnly`; o papel (`OWNER`,
  `ADMIN`, `MEMBER`) controla o que a interface mostra.
- **Tool calls** exibidas como cartões expansíveis (estados `RUNNING` / `SUCCESS` / `ERROR`),
  com parâmetros de nome aparentemente sensível ocultados; aguardam suporte do backend.
- **Tema** claro, escuro ou do sistema, persistido em `localStorage` e aplicado imediatamente (sem
  "flash") através de um `ThemeProvider`.
- **Gráficos** sem escalas de eixo duplo, com um único tom por medida e verde/vermelho reservados
  exclusivamente para sucesso/falha (nunca como cor genérica de série).
- **Estado do servidor** gerido pelo TanStack Query, com fábricas de query keys por feature, para
  que a invalidação de cache fique local a cada feature.
- **Formulários** validados com esquemas Zod (por exemplo `features/auth/types/schemas.ts`).

## Deploy

A aplicação é uma SPA estática. Um workflow do GitHub Actions
([.github/workflows](.github/workflows)) faz o build e o deploy para o **Azure Static Web Apps** a
cada push para `main`, cria ambientes de pré-visualização para pull requests e remove-os quando o
PR é fechado. Configuração de build: localização da app `/`, localização de saída `dist`.

Em produção a SPA e a API ficam em sites diferentes. O workflow define `VITE_API_BASE_URL` com a
origem do Function App do backend, e o backend precisa ter a origem do Static Web App liberada em
CORS (com credenciais, por causa do cookie de refresh). O proxy do Vite só existe em
desenvolvimento. O [`public/staticwebapp.config.json`](public/staticwebapp.config.json) devolve
`index.html` para caminhos desconhecidos, como exige uma SPA com rotas no cliente.

## Contribuir

1. Cria um branch a partir de `main`.
2. Faz a alteração, seguindo a estrutura de pastas por feature descrita acima.
3. Executa `npm run lint` e `npm run build` — ambos têm de passar.
4. Abre um pull request para `main`.
