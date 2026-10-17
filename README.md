![AI Nexus](src/assets/logo-wordmark.png)

# AI Nexus — Enterprise AI Agent Platform (Frontend)

A production-grade frontend for a B2B SaaS platform where companies configure and converse
with specialized AI agents. Built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
The backend (Java 21 + Spring Boot) does not exist yet — every data operation runs through a
mock service layer designed to be swapped for real HTTP calls without touching a single
component.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and produce a production build
npm run preview   # preview the production build locally
```

There's no login backend — enter any valid-looking email and an 8+ character password on
`/login` to get a mock session.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (Radix primitives) · React Router ·
TanStack Query · Zod · Lucide React · react-markdown + rehype-highlight · Recharts

## Architecture

```
src/
├── components/
│   ├── ui/            shadcn/ui primitives (button, dialog, table, tabs, …)
│   ├── layout/         app shell: header, sidebar, mobile drawer, nav
│   └── common/          cross-feature UI: PageHeader, EmptyState, ErrorState, Toaster
├── features/
│   ├── chat/            message rendering, streaming hook, mock AI service
│   ├── conversations/   conversation list, search, archive/delete
│   ├── agents/           agent cards, configuration tabs
│   ├── knowledge/        document table, upload flow
│   ├── dashboard/         stat tiles + Recharts charts
│   ├── auth/             login/register/forgot-password + AuthContext
│   └── settings/          (settings page composes shared UI directly)
├── services/           transport-layer abstractions (api.ts, sse.ts, config.ts)
├── hooks/               cross-feature hooks (theme, media query, local storage)
├── layouts/             AppLayout (authenticated shell), AuthLayout
├── pages/                route-level components, one per screen
├── routes/               ProtectedRoute / PublicOnlyRoute guards
├── mocks/                realistic seed data (agents, conversations, documents, metrics)
└── types/                shared domain models (Message, Agent, Conversation, …)
```

Each feature folder owns its `components/`, `hooks/`, `services/`, and `types/` — UI,
business logic, data-fetching, and typing stay separated so a feature can be extended (or
rewritten) without rippling into the others.

## Swapping mocks for the real backend

Every service (`conversationService`, `agentService`, `knowledgeService`, `dashboardService`,
`authService`) exposes plain async functions — `getAll()`, `create()`, `delete()`, and so on —
that currently resolve against in-memory arrays seeded from `src/mocks/`. A real implementation
backed by `services/api.ts` (already wired for JWT bearer auth) can replace the body of each
method without changing a single call site, hook, or component.

Streaming works the same way: `features/chat/services/aiService.ts` emits the exact
`StreamEvent` union (`message_start`, `token`, `tool_start`, `tool_end`, `message_end`, `error`)
that the real backend is expected to send over Server-Sent Events. `services/sse.ts` already
implements a real `EventSource`-based transport matching the same interface — swapping the mock
generator for a live connection is a one-file change in `useChatStream`.

## Notable decisions

- **Auth** is mocked but structured for JWT + refresh tokens + OAuth2 + RBAC
  (`types/user.ts` has `AuthSession`, `Permission`, and role→permission maps ready to enforce).
- **Tool calls** render as an expandable card with `RUNNING` / `SUCCESS` / `ERROR` states,
  parameters, results, and execution time — sensitive-looking parameter keys are redacted.
- **Theme** supports light, dark, and system, persisted to `localStorage` and reflected
  immediately (no flash) via a `ThemeProvider` context.
- **Charts** avoid dual-axis scales, use a single hue per measure, and reserve
  green/red exclusively for success/failure status (never as a generic series color).
