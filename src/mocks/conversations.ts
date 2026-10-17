import { subDays, subHours, subMinutes } from "date-fns";
import type { Conversation, Message } from "@/types";

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    title: "Status do pedido #49281",
    lastMessage: "O pedido #49281 está atualmente em trânsito.",
    agentId: "agt_customer_support",
    agentName: "Suporte ao Cliente",
    status: "ACTIVE",
    createdAt: iso(subMinutes(now, 42)),
    updatedAt: iso(subMinutes(now, 40)),
    messageCount: 6,
  },
  {
    id: "conv_2",
    title: "Solicitação de fatura",
    lastMessage: "Gerei a segunda via da fatura #18372.",
    agentId: "agt_finance",
    agentName: "Assistente Financeiro",
    status: "ACTIVE",
    createdAt: iso(subHours(now, 2)),
    updatedAt: iso(subHours(now, 2)),
    messageCount: 4,
    pinned: true,
  },
  {
    id: "conv_3",
    title: "Problema de suporte a pedido",
    lastMessage: "Abri o chamado #8843 para a equipe do armazém.",
    agentId: "agt_order_mgmt",
    agentName: "Gestão de Pedidos",
    status: "ACTIVE",
    createdAt: iso(subHours(now, 5)),
    updatedAt: iso(subHours(now, 5)),
    messageCount: 9,
  },
  {
    id: "conv_4",
    title: "Política de cancelamento",
    lastMessage: "Os pedidos podem ser cancelados até 24 horas após a compra.",
    agentId: "agt_customer_support",
    agentName: "Suporte ao Cliente",
    status: "ACTIVE",
    createdAt: iso(subDays(now, 1)),
    updatedAt: iso(subDays(now, 1)),
    messageCount: 3,
  },
  {
    id: "conv_5",
    title: "Pedido #49102",
    lastMessage: "Seu reembolso de R$ 84,50 foi emitido.",
    agentId: "agt_customer_support",
    agentName: "Suporte ao Cliente",
    status: "ACTIVE",
    createdAt: iso(subDays(now, 1)),
    updatedAt: iso(subDays(now, 1)),
    messageCount: 7,
  },
  {
    id: "conv_6",
    title: "Erro de limite de requisições da API",
    lastMessage: "Registrei o relatório de bug ENG-4471 para a equipe de engenharia.",
    agentId: "agt_tech_support",
    agentName: "Suporte Técnico",
    status: "ACTIVE",
    createdAt: iso(subDays(now, 2)),
    updatedAt: iso(subDays(now, 2)),
    messageCount: 11,
  },
  {
    id: "conv_7",
    title: "Relatório de aging de AR — julho",
    lastMessage: "O total de contas a receber pendentes em julho é de R$ 214.300.",
    agentId: "agt_finance",
    agentName: "Assistente Financeiro",
    status: "ACTIVE",
    createdAt: iso(subDays(now, 3)),
    updatedAt: iso(subDays(now, 3)),
    messageCount: 5,
  },
  {
    id: "conv_8",
    title: "Configuração de SSO para Acme Corp",
    lastMessage: "Conexão SSO verificada e ativa.",
    agentId: "agt_onboarding",
    agentName: "Guia de Integração",
    status: "ARCHIVED",
    createdAt: iso(subDays(now, 6)),
    updatedAt: iso(subDays(now, 6)),
    messageCount: 8,
  },
  {
    id: "conv_9",
    title: "Pergunta sobre política de reembolso",
    lastMessage: "Os reembolsos são processados em 5 a 7 dias úteis.",
    agentId: "agt_customer_support",
    agentName: "Suporte ao Cliente",
    status: "ARCHIVED",
    createdAt: iso(subDays(now, 9)),
    updatedAt: iso(subDays(now, 9)),
    messageCount: 4,
  },
];

export const mockMessagesByConversation: Record<string, Message[]> = {
  conv_1: [
    {
      id: "msg_1_1",
      conversationId: "conv_1",
      role: "USER",
      content: "Qual é o status do pedido #49281?",
      createdAt: iso(subMinutes(now, 42)),
    },
    {
      id: "msg_1_2",
      conversationId: "conv_1",
      role: "ASSISTANT",
      content: "Deixe-me verificar isso para você.",
      createdAt: iso(subMinutes(now, 41)),
      agentId: "agt_customer_support",
      agentName: "Suporte ao Cliente",
      toolCalls: [
        {
          id: "tc_1",
          toolName: "checkOrder",
          label: "Verificando pedido",
          status: "SUCCESS",
          parameters: { orderId: "49281" },
          result: { status: "IN_TRANSIT", carrier: "UPS", eta: "2026-08-16" },
          executionTimeMs: 1240,
          startedAt: iso(subMinutes(now, 41)),
          completedAt: iso(subMinutes(now, 41)),
        },
      ],
    },
    {
      id: "msg_1_3",
      conversationId: "conv_1",
      role: "ASSISTANT",
      content:
        "O pedido **#49281** está atualmente **em trânsito** via UPS e deve chegar até **16 de agosto de 2026**.\n\nAvise-me se quiser o link de rastreamento ou fazer alguma alteração na entrega.",
      createdAt: iso(subMinutes(now, 40)),
      agentId: "agt_customer_support",
      agentName: "Suporte ao Cliente",
    },
  ],
};

export function getConversationMessages(conversationId: string): Message[] {
  return mockMessagesByConversation[conversationId] ?? [];
}
