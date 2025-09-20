import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import AiAgent from "../../models/AiAgent";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";

// Palavras-chave que indicam que o usuário quer falar com um humano
const HUMAN_TRANSFER_KEYWORDS = [
  "falar com atendente",
  "falar com humano",
  "atendente humano",
  "pessoa real",
  "não é bot",
  "quero uma pessoa",
  "transferir para humano",
  "sair da IA",
  "parar bot",
  "atendimento humano",
  "operador humano",
  "não quero bot",
  "robô não",
  "humano por favor",
  "gente de verdade"
];

interface TransferResult {
  shouldTransfer: boolean;
  transferMessage?: string;
  humanQueueId?: number;
}

const CheckHumanTransferService = async (
  userMessage: string,
  currentTicket: Ticket
): Promise<TransferResult> => {
  try {
    const messageText = userMessage.toLowerCase().trim();

    // Verificar se alguma palavra-chave foi mencionada
    const wantsHuman = HUMAN_TRANSFER_KEYWORDS.some(keyword =>
      messageText.includes(keyword)
    );

    if (!wantsHuman) {
      return { shouldTransfer: false };
    }

    // Buscar uma fila para atendimento humano (diferente da atual)
    // Procurar por uma fila que não tenha agente de IA ativo
    const humanQueue = await Queue.findOne({
      where: {
        id: { [Op.ne]: currentTicket.queueId } // Diferente da fila atual
      },
      include: [
        {
          model: AiAgent,
          as: "aiAgent",
          required: false,
          where: {
            isActive: false
          }
        }
      ]
    });

    // Se não encontrou fila sem IA, usar a primeira fila disponível diferente da atual
    let targetQueue = humanQueue;
    if (!targetQueue) {
      targetQueue = await Queue.findOne({
        where: {
          id: { [Op.ne]: currentTicket.queueId }
        }
      });
    }

    if (!targetQueue) {
      logger.warn(
        `Não foi possível encontrar fila para transferência humana do ticket ${currentTicket.id}`
      );
      return {
        shouldTransfer: false
      };
    }

    return {
      shouldTransfer: true,
      transferMessage: `Entendi que você gostaria de falar com um atendente humano. Vou transferir você para nossa equipe de atendimento. Em alguns instantes um de nossos atendentes irá te responder. Obrigado pela paciência! 😊`,
      humanQueueId: targetQueue.id
    };
  } catch (error) {
    logger.error("Erro ao verificar transferência para humano:", error);
    return { shouldTransfer: false };
  }
};

const TransferToHumanService = async (
  ticketId: number,
  humanQueueId: number
): Promise<void> => {
  try {
    await UpdateTicketService({
      ticketData: {
        queueId: humanQueueId,
        status: "pending" // Voltar para pendente para aparecer na fila
      },
      ticketId
    });

    logger.info(
      `Ticket ${ticketId} transferido para atendimento humano na fila ${humanQueueId}`
    );
  } catch (error) {
    logger.error(`Erro ao transferir ticket ${ticketId} para humano:`, error);
    throw error;
  }
};

export { CheckHumanTransferService, TransferToHumanService };
