import AiAgent from "../../models/AiAgent";
import Queue from "../../models/Queue";

const ListAiAgentsService = async (): Promise<AiAgent[]> => {
  const aiAgents = await AiAgent.findAll({
    include: [
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return aiAgents;
};

export default ListAiAgentsService;
