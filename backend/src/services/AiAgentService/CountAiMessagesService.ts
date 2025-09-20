import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import AiAgent from "../../models/AiAgent";
import Queue from "../../models/Queue";
import { logger } from "../../utils/logger";

interface MessageCountResult {
  aiMessageCount: number;
  shouldTransfer: boolean;
  maxMessages: number;
}

const CountAiMessagesService = async (
  ticketId: number
): Promise<MessageCountResult> => {
  try {
    // Buscar o ticket com sua fila e agente IA
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Queue,
          as: "queue",
          include: [
            {
              model: AiAgent,
              as: "aiAgent",
              required: false
            }
          ]
        }
      ]
    });

    if (!ticket || !ticket.queue?.aiAgent) {
      return {
        aiMessageCount: 0,
        shouldTransfer: false,
        maxMessages: 0
      };
    }

    const aiAgent = ticket.queue.aiAgent;
    const maxMessages = aiAgent.maxMessages || 5;

    // Contar mensagens enviadas pela IA para este ticket
    // fromMe = true indica mensagens enviadas pelo sistema/IA
    const aiMessageCount = await Message.count({
      where: {
        ticketId: ticketId,
        fromMe: true
      }
    });

    const shouldTransfer = aiMessageCount >= maxMessages;

    logger.info(
      `Ticket ${ticketId}: IA enviou ${aiMessageCount}/${maxMessages} mensagens. ` +
        `Transfer needed: ${shouldTransfer}`
    );

    return {
      aiMessageCount,
      shouldTransfer,
      maxMessages
    };
  } catch (error) {
    logger.error("Erro ao contar mensagens da IA:", error);
    return {
      aiMessageCount: 0,
      shouldTransfer: false,
      maxMessages: 0
    };
  }
};

export default CountAiMessagesService;
