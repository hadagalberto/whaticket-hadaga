import AiAgent from "../../models/AiAgent";

interface AiAgentUpdateData {
  name?: string;
  provider?: "openai" | "gemini";
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  maxMessages?: number;
  isActive?: boolean;
}

const UpdateAiAgentService = async (
  id: string | number,
  aiAgentData: AiAgentUpdateData
): Promise<AiAgent> => {
  const aiAgent = await AiAgent.findByPk(id);

  if (!aiAgent) {
    throw new Error("AI Agent not found");
  }

  await aiAgent.update(aiAgentData);

  return aiAgent;
};

export default UpdateAiAgentService;
