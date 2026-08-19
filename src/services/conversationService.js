import api from "./api";

function normalizeConversation(value) {
  if (!value) return null;
  return {
    id: value.id || value._id || null,
    title: value.title || "New Chat",
    favorite: Boolean(value.favorite),
    createdAt: value.created_at ? new Date(value.created_at) : new Date(),
    updatedAt: value.updated_at ? new Date(value.updated_at) : new Date(),
  };
}

export async function createConversation(title = "New Chat") {
  const { data } = await api.post("/conversations/", { title });
  const conversation = normalizeConversation(data?.conversation);
  if (!conversation?.id) {
    throw new Error("Backend did not return a conversation id.");
  }
  return conversation;
}

export async function getConversations() {
  const { data } = await api.get("/conversations/");
  const list = Array.isArray(data?.conversations)
    ? data.conversations
    : Array.isArray(data) ? data : [];
  return list.map(normalizeConversation).filter((item) => item?.id);
}

export async function getConversation(chatId) {
  if (!chatId) throw new Error("Conversation ID is required.");
  const { data } = await api.get(`/conversations/${chatId}`);
  const conversation = normalizeConversation(data?.conversation);
  return {
    ...(conversation || { id: chatId, title: "New Chat", favorite: false }),
    messages: Array.isArray(data?.messages) ? data.messages : [],
  };
}

export async function renameConversation(chatId, title) {
  const { data } = await api.put(`/conversations/${chatId}/rename`, {
    title: String(title || "New Chat").trim(),
  });
  return data;
}

export async function favoriteConversation(chatId, favorite) {
  const { data } = await api.put(`/conversations/${chatId}/favorite`, {
    favorite: Boolean(favorite),
  });
  return data;
}

export async function deleteConversation(chatId) {
  const { data } = await api.delete(`/conversations/${chatId}`);
  return data;
}
