import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateAiAgentService from "../services/AiAgentService/CreateAiAgentService";
import DeleteAiAgentService from "../services/AiAgentService/DeleteAiAgentService";
import ListAiAgentsService from "../services/AiAgentService/ListAiAgentsService";
import ShowAiAgentService from "../services/AiAgentService/ShowAiAgentService";
import UpdateAiAgentService from "../services/AiAgentService/UpdateAiAgentService";
import ValidateApiKeyService from "../services/AiAgentService/ValidateApiKeyService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const aiAgents = await ListAiAgentsService();
    return res.status(200).json(aiAgents);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      name,
      provider,
      apiKey,
      model,
      systemPrompt,
      temperature,
      maxTokens,
      isActive,
      queueId
    } = req.body;

    const aiAgent = await CreateAiAgentService({
      name,
      provider,
      apiKey,
      model,
      systemPrompt,
      temperature,
      maxTokens,
      isActive,
      queueId
    });

    const io = getIO();
    io.emit("aiAgent", {
      action: "create",
      aiAgent
    });

    return res.status(201).json(aiAgent);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { aiAgentId } = req.params;
    const aiAgent = await ShowAiAgentService(aiAgentId);
    return res.status(200).json(aiAgent);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { aiAgentId } = req.params;
    const aiAgent = await UpdateAiAgentService(aiAgentId, req.body);

    const io = getIO();
    io.emit("aiAgent", {
      action: "update",
      aiAgent
    });

    return res.status(200).json(aiAgent);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { aiAgentId } = req.params;
    await DeleteAiAgentService(aiAgentId);

    const io = getIO();
    io.emit("aiAgent", {
      action: "delete",
      aiAgentId
    });

    return res.status(200).json({ message: "AI Agent deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const validateApiKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { provider, apiKey } = req.body;
    const validation = await ValidateApiKeyService(provider, apiKey);
    return res.status(200).json(validation);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
