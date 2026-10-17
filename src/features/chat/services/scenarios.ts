export interface ScenarioToolCall {
  tool: string;
  label: string;
  parameters: Record<string, unknown>;
  result?: Record<string, unknown> | string;
  errorMessage?: string;
  durationMs: number;
  outcome: "SUCCESS" | "ERROR";
}

export interface Scenario {
  match: RegExp;
  agentId: string;
  toolCalls: ScenarioToolCall[];
  response: string;
}

export const scenarios: Scenario[] = [
  {
    match: /order.*#?(\d{4,6})|status of (my )?order|track(ing)? (my )?order|pedido.*#?(\d{4,6})|status (do|de) (meu )?pedido|rastre(ar|io) (do |de )?(meu )?pedido/i,
    agentId: "agt_customer_support",
    toolCalls: [
      {
        tool: "checkOrder",
        label: "Verificando pedido",
        parameters: { orderId: "49281" },
        result: { status: "IN_TRANSIT", carrier: "UPS", eta: "2026-08-16" },
        durationMs: 1240,
        outcome: "SUCCESS",
      },
    ],
    response:
      "O pedido **#49281** está atualmente **em trânsito** pela UPS e sua entrega está prevista para **16 de agosto de 2026**.\n\nMe avise se quiser o link de rastreamento ou precisar alterar algo na entrega.",
  },
  {
    match: /invoice|second copy|billing statement|fatura|segunda via|boleto/i,
    agentId: "agt_finance",
    toolCalls: [
      {
        tool: "generateInvoiceCopy",
        label: "Gerando cópia da fatura",
        parameters: { invoiceId: "18372", format: "PDF" },
        result: { invoiceId: "18372", total: "$4,280.00", status: "GENERATED" },
        durationMs: 1860,
        outcome: "SUCCESS",
      },
    ],
    response:
      "Gerei uma cópia da **fatura #18372** no valor de **US$ 4.280,00**.\n\n| Campo | Valor |\n|---|---|\n| Fatura | #18372 |\n| Emitida em | 28 jul. 2026 |\n| Vencimento | 27 ago. 2026 |\n| Status | Pago |\n\nPosso enviar isso por e-mail para o contato de cobrança cadastrado — só confirme o endereço.",
  },
  {
    match: /refund|cancellation policy|cancel.*order|return policy|reembolso|política de cancelamento|cancelar.*pedido|política de devolução/i,
    agentId: "agt_customer_support",
    toolCalls: [
      {
        tool: "checkPolicy",
        label: "Consultando política",
        parameters: { topic: "refunds_and_cancellations" },
        result: { source: "Return & Refund Policy", lastUpdated: "2026-05-02" },
        durationMs: 890,
        outcome: "SUCCESS",
      },
    ],
    response:
      "Aqui está um resumo da nossa política de reembolso e cancelamento:\n\n- Pedidos podem ser **cancelados sem custo em até 24 horas** após a compra.\n- Reembolsos de itens devolvidos são processados em **5 a 7 dias úteis** após o recebimento do item.\n- Produtos digitais e cartões-presente são **não reembolsáveis**.\n\nQuer que eu inicie um cancelamento ou reembolso para um pedido específico?",
  },
  {
    match: /bug|error|not working|crash|fail(ing)?|500 error|rate limit|erro|não (está |esta )?funcionando|falha|falhando|limite de requisições/i,
    agentId: "agt_tech_support",
    toolCalls: [
      {
        tool: "runDiagnostics",
        label: "Executando diagnóstico",
        parameters: { workspace: "northwind-prod", scope: "api" },
        result: { errorRate: "2.4%", topError: "429 Too Many Requests", affectedEndpoint: "/v1/orders" },
        durationMs: 2100,
        outcome: "SUCCESS",
      },
      {
        tool: "fileBugReport",
        label: "Registrando bug",
        parameters: { title: "Elevated 429s on /v1/orders", severity: "P2" },
        result: { ticketId: "ENG-4471", status: "OPEN" },
        durationMs: 760,
        outcome: "SUCCESS",
      },
    ],
    response:
      "Encontrei uma taxa elevada de erros `429 Too Many Requests` em `/v1/orders` (2,4% das requisições na última hora). Isso indica que a nova tentativa do lado do cliente não está aplicando o backoff corretamente.\n\n```ts\n// Suggested fix: exponential backoff with jitter\nasync function withBackoff(fn: () => Promise<Response>, attempt = 0): Promise<Response> {\n  const res = await fn();\n  if (res.status === 429 && attempt < 5) {\n    const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 250;\n    await new Promise((r) => setTimeout(r, delay));\n    return withBackoff(fn, attempt + 1);\n  }\n  return res;\n}\n```\n\nRegistrei o chamado **ENG-4471** para que a equipe de engenharia adicione cabeçalhos de limite de requisições no lado do servidor. Vou manter você informado aqui quando for resolvido.",
  },
  {
    match: /support ticket|open a ticket|talk to a human|escalate|chamado de suporte|abrir um chamado|falar com (um )?humano|escalar/i,
    agentId: "agt_customer_support",
    toolCalls: [
      {
        tool: "openSupportTicket",
        label: "Abrindo chamado de suporte",
        parameters: { priority: "NORMAL", category: "general" },
        result: { ticketId: "8843", queue: "Customer Support" },
        durationMs: 640,
        outcome: "SUCCESS",
      },
    ],
    response:
      "Abri o **chamado #8843** e o encaminhei para nossa fila de suporte. Um membro da equipe entrará em contato por e-mail dentro de um dia útil.\n\nHá mais alguma coisa em que eu possa ajudar enquanto isso?",
  },
  {
    match: /customer|check.*(email|account|profile)|cliente|verificar.*(e-?mail|conta|perfil)/i,
    agentId: "agt_customer_support",
    toolCalls: [
      {
        tool: "checkCustomer",
        label: "Verificando cliente",
        parameters: { email: "customer@example.com" },
        result: { accountStatus: "ACTIVE", tier: "Gold", ordersLast90d: 4 },
        durationMs: 980,
        outcome: "SUCCESS",
      },
    ],
    response:
      "A conta deste cliente está **ativa**, com status **nível Gold** e 4 pedidos realizados nos últimos 90 dias. Me diga o que você gostaria de verificar a seguir.",
  },
];

export const genericAssistantResponses = [
  "Posso ajudar com isso. Você pode compartilhar mais detalhes — um número de pedido, ID de fatura ou e-mail da conta — para eu localizar o registro certo?",
  "Entendido. Posso verificar o status de pedidos, gerar cópias de fatura, consultar políticas ou abrir um chamado de suporte. O que você gostaria que eu fizesse?",
  "Ainda não tenho contexto suficiente para agir sobre isso. Você pode esclarecer o que gostaria que eu verificasse ou fizesse?",
];
