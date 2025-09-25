import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import InternalChatMessage from "../../models/InternalChatMessage";
import User from "../../models/User";

interface Request {
  userId: number;
  body: string;
}

const CreateInternalChatMessageService = async ({
  userId,
  body
}: Request): Promise<InternalChatMessage> => {
  const trimmedBody = body?.trim();

  if (!trimmedBody) {
    throw new AppError("ERR_INTERNAL_CHAT_EMPTY_MESSAGE", 400);
  }

  const message = await InternalChatMessage.create({
    userId,
    body: trimmedBody
  });

  await message.reload({
    include: [
      {
        model: User,
        attributes: ["id", "name", "profile", "email"]
      }
    ]
  });

  const io = getIO();
  io.to("internal-chat").emit("internalChat", {
    action: "create",
    message
  });

  return message;
};

export default CreateInternalChatMessageService;
