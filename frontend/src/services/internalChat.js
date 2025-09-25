import api from "./api";

export const fetchInternalChatMessages = async (params = {}) => {
  const { data } = await api.get("/internal-chat/messages", { params });
  return data;
};

export const sendInternalChatMessage = async (body) => {
  const { data } = await api.post("/internal-chat/messages", { body });
  return data;
};
