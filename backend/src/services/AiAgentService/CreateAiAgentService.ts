import AiAgent from "../../models/AiAgent";
import Queue from "../../models/Queue";
import ValidateApiKeyService from "./ValidateApiKeyService";

interface AiAgentData {
  name: string;
  provider: "openai" | "gemini";
  apiKey: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
  queueId: number;
}

const CreateAiAgentService = async (
  aiAgentData: AiAgentData
): Promise<AiAgent> => {
  const { queueId, provider, apiKey } = aiAgentData;

  // Verificar se a fila existe
  const queue = await Queue.findByPk(queueId);
  if (!queue) {
    throw new Error("Queue not found");
  }

  // Verificar se já existe um agente para esta fila
  const existingAgent = await AiAgent.findOne({ where: { queueId } });
  if (existingAgent) {
    throw new Error("This queue already has an AI agent configured");
  }

  // Validar API key
  const validation = await ValidateApiKeyService(provider, apiKey);
  if (!validation.isValid) {
    throw new Error(validation.error || "Invalid API key");
  }

  const aiAgent = await AiAgent.create(aiAgentData);

  return aiAgent;
};

export default CreateAiAgentService;
