import api, { getAuthToken } from "./api";

function makePayload(chatId, message, model, mode = "chat", fileIds = [], regenerate = false) {
  if (!chatId) throw new Error("Conversation ID is missing.");
  if (!String(message || "").trim()) throw new Error("Message is empty.");
  return {
    chat_id: chatId,
    message: String(message),
    model: model || "qwen3:8b",
    mode: mode || "chat",
    file_ids: Array.isArray(fileIds) ? fileIds.filter(Boolean) : [],
    regenerate: Boolean(regenerate),
  };
}

export async function sendMessage(
  chatId, message, model = "qwen3:8b", mode = "chat", fileIds = []
) {
  try {
    const response = await api.post(
      "/chat/",
      makePayload(chatId, message, model, mode, fileIds)
    );
    const data = response.data;
    if (!data || typeof data.reply !== "string") {
      throw new Error(data?.detail || "Invalid AI response received from backend.");
    }
    return data.reply;
  } catch (error) {
    console.error("[CHAT SERVICE ERROR]", error);
    if (error.response) {
      throw new Error(
        error.response.data?.detail ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`
      );
    }
    if (error.request) throw new Error("Cannot connect to AI backend.");
    throw new Error(error.message || "Unable to send message.");
  }
}

export async function streamMessage(
  chatId,
  message,
  model = "qwen3:8b",
  mode = "chat",
  onChunk,
  fileIds = [],
  signal,
  regenerate = false
) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    body: JSON.stringify(makePayload(chatId, message, model, mode, fileIds, regenerate)),
    signal,
  });

  if (!response.ok) {
    let detail = `Server error: ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || data?.error || detail;
    } catch {}
    throw new Error(detail);
  }
  if (!response.body) throw new Error("Streaming is not supported by this browser.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk && onChunk) onChunk(chunk);
    }
    const finalChunk = decoder.decode();
    if (finalChunk && onChunk) onChunk(finalChunk);
  } finally {
    reader.releaseLock();
  }
}
