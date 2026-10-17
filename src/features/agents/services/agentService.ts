import { apiClient } from "@/services/api";
import { API_CONFIG } from "@/services/config";
import { ApiRequestError } from "@/types/api";
import type { Agent, AgentStatus, AgentVisibility, AiProvider } from "@/types";

/** Agent service backed by the Spring Boot `/api/agents` endpoints (list, get, update). */

const agentsApi = { baseUrl: API_CONFIG.agentsBaseUrl };

const AVATAR_COLORS = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

interface AgentSummaryResponse {
  id: number;
  name: string;
  description: string;
  status: AgentStatus;
  modelName: string;
  updatedAt: string;
}

interface AgentDetailResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  information: { name: string; description: string; status: AgentStatus };
  model: { modelProvider: string; modelName: string; temperature: number; maxTokens: number | null };
  systemPrompt: string;
  visibility: AgentVisibility;
}

// The backend does not model tools, knowledge sources, permissions or usage yet.
const unmodeled = (id: number) => ({
  toolCount: 0,
  documentCount: 0,
  conversationsHandled: 0,
  avatarColor: AVATAR_COLORS[id % AVATAR_COLORS.length],
  tools: [],
  knowledgeSources: [],
  permissions: [],
});

function fromSummary(a: AgentSummaryResponse): Agent {
  return {
    ...unmodeled(a.id),
    id: String(a.id),
    version: 0,
    visibility: "PRIVATE",
    name: a.name,
    description: a.description,
    status: a.status,
    provider: "" as AiProvider,
    model: a.modelName,
    updatedAt: a.updatedAt,
    createdAt: a.updatedAt,
    instructions: "",
    temperature: 0,
    maxTokens: 0,
  };
}

function fromDetail(a: AgentDetailResponse): Agent {
  return {
    ...unmodeled(a.id),
    id: String(a.id),
    version: a.version,
    visibility: a.visibility,
    name: a.information.name,
    description: a.information.description,
    status: a.information.status,
    provider: a.model.modelProvider as AiProvider,
    model: a.model.modelName,
    updatedAt: a.updatedAt,
    createdAt: a.createdAt,
    instructions: a.systemPrompt,
    temperature: a.model.temperature,
    maxTokens: a.model.maxTokens ?? 0,
  };
}

export const agentService = {
  async getAll(): Promise<Agent[]> {
    const agents = await apiClient.get<AgentSummaryResponse[]>("", agentsApi);
    return agents.map(fromSummary);
  },

  async getById(id: string): Promise<Agent | undefined> {
    try {
      return fromDetail(await apiClient.get<AgentDetailResponse>(`/${id}`, agentsApi));
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) return undefined;
      throw error;
    }
  },

  async update(id: string, agent: Agent): Promise<Agent> {
    const body = {
      version: agent.version,
      information: { name: agent.name, description: agent.description, status: agent.status },
      model: {
        modelProvider: agent.provider,
        modelName: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens > 0 ? agent.maxTokens : null,
      },
      systemPrompt: agent.instructions,
      visibility: agent.visibility,
    };
    return fromDetail(await apiClient.put<AgentDetailResponse>(`/${id}`, body, agentsApi));
  },
};
