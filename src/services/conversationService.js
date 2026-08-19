import api from "./api";

export async function createConversation() {
  const { data } = await api.post("/conversations/");

  if (!data) {
    throw new Error("Empty response from server.");
  }

  return {
    success: data.success !== false,
    conversation: {
      id: data.conversation?.id ?? data.chat_id,
      title: data.conversation?.title ?? data.title ?? "New Chat",
      favorite: data.conversation?.favorite ?? false,
    },
  };
}

export async function getConversations() {
  const { data } = await api.get("/conversations/");

  if (!data) {
    return { conversations: [] };
  }

  // Backend कभी array या {conversations: []} दोनों दे सकता है
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.conversations)
      ? data.conversations
      : [];

  return {
    conversations: list.map((chat) => ({
      id: chat.id ?? chat.chat_id,
      title: chat.title ?? "New Chat",
      favorite: Boolean(chat.favorite),
    })),
  };
}

export async function getConversation(chatId) {
  const { data } = await api.get(`/conversations/${chatId}`);
  return data;
}

export async function deleteConversation(chatId) {
  const { data } = await api.delete(`/conversations/${chatId}`);
  return data;
}

export async function renameConversation(chatId, title) {
  const { data } = await api.put(
    `/conversations/${chatId}/rename`,
    { title }
  );

  return data;
}

export async function favoriteConversation(chatId, favorite) {
  const { data } = await api.put(
    `/conversations/${chatId}/favorite`,
    { favorite }
  );

  return data;
}