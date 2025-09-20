import AiAgent from "../../models/AiAgent";

const DeleteAiAgentService = async (id: string | number): Promise<void> => {
  const aiAgent = await AiAgent.findByPk(id);

  if (!aiAgent) {
    throw new Error("AI Agent not found");
  }

  await aiAgent.destroy();
};

export default DeleteAiAgentService;
