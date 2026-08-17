import api from "./api";

/**
 * Send message to FastAPI backend
 * @param {string} message
 * @param {Array} history
 * @returns {Promise<string>}
 */
export async function sendMessage(
    chatId,
    message,
    model = "qwen3:8b",
    mode = "chat",
    fileIds = []
) {
  try {
    const response = await api.post("/chat/", {
        chat_id: chatId,
        message,
        model,
        mode,
        file_ids: fileIds,
    });
    const data = response.data;

    if (!data) {
      throw new Error("Empty response from backend.");
    }

    if (data.success === false) {
      throw new Error(
        data.detail ||
        data.error ||
        "Backend returned an error."
      );
    }

    return data.reply;

  } catch (err) {
    if (err.response) {
      throw new Error(
        err.response.data?.detail ||
        JSON.stringify(err.response.data)
      );
    }

    throw err;
  }
}

export async function streamMessage(
  chatId,
  message,
  model = "qwen3:8b",
  mode = "chat",
  onChunk,
  fileIds = [],
  signal
) {
  const token =
    localStorage.getItem("aether-auth-token") ||
    sessionStorage.getItem("aether-auth-token");

  const response = await fetch(
    `${api.defaults.baseURL}/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        chat_id: chatId,
        message,
        model,
        mode,
        file_ids: fileIds,
      }),
      signal,
    }
  );

  if (!response.ok) {
    let detail = `Streaming failed (${response.status})`;
    try {
      const errorBody = await response.json();
      detail = errorBody?.detail || detail;
    } catch {
      // Ignore non-JSON error bodies.
    }
    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error("Backend returned an empty streaming response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    onChunk(chunk);
  }
}