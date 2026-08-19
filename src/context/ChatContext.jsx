import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import {
  createConversation, getConversation, getConversations,
  deleteConversation as deleteConversationApi, renameConversation, favoriteConversation,
} from "../services/conversationService";
import { generateId } from "../utils/formatTime";
import { streamMessage } from "../services/chatService";

const ChatContext = createContext(null);
const MODEL_NAME = "Aether-1 Coder";

function normalizeMessage(message) {
  if (!message) return null;
  return {
    ...message,
    id: message.id || message._id || generateId("msg"),
    role: message.role === "user" ? "user" : "assistant",
    content: typeof message.content === "string" ? message.content : "",
    createdAt: message.createdAt || message.created_at || new Date(),
    attachments: Array.isArray(message.attachments) ? message.attachments.filter(Boolean) : [],
    streaming: Boolean(message.streaming),
  };
}

function normalizeConversation(value) {
  if (!value) return null;
  return {
    id: value.id || value._id || null,
    title: value.title || "New Chat",
    favorite: Boolean(value.favorite),
    createdAt: value.createdAt || value.created_at || new Date(),
    updatedAt: value.updatedAt || value.updated_at || new Date(),
    messages: Array.isArray(value.messages)
      ? value.messages.map(normalizeMessage).filter(Boolean) : [],
  };
}

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("qwen3:8b");
  const [selectedMode, setSelectedMode] = useState("chat");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(null);

  const updateConversation = useCallback((id, updater) => {
    if (!id) return;
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c));
  }, []);

  const appendMessage = useCallback((chatId, message) => {
    const safe = normalizeMessage(message);
    if (!chatId || !safe) return;
    updateConversation(chatId, c => ({
      ...c,
      messages: [...(Array.isArray(c.messages) ? c.messages : []), safe],
      updatedAt: new Date(),
      title: c.title === "New Chat" && safe.role === "user" && safe.content
        ? safe.content.slice(0, 40) : c.title,
    }));
  }, [updateConversation]);

  const patchLastMessage = useCallback((chatId, updater) => {
    updateConversation(chatId, c => {
      const messages = Array.isArray(c.messages) ? [...c.messages] : [];
      if (!messages.length) return c;
      const current = messages[messages.length - 1] || normalizeMessage({});
      messages[messages.length - 1] = normalizeMessage({ ...current, ...updater(current) });
      return { ...c, messages, updatedAt: new Date() };
    });
  }, [updateConversation]);

  useEffect(() => {
    let cancelled = false;
    async function loadChats() {
      try {
        const data = await getConversations();
        if (cancelled) return;
        const formatted = data.map(normalizeConversation).filter(c => c?.id);
        if (formatted.length) {
          setConversations(formatted);
          setActiveId(formatted[0].id);
          return;
        }
        const created = await createConversation();
        if (cancelled) return;
        const chat = normalizeConversation(created);
        if (!chat?.id) throw new Error("Unable to create the first conversation.");
        setConversations([chat]);
        setActiveId(chat.id);
      } catch (err) {
        if (!cancelled) console.error("[LOAD CONVERSATIONS ERROR]", err);
      }
    }
    loadChats();
    return () => { cancelled = true; };
  }, []);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  const newChat = useCallback(async () => {
  console.log("New Chat clicked");

  try {
    const data = await createConversation();

    console.log("CREATE CONVERSATION:", data);

    if (!data?.conversation?.id) {
      throw new Error("Server did not return a valid conversation ID.");
    }

    const chat = {
      id: data.conversation.id,
      title: data.conversation.title || "New Chat",
      favorite: Boolean(data.conversation.favorite),
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    setConversations((prev) => [chat, ...prev]);
    setActiveId(chat.id);

    return chat.id;

  } catch (err) {
    console.error("New Chat Error:", err);

    throw err;
  }
}, []);

  const openChat = useCallback(async chatId => {
    if (!chatId) return;
    const data = await getConversation(chatId);
    const messages = Array.isArray(data.messages)
      ? data.messages.map(normalizeMessage).filter(Boolean) : [];
    updateConversation(chatId, old => ({
      ...old,
      id: old?.id || data.id || chatId,
      title: data.title || old?.title || "New Chat",
      favorite: data.favorite ?? old?.favorite ?? false,
      createdAt: data.createdAt || old?.createdAt || new Date(),
      updatedAt: data.updatedAt || old?.updatedAt || new Date(),
      messages,
    }));
    setActiveId(chatId);
  }, [updateConversation]);

  const deleteChat = useCallback(async id => {
    if (!id) return;
    await deleteConversationApi(id);
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      setActiveId(current => current === id ? (next[0]?.id || null) : current);
      return next;
    });
  }, []);

  const renameChat = useCallback(async (id, title) => {
    const clean = String(title || "").trim();
    if (!id || !clean) return;
    await renameConversation(id, clean);
    updateConversation(id, c => ({ ...c, title: clean, updatedAt: new Date() }));
  }, [updateConversation]);

  const toggleFavorite = useCallback(async id => {
    const chat = conversations.find(c => c.id === id);
    if (!chat) return;
    const next = !chat.favorite;
    await favoriteConversation(id, next);
    updateConversation(id, c => ({ ...c, favorite: next, updatedAt: new Date() }));
  }, [conversations, updateConversation]);

  const stopResponse = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setIsThinking(false);
    if (activeId) patchLastMessage(activeId, () => ({ streaming: false }));
  }, [activeId, patchLastMessage]);

  const sendUserMessage = useCallback(async (text, attachments = []) => {
    const safeText = String(text ?? "").trim();
    const safeAttachments = Array.isArray(attachments) ? attachments.filter(Boolean) : [];
    if ((!safeText && !safeAttachments.length) || !activeId) return;

    const chatId = activeId;
    const messageText = safeText || "Please analyze the attached file(s).";
    const fileIds = safeAttachments.map(file => file?.id).filter(Boolean);

    appendMessage(chatId, {
      role: "user", content: messageText, createdAt: new Date(),
      model: selectedModel, attachments: safeAttachments,
    });
    appendMessage(chatId, {
      role: "assistant", content: "", createdAt: new Date(),
      model: selectedModel, streaming: true,
    });

    const controller = new AbortController();
    abortRef.current = controller;
    setIsThinking(true);
    setIsStreaming(true);

    try {
      await streamMessage(
        chatId, messageText, selectedModel, selectedMode,
        chunk => {
          if (!controller.signal.aborted) {
            setIsThinking(false);
            patchLastMessage(chatId, last => ({
              content: `${last?.content || ""}${chunk || ""}`,
            }));
          }
        },
        fileIds, controller.signal
      );
      if (!controller.signal.aborted) patchLastMessage(chatId, () => ({ streaming: false }));
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("[SEND MESSAGE ERROR]", err);
        patchLastMessage(chatId, last => ({
          content: last?.content || err?.message || "Unable to connect to backend.",
          streaming: false,
        }));
      } else {
        patchLastMessage(chatId, () => ({ streaming: false }));
      }
      throw err;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsThinking(false);
      setIsStreaming(false);
    }
  }, [activeId, selectedModel, selectedMode, appendMessage, patchLastMessage]);

  const regenerateLast = useCallback(async () => {
    if (!activeConversation || isStreaming || isThinking) return;
    const messages = Array.isArray(activeConversation.messages) ? activeConversation.messages : [];
    const lastUser = [...messages].reverse().find(m => m?.role === "user");
    if (!lastUser) return;

    const chatId = activeConversation.id;
    const fileIds = Array.isArray(lastUser.attachments)
      ? lastUser.attachments.map(file => file?.id).filter(Boolean) : [];

    updateConversation(chatId, c => ({
      ...c,
      messages: c.messages?.[c.messages.length - 1]?.role === "assistant"
        ? c.messages.slice(0, -1) : c.messages,
    }));

    const controller = new AbortController();
    abortRef.current = controller;
    setIsThinking(true);
    setIsStreaming(true);
    appendMessage(chatId, {
      role: "assistant", content: "", createdAt: new Date(),
      model: selectedModel, streaming: true,
    });

    try {
      await streamMessage(
        chatId, lastUser.content, selectedModel, selectedMode,
        chunk => {
          if (!controller.signal.aborted) {
            setIsThinking(false);
            patchLastMessage(chatId, last => ({
              content: `${last?.content || ""}${chunk || ""}`,
            }));
          }
        },
        fileIds, controller.signal, true
      );
      if (!controller.signal.aborted) patchLastMessage(chatId, () => ({ streaming: false }));
    } catch (err) {
      if (err?.name !== "AbortError") console.error("[REGENERATE ERROR]", err);
      patchLastMessage(chatId, () => ({ streaming: false }));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsThinking(false);
      setIsStreaming(false);
    }
  }, [
    activeConversation, isStreaming, isThinking, selectedModel, selectedMode,
    updateConversation, appendMessage, patchLastMessage
  ]);

  const clearChat = useCallback(() => {
    if (!activeId) return;
    updateConversation(activeId, c => ({ ...c, messages: [], updatedAt: new Date() }));
  }, [activeId, updateConversation]);

  const value = {
    conversations, activeConversation, activeId, setActiveId, openChat,
    modelName: MODEL_NAME, selectedModel, setSelectedModel,
    selectedMode, setSelectedMode, isStreaming, isThinking,
    newChat, clearChat, deleteChat, renameChat, toggleFavorite,
    sendUserMessage, regenerateLast, stopResponse,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
