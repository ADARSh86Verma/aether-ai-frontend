import api from "./api";

/**
 * Create new conversation
 */
export async function createConversation() {
  const { data } = await api.post(
    "/conversations/"
  );

  if (!data) {
    throw new Error(
      "Empty response from server."
    );
  }

  return data;
}

/**
 * Get all conversations
 */
export async function getConversations() {
  const { data } = await api.get(
    "/conversations/"
  );

  if (!data) {
    return {
      conversations: [],
    };
  }

  return data;
}

/**
 * Get one conversation
 */
export async function getConversation(
  chatId
) {
  if (!chatId) {
    throw new Error(
      "Conversation ID is required."
    );
  }

  const { data } = await api.get(
    `/conversations/${chatId}`
  );

  return data;
}

/**
 * Delete conversation
 */
export async function deleteConversation(
  chatId
) {
  if (!chatId) {
    throw new Error(
      "Conversation ID is required."
    );
  }

  const { data } = await api.delete(
    `/conversations/${chatId}`
  );

  return data;
}

/**
 * Rename conversation
 */
export async function renameConversation(
  chatId,
  title
) {
  const { data } = await api.put(
    `/conversations/${chatId}/rename`,
    {
      title: title?.trim() || "New Chat",
    }
  );

  return data;
}

/**
 * Favorite / unfavorite conversation
 */
export async function favoriteConversation(
  chatId,
  favorite
) {
  const { data } = await api.put(
    `/conversations/${chatId}/favorite`,
    {
      favorite: Boolean(favorite),
    }
  );

  return data;
}