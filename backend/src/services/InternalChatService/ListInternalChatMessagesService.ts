import InternalChatMessage from "../../models/InternalChatMessage";
import User from "../../models/User";

interface Request {
  pageNumber?: string;
}

interface Response {
  messages: InternalChatMessage[];
  count: number;
  hasMore: boolean;
}

const ListInternalChatMessagesService = async ({
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 50;
  const page = Number(pageNumber) || 1;
  const offset = limit * (page - 1);

  const { rows: messages, count } = await InternalChatMessage.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "profile"]
      }
    ]
  });

  const hasMore = count > offset + messages.length;

  return {
    messages: messages.reverse(),
    count,
    hasMore
  };
};

export default ListInternalChatMessagesService;
