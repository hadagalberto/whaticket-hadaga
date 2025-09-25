import { Request, Response } from "express";
import CreateInternalChatMessageService from "../services/InternalChatService/CreateInternalChatMessageService";
import ListInternalChatMessagesService from "../services/InternalChatService/ListInternalChatMessagesService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber } = req.query;

  const result = await ListInternalChatMessagesService({
    pageNumber: pageNumber as string
  });

  return res.status(200).json(result);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { body } = req.body;
  const { id: userId } = req.user;

  const message = await CreateInternalChatMessageService({
    userId: Number(userId),
    body
  });

  return res.status(201).json(message);
};
