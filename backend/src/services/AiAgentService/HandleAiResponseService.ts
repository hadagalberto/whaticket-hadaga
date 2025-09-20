import ProcessAiMessageService from "../AiAgentService/ProcessAiMessageService";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import { logger } from "../../utils/logger";

const HandleAiResponseService = async (
  message: Message,
  ticket: Ticket
): Promise<void> => {
  try {
    // Só processar se a mensagem não foi enviada pelo sistema (fromMe = false)
    // e se o ticket tem uma fila associada
    if (message.fromMe || !ticket.queueId) {
      return;
    }

    // Buscar as últimas mensagens da conversa para dar contexto
    const recentMessages = await Message.findAll({
      where: { ticketId: ticket.id },
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: ["body", "fromMe", "createdAt"]
    });

    // Criar contexto da conversa
    const conversationContext = recentMessages
      .reverse()
      .map(msg => `${msg.fromMe ? "Agente" : "Cliente"}: ${msg.body}`)
      .join("\n");

    // Tentar gerar resposta com IA
    const aiResponse = await ProcessAiMessageService(
      ticket.queueId,
      message.body,
      conversationContext
    );

    // Se houver resposta da IA, enviar pelo WhatsApp
    if (aiResponse && ticket.whatsappId) {
      await SendWhatsAppMessage({
        body: aiResponse,
        ticket
      });

      logger.info(
        `IA respondeu para ticket ${ticket.id}: ${aiResponse.substring(
          0,
          100
        )}...`
      );
    }
  } catch (error) {
    logger.error(
      `Erro ao processar mensagem com IA para ticket ${ticket.id}:`,
      error
    );
    // Não throw error para não quebrar o fluxo normal de mensagens
  }
};

export default HandleAiResponseService;
