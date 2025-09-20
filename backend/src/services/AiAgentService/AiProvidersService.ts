import AiAgent from "../../models/AiAgent";
import { logger } from "../../utils/logger";

interface AiProviderInterface {
  generateResponse(prompt: string, context?: string): Promise<string>;
}

class OpenAIProvider implements AiProviderInterface {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private systemPrompt: string;

  constructor(agent: AiAgent) {
    this.apiKey = agent.apiKey;
    this.model = agent.model;
    this.temperature = agent.temperature;
    this.maxTokens = agent.maxTokens;
    this.systemPrompt =
      agent.systemPrompt || "You are a helpful customer service assistant.";
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: this.systemPrompt },
              ...(context
                ? [
                    {
                      role: "assistant",
                      content: `Contexto da conversa: ${context}`
                    }
                  ]
                : []),
              { role: "user", content: prompt }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("OpenAI API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(
          `OpenAI API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        logger.warn("OpenAI returned empty response");
        return "Desculpe, não consegui gerar uma resposta no momento.";
      }

      return content;
    } catch (error) {
      logger.error("OpenAI Provider Error:", error);

      if (error.message.includes("API error")) {
        throw error; // Re-throw API errors
      }

      throw new Error(
        "Erro ao comunicar com OpenAI. Verifique sua conexão e tente novamente."
      );
    }
  }
}

class GeminiProvider implements AiProviderInterface {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private systemPrompt: string;

  constructor(agent: AiAgent) {
    this.apiKey = agent.apiKey;
    this.model = agent.model;
    this.temperature = agent.temperature;
    this.maxTokens = agent.maxTokens;
    this.systemPrompt =
      agent.systemPrompt || "You are a helpful customer service assistant.";
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = `${this.systemPrompt}\n\n${
        context ? `Contexto: ${context}\n\n` : ""
      }${prompt}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: this.temperature,
              maxOutputTokens: this.maxTokens
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Gemini API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(
          `Gemini API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text;

      if (!content) {
        logger.warn("Gemini returned empty response");
        return "Desculpe, não consegui gerar uma resposta no momento.";
      }

      return content;
    } catch (error) {
      logger.error("Gemini Provider Error:", error);

      if (error.message.includes("API error")) {
        throw error; // Re-throw API errors
      }

      throw new Error(
        "Erro ao comunicar com Google Gemini. Verifique sua conexão e tente novamente."
      );
    }
  }
}

export { OpenAIProvider, GeminiProvider, AiProviderInterface };
