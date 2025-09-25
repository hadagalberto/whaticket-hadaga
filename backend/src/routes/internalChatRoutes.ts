import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as InternalChatController from "../controllers/InternalChatController";

const internalChatRoutes = Router();

internalChatRoutes.get(
  "/internal-chat/messages",
  isAuth,
  InternalChatController.index
);
internalChatRoutes.post(
  "/internal-chat/messages",
  isAuth,
  InternalChatController.store
);

export default internalChatRoutes;
