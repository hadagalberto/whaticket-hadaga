import AiAgent from "../../models/AiAgent";
import { logger } from "../../utils/logger";

interface AiProviderInterface {
  generateResponse(prompt: string, context?: string): Promise<string>;
}

type ChatCompletionMessage = {
  role: "system" | "assistant" | "user";
  content: string;
};

type ResponsesMessage = {
  role: "system" | "assistant" | "user";
  content: Array<{ type: "input_text"; text: string }>;
};

const RESPONSE_MODELS_PREFIXES = ["gpt-4.1", "o1-", "o3-"];
const RESPONSE_MODELS_EXACT = new Set(["o1", "o3"]);

const clampNumber = (
  value: number | null | undefined,
  {
    min,
    max,
    fallback
  }: {
    min: number;
    max: number;
    fallback: number;
  }
): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  const floored = Math.floor(value);
  if (!Number.isFinite(floored)) {
    return fallback;
  }

  return Math.min(Math.max(floored, min), max);
};

const sanitizeTemperature = (value: number | null | undefined): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.7;
  }

  return Math.min(Math.max(value, 0), 2);
};

const requiresResponsesEndpoint = (model: string): boolean => {
  if (!model) {
    return false;
  }

  if (RESPONSE_MODELS_EXACT.has(model)) {
    return true;
  }

  return RESPONSE_MODELS_PREFIXES.some(prefix => model.startsWith(prefix));
};

const isReasoningModel = (model: string): boolean => {
  return model.startsWith("o1") || model.startsWith("o3");
};

class OpenAIProvider implements AiProviderInterface {
  private apiKey: string;
  private model: string;
  private temperature: number | null;
  private maxTokens: number | null;
  private systemPrompt: string;

  constructor(agent: AiAgent) {
    this.apiKey = agent.apiKey;
    this.model = agent.model;
    this.temperature = agent.temperature ?? null;
    this.maxTokens = agent.maxTokens ?? null;
    this.systemPrompt =
      agent.systemPrompt || "You are a helpful customer service assistant.";
  }

  private buildMessages(
    prompt: string,
    context?: string
  ): ChatCompletionMessage[] {
    const messages: ChatCompletionMessage[] = [
      { role: "system", content: this.systemPrompt }
    ];

    if (context) {
      messages.push({
        role: "assistant",
        content: `Contexto da conversa: ${context}`
      });
    }

    messages.push({ role: "user", content: prompt });

    return messages;
  }

  private async callChatCompletions(
    messages: ChatCompletionMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || response.statusText || "Unknown error";
      logger.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.warn("OpenAI returned empty response");
      return "Desculpe, não consegui gerar uma resposta no momento.";
    }

    return content;
  }

  private async callResponsesEndpoint(
    messages: ChatCompletionMessage[],
    options: {
      maxOutputTokens: number;
      temperature?: number;
    }
  ): Promise<string> {
    const payload: {
      model: string;
      input: ResponsesMessage[];
      max_output_tokens: number;
      temperature?: number;
      reasoning?: { effort: "medium" };
    } = {
      model: this.model,
      input: messages.map(message => ({
        role: message.role,
        content: [
          {
            type: "input_text",
            text: message.content
          }
        ]
      })),
      max_output_tokens: options.maxOutputTokens
    };

    if (options.temperature !== undefined) {
      payload.temperature = options.temperature;
    }

    if (isReasoningModel(this.model)) {
      payload.reasoning = { effort: "medium" };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || response.statusText || "Unknown error";
      logger.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        endpoint: "responses"
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.output_text || data.output?.[0]?.content?.[0]?.text;

    if (!content) {
      logger.warn("OpenAI returned empty response (responses endpoint)");
      return "Desculpe, não consegui gerar uma resposta no momento.";
    }

    return content;
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const messages = this.buildMessages(prompt, context);

      const sanitizedMaxTokens = clampNumber(this.maxTokens, {
        min: 1,
        max: 4096,
        fallback: 1024
      });

      const useResponses = requiresResponsesEndpoint(this.model);

      if (useResponses) {
        // Alguns modelos baseados em raciocínio não suportam temperatura.
        const temperature = isReasoningModel(this.model)
          ? undefined
          : sanitizeTemperature(this.temperature);

        return await this.callResponsesEndpoint(messages, {
          maxOutputTokens: sanitizedMaxTokens,
          temperature
        });
      }

      const sanitizedTemperature = sanitizeTemperature(this.temperature);

      return await this.callChatCompletions(
        messages,
        sanitizedTemperature,
        sanitizedMaxTokens
      );
    } catch (error) {
      logger.error("OpenAI Provider Error:", error);

      if (
        error instanceof Error &&
        error.message.includes("OpenAI API error")
      ) {
        throw error; // Re-throw API errors with detailed message
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
