<p align="center">
  <img src="src/assets/logo-wordmark.png" alt="AI Nexus" width="320" />
</p>

# AI Nexus — Plataforma Empresarial de Agentes de IA (Frontend)

Frontend de nível de produção para uma plataforma SaaS B2B onde empresas configuram e conversam
com agentes de IA especializados. Construído com React, TypeScript, Vite, Tailwind CSS e shadcn/ui.

Este repositório contém apenas o frontend. O backend (Java 21 + Spring Boot) vive noutro
repositório, e o repositório central reúne a visão geral do projeto.

O backend está a ser integrado de forma incremental. **Autenticação,
Agentes e Conversas (listar, abrir e criar) já comunicam com a API real**; o envio de mensagens
(chat em streaming), arquivar/apagar conversas e o Dashboard ainda usam uma camada de serviços
simulada (mock) em memória, pensada para ser trocada por chamadas HTTP reais sem alterar nenhum
componente.

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Primeiros passos](#primeiros-passos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Rotas](#rotas)
- [Arquitetura](#arquitetura)
- [Estado da integração com o backend](#estado-da-integração-com-o-backend)
- [Trocar os mocks pelo backend real](#trocar-os-mocks-pelo-backend-real)
- [Fluxo de autenticação](#fluxo-de-autenticação)
- [Chat em streaming](#chat-em-streaming)
- [Decisões relevantes](#decisões-relevantes)
- [Deploy](#deploy)
- [Contribuir](#contribuir)

## Funcionalidades

- **Chat** — conversas com um agente selecionado, em streaming token a token, com Markdown (GFM),
  blocos de código com realce de sintaxe e indicador de escrita.
- **Chamadas de ferramentas (tool calls)** — exibidas como cartões expansíveis com os estados
  `RUNNING` / `SUCCESS` / `ERROR`, parâmetros, resultados e tempo de execução. Parâmetros com
  nomes que parecem sensíveis são ocultados.
- **Conversas** — listar, abrir (com as últimas mensagens), criar e pesquisar pelo título contra a
  API real; arquivar e apagar ainda são simulados.
- **Agentes** — listar agentes e editar a configuração (nome, descrição, estado, fornecedor e nome
  do modelo, temperatura, máximo de tokens, prompt de sistema, visibilidade).
- **Dashboard** — cartões de métricas e gráficos Recharts: conversas ao longo do tempo, uso por
  agente, uso de tokens, tempo de resposta e resultados das ferramentas.
- **Autenticação** — login, registo, recuperação e redefinição de palavra-passe, restauro de sessão
  e renovação automática do token.
- **Definições** — conta e preferências, incluindo o tema.
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
- Opcional: o backend Spring Boot a correr em `http://localhost:8080` para usar autenticação e
  agentes reais

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

Todas são opcionais. São lidas em [src/services/config.ts](src/services/config.ts) (exceto
`VITE_PROXY_TARGET`, lida por [vite.config.ts](vite.config.ts) ao iniciar o servidor de
desenvolvimento).

| Variável | Valor por omissão | Descrição |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | URL base das chamadas gerais à API |
| `VITE_AUTH_API_BASE_URL` | `/api/auth` | URL base dos endpoints de autenticação |
| `VITE_AGENTS_API_BASE_URL` | `/api/agents` | URL base dos endpoints de agentes |
| `VITE_CONVERSATIONS_API_BASE_URL` | `/api/conversations` | URL base dos endpoints de conversas |
| `VITE_SSE_URL` | `/api/v1/stream` | Endpoint Server-Sent Events do chat em streaming |
| `VITE_USE_MOCKS` | `true` | Interruptor da camada de mocks |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Destino do proxy de `/api` em desenvolvimento |

Coloca as alterações num ficheiro `.env.local` (ignorado pelo git através de `*.local`).

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
| `/dashboard` | Dashboard de utilização | Autenticado |
| `/agents` | Lista de agentes | Autenticado |
| `/agents/:agentId` | Configuração do agente | Autenticado |
| `/settings` | Definições | Autenticado |
| `/404` | Não encontrado (qualquer caminho desconhecido redireciona para aqui) | Qualquer |

As rotas "apenas públicas" redirecionam utilizadores autenticados para a aplicação; as rotas
protegidas redirecionam utilizadores anónimos para `/login` (ver [src/routes/](src/routes)).

## Arquitetura

```
src/
├── components/
│   ├── ui/            primitivos shadcn/ui (button, dialog, table, tabs, …)
│   ├── layout/        estrutura da app: header, sidebar, drawer mobile, navegação, menus de utilizador e notificações
│   └── common/        UI partilhada: PageHeader, EmptyState, ErrorState, PageLoader, Toaster
├── features/
│   ├── chat/          renderização de mensagens, markdown/código, cartões de tool calls, hook de streaming, serviço de IA simulado
│   ├── conversations/ lista de conversas, pesquisa, arquivar/apagar
│   ├── agents/        cartões de agentes, badge de estado, configuração
│   ├── dashboard/     cartões de métricas + gráficos Recharts
│   └── auth/          fluxos de login/registo/recuperação + AuthContext (useAuth)
├── services/          camada de transporte: api.ts (cliente fetch), sse.ts (EventSource), config.ts
├── hooks/             hooks partilhados (tema, media query, local storage)
├── layouts/           AppLayout (estrutura autenticada), AuthLayout
├── pages/             componentes ao nível da rota, um por ecrã
├── routes/            guardas ProtectedRoute / PublicOnlyRoute
├── lib/               utilitários: utils (cn), formatação de datas e números
├── mocks/             dados de exemplo realistas (agentes, conversas, documentos, métricas, utilizador)
├── types/             modelos de domínio partilhados (Message, Agent, Conversation, User, eventos SSE, …)
└── assets/            logótipos
```

Cada pasta de feature contém os seus próprios `components/`, `hooks/`, `services/` e `types/` —
UI, lógica de negócio, obtenção de dados e tipagem ficam separadas, de modo a que uma feature possa
ser estendida (ou reescrita) sem afetar as outras.

O alias `@` aponta para `src/` (configurado em `vite.config.ts` e nos ficheiros tsconfig), por
exemplo `import { cn } from "@/lib/utils"`.

## Estado da integração com o backend

| Funcionalidade | Serviço | Origem |
| --- | --- | --- |
| Autenticação (registo, login, me, refresh, logout, recuperar/redefinir palavra-passe) | `authService` | **API real** (`/api/auth/*`) |
| Agentes (listar, obter, atualizar) | `agentService` | **API real** (`/api/agents`) |
| Conversas (listar, obter com mensagens, mensagens anteriores, criar) | `conversationService` | **API real** (`/api/conversations`) |
| Conversas (arquivar, desarquivar, apagar) | `conversationService` | Mock (sem rota no backend) |
| Chat em streaming | `aiService` | Mock |
| Métricas do dashboard | `dashboardService` | Mock |

Limitações atuais da integração de conversas:

- A listagem devolve só `id`, `title` e `status`. Sem data de atividade nem pré-visualização da
  última mensagem, a lista não é ordenada por data e mostra "Nenhuma mensagem ainda".
- O backend escolhe o agente a cada mensagem, por isso a criação não envia `agentId`. Enquanto o
  envio de mensagens não for ligado à API, a conversa usa um agente mockado como substituto para o
  chat simulado continuar a funcionar.
- A pesquisa de conversas filtra apenas pelo título.

Os serviços simulados resolvem contra arrays em memória preenchidos a partir de `src/mocks/` e
simulam latência de rede (cerca de 450 ms mais até 200 ms de variação), para que os estados de
carregamento e os skeletons sejam visíveis.

## Trocar os mocks pelo backend real

Cada serviço (`conversationService`, `agentService`, `dashboardService`,
`authService`) expõe funções assíncronas simples — `getAll()`, `create()`, `delete()`, etc.
`agentService`, `authService` e, em parte, `conversationService` já estão implementados sobre
`services/api.ts`; a mesma abordagem aplica-se aos restantes:

1. Implementa os métodos do serviço com `apiClient.get/post/put/...` (ver
   [agentService.ts](src/features/agents/services/agentService.ts) como exemplo, incluindo o
   mapeamento dos DTOs da API para os tipos de domínio do frontend).
2. Mantém as assinaturas das funções exportadas, para que nenhum ponto de chamada, hook ou
   componente mude.
3. Remove os dados de exemplo correspondentes em `src/mocks/` quando já não forem usados.

O `apiClient` é um wrapper fino sobre `fetch`: JSON de entrada e saída, cabeçalho com bearer
token, `ApiRequestError` tipado e renovação transparente do token em caso de `401`.

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

`features/chat/services/aiService.ts` emite exatamente a união `StreamEvent` que o backend deverá
enviar por Server-Sent Events:

`message_start` · `token` · `tool_start` · `tool_end` · `message_end` · `error`

`services/sse.ts` já implementa um transporte real baseado em `EventSource` com a mesma interface,
pelo que trocar o gerador simulado por uma ligação real é uma alteração num único ficheiro, em
`useChatStream`. Os cenários de demonstração (incluindo tool calls) estão em
`features/chat/services/scenarios.ts`.

## Decisões relevantes

- **Autenticação** real, estruturada para JWT + cookie de refresh + RBAC, com OAuth2 como extensão
  planeada.
- **Tool calls** exibidas como cartões expansíveis; parâmetros com nomes aparentemente sensíveis
  são ocultados.
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

Como a app é uma SPA com rotas no cliente, o alojamento tem de devolver `index.html` para caminhos
desconhecidos, e `/api` tem de ser encaminhado para o backend (o proxy do Vite não existe em
produção).

## Contribuir

1. Cria um branch a partir de `main`.
2. Faz a alteração, seguindo a estrutura de pastas por feature descrita acima.
3. Executa `npm run lint` e `npm run build` — ambos têm de passar.
4. Abre um pull request para `main`.
