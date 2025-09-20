interface ValidateApiKeyResponse {
  isValid: boolean;
  error?: string;
}

const ValidateApiKeyService = async (
  provider: "openai" | "gemini",
  apiKey: string
): Promise<ValidateApiKeyResponse> => {
  try {
    switch (provider) {
      case "openai":
        return await validateOpenAIKey(apiKey);
      case "gemini":
        return await validateGeminiKey(apiKey);
      default:
        return { isValid: false, error: "Provedor não suportado" };
    }
  } catch (error) {
    return { isValid: false, error: "Erro ao validar API key" };
  }
};

const validateOpenAIKey = async (
  apiKey: string
): Promise<ValidateApiKeyResponse> => {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { isValid: true };
    } else if (response.status === 401) {
      return { isValid: false, error: "API key inválida para OpenAI" };
    } else {
      return { isValid: false, error: "Erro ao validar API key OpenAI" };
    }
  } catch (error) {
    return { isValid: false, error: "Erro de conexão com OpenAI" };
  }
};

const validateGeminiKey = async (
  apiKey: string
): Promise<ValidateApiKeyResponse> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (response.ok) {
      return { isValid: true };
    } else if (response.status === 400 || response.status === 403) {
      return { isValid: false, error: "API key inválida para Google Gemini" };
    } else {
      return { isValid: false, error: "Erro ao validar API key Gemini" };
    }
  } catch (error) {
    return { isValid: false, error: "Erro de conexão com Google Gemini" };
  }
};

export default ValidateApiKeyService;
