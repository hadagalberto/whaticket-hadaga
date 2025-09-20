import AiAgent from "../../models/AiAgent";
import Queue from "../../models/Queue";

const ShowAiAgentService = async (id: string | number): Promise<AiAgent> => {
  const aiAgent = await AiAgent.findByPk(id, {
    include: [
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  if (!aiAgent) {
    throw new Error("AI Agent not found");
  }

  return aiAgent;
};

export default ShowAiAgentService;
