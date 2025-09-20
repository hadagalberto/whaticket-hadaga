import ProcessAiMessageService from "../AiAgentService/ProcessAiMessageService";
import CountAiMessagesService from "../AiAgentService/CountAiMessagesService";
import {
  CheckHumanTransferService,
  TransferToHumanService
} from "../AiAgentService/HumanTransferService";
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

    // Verificar se já atingiu o limite de mensagens antes de processar
    const messageCount = await CountAiMessagesService(ticket.id);

    if (messageCount.shouldTransfer) {
      logger.info(
        `Ticket ${ticket.id} atingiu limite de ${messageCount.maxMessages} mensagens. Transferindo para fila configurada.`
      );

      // Usar a fila de transferência configurada no agente
      const transferQueueId = messageCount.transferQueueId;

      if (transferQueueId) {
        // Enviar mensagem informando sobre a transferência por limite
        if (ticket.whatsappId) {
          await SendWhatsAppMessage({
            body: "Percebo que sua solicitação precisa de mais atenção. Vou transferir você para um de nossos atendentes especializados que poderá ajudá-lo melhor. Aguarde um momento! 😊",
            ticket
          });
        }

        // Transferir o ticket para a fila configurada
        await TransferToHumanService(ticket.id, transferQueueId);
        return; // Não processar com IA após transferência
      }
    }

    // Verificar se o usuário quer falar com um humano
    const transferCheck = await CheckHumanTransferService(message.body, ticket);

    if (transferCheck.shouldTransfer && transferCheck.humanQueueId) {
      // Enviar mensagem de transferência
      if (transferCheck.transferMessage && ticket.whatsappId) {
        await SendWhatsAppMessage({
          body: transferCheck.transferMessage,
          ticket
        });
      }

      // Transferir o ticket para atendimento humano
      await TransferToHumanService(ticket.id, transferCheck.humanQueueId);

      logger.info(`Ticket ${ticket.id} transferido para atendimento humano`);
      return; // Não processar com IA após transferência
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
