import AiAgent from "../../models/AiAgent";
import {
  OpenAIProvider,
  GeminiProvider,
  AiProviderInterface
} from "./AiProvidersService";

const ProcessAiMessageService = async (
  queueId: number,
  userMessage: string,
  conversationContext?: string
): Promise<string | null> => {
  try {
    // Buscar o agente de IA ativo para esta fila
    const aiAgent = await AiAgent.findOne({
      where: {
        queueId,
        isActive: true
      }
    });

    if (!aiAgent) {
      return null; // Nenhum agente configurado para esta fila
    }

    let provider: AiProviderInterface;

    // Instanciar o provedor correto
    switch (aiAgent.provider) {
      case "openai":
        provider = new OpenAIProvider(aiAgent);
        break;
      case "gemini":
        provider = new GeminiProvider(aiAgent);
        break;
      default:
        throw new Error(`Provedor não suportado: ${aiAgent.provider}`);
    }

    // Gerar resposta usando o provedor
    const response = await provider.generateResponse(
      userMessage,
      conversationContext
    );

    return response;
  } catch (error) {
    console.error("Erro ao processar mensagem com IA:", error);
    throw error;
  }
};

export default ProcessAiMessageService;
