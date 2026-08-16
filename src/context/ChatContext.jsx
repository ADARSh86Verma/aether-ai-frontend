import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createConversation,
  getConversation,
  getConversations,
  deleteConversation as deleteConversationApi,
  renameConversation,
  favoriteConversation,
} from "../services/conversationService";

import { generateId } from "../utils/formatTime";
import {
  sendMessage,
  streamMessage,
} from "../services/chatService";

const ChatContext = createContext(null);

const MODEL_NAME = "Aether-1 Coder";

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("qwen3:8b");
  const [selectedMode, setSelectedMode] =useState("chat");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const abortRef = useRef(null);

  /* ----------------------------- */
  /* Load Conversations            */
  /* ----------------------------- */

  useEffect(() => {
    async function loadChats() {
      try {
       const data = await getConversations();

        const formatted = data.conversations.map((c) => ({
          id: c.id,
          title: c.title,
          favorite: c.favorite,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        }));

        setConversations(formatted);

        if (formatted.length) {
          setActiveId(formatted[0].id);
        } else {

          const created = await createConversation();

          const chat = {
              id: created.conversation.id,
              title: created.conversation.title,
              favorite: created.conversation.favorite,
              createdAt: new Date(),
              updatedAt: new Date(),
              messages: [],
          };

          setConversations([chat]);
          setActiveId(chat.id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadChats();
  }, []);

  /* ----------------------------- */
  /* Active Conversation           */
  /* ----------------------------- */

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  /* ----------------------------- */
  /* Update Conversation           */
  /* ----------------------------- */

  const updateConversation = useCallback((id, updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updater(c) : c))
    );
  }, []);

  /* ----------------------------- */
  /* New Chat                      */
  /* ----------------------------- */

  const newChat = useCallback(async () => {
  console.log("newChat called");

    try {
      const data = await createConversation();
      console.log("CREATE CONVERSATION:", data);

      const chat = {
        id: data.conversation.id,
        title: data.conversation.title,
        favorite: data.conversation.favorite,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      setConversations((prev) => [chat, ...prev]);
      setActiveId(chat.id);

      return chat.id;
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* ----------------------------- */
  /* Open Chat                     */
  /* ----------------------------- */

  const openChat = useCallback(async (chatId) => {
    try {
      const data = await getConversation(chatId);
      console.log("GET CONVERSATION:", data);

      const messages = Array.isArray(data.messages)
        ? data.messages.filter(Boolean).map((message) => ({
            ...message,
            id: message.id || generateId("msg"),
            content: typeof message.content === "string" ? message.content : "",
            attachments: Array.isArray(message.attachments)
              ? message.attachments.filter(Boolean)
              : [],
          }))
        : [];

      updateConversation(chatId, (old) => ({
        ...old,
        messages,
      }));

      setActiveId(chatId);
    } catch (err) {
      console.error(err);
    }
  }, [updateConversation]);

  /* ----------------------------- */
  /* Delete Chat                   */
  /* ----------------------------- */

  const deleteChat = useCallback(async (id) => {
    try {
      await deleteConversationApi(id);

      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);

        if (next.length) {
          setActiveId(next[0].id);
        } else {
          setActiveId(null);
        }

        return next;
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* ----------------------------- */
  /* Rename                        */
  /* ----------------------------- */

  const renameChat = useCallback(async (id, title) => {
    try {
      await renameConversation(id, title);

      updateConversation(id, (c) => ({
        ...c,
        title,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [updateConversation]);

  /* ----------------------------- */
  /* Favorite                      */
  /* ----------------------------- */

  const toggleFavorite = useCallback(async (id) => {
    const chat = conversations.find((c) => c.id === id);
    if (!chat) return;

    const nextFavorite = !chat.favorite;

    try {
      await favoriteConversation(id, nextFavorite);

      updateConversation(id, (c) => ({
        ...c,
        favorite: nextFavorite,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [conversations, updateConversation]);

  /* ----------------------------- */
  /* Append Message                */
  /* ----------------------------- */

  const appendMessage = useCallback((chatId, message) => {
    if (!message) return;

    const safeMessage = {
      ...message,
      id: message.id || generateId("msg"),
      content: typeof message.content === "string" ? message.content : "",
      attachments: Array.isArray(message.attachments)
        ? message.attachments.filter(Boolean)
        : [],
    };

    updateConversation(chatId, (c) => ({
      ...c,
      messages: [
        ...(Array.isArray(c.messages) ? c.messages : []),
        safeMessage,
      ],
      updatedAt: new Date(),
      title:
        c.title === "New Chat" &&
        safeMessage.role === "user" &&
        safeMessage.content
          ? safeMessage.content.slice(0, 40)
          : c.title,
    }));
  }, [updateConversation]);

  /* ----------------------------- */
  /* Patch Last                    */
  /* ----------------------------- */

  const patchLastMessage = useCallback((chatId, updater) => {
    updateConversation(chatId, (c) => {
      if (!c.messages.length) return c;

      const messages = [...c.messages];

      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        ...updater(messages[messages.length - 1]),
      };

      return {
        ...c,
        messages,
      };
    });
  }, [updateConversation]);

  /* ----------------------------- */
  /* Stop                          */
  /* ----------------------------- */

  const stopResponse = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setIsThinking(false);

    if (activeId) {
      patchLastMessage(activeId, () => ({
        streaming: false,
      }));
    }
  }, [activeId, patchLastMessage]);

  /* ----------------------------- */
  /* Stream Reply                  */
  /* ----------------------------- */

  const streamReply = useCallback(async (chatId, reply) => {
    const controller = new AbortController();

    abortRef.current = controller;

    appendMessage(chatId, {
      id: generateId("msg"),
      role: "assistant",
      model: MODEL_NAME,
      content: "",
      createdAt: new Date(),
      streaming: true,
    });

    setIsThinking(true);

    await new Promise((r) => setTimeout(r, 400));

    if (controller.signal.aborted) return;

    setIsThinking(false);
    setIsStreaming(true);

    const words = String(reply).split(/(\s+)/);

    for (const word of words) {
      if (controller.signal.aborted) break;

      await new Promise((r) => setTimeout(r, 15));

      patchLastMessage(chatId, (last) => ({
        content: last.content + word,
      }));
    }

    patchLastMessage(chatId, () => ({
      streaming: false,
    }));

    setIsStreaming(false);
  }, [appendMessage, patchLastMessage]);

  // ===== Part 2 starts here =====

  /* ----------------------------- */
  /* Clear Chat                    */
  /* ----------------------------- */

  const clearChat = useCallback(() => {
    if (!activeConversation) return;

    updateConversation(activeId, (c) => ({
      ...c,
      messages: [],
      updatedAt: new Date(),
    }));
  }, [activeConversation, activeId, updateConversation]);

  /* ----------------------------- */
  /* Send User Message             */
  /* ----------------------------- */

  const sendUserMessage = useCallback(
    async (text, attachments = []) => {
      const safeText = String(text ?? "").trim();
      const safeAttachments = Array.isArray(attachments)
        ? attachments.filter(Boolean)
        : [];

      if (!safeText && safeAttachments.length === 0) return;
      if (!activeId) return;

      const chatId = activeId;

      appendMessage(chatId, {
        id: generateId("msg"),
        role: "user",
        content: safeText || "Please analyze the attached file(s).",
        createdAt: new Date(),
        model: selectedModel,
        attachments: safeAttachments,
      });

      const controller = new AbortController();
      abortRef.current = controller;
      setIsThinking(true);
      setIsStreaming(true);

      appendMessage(chatId, {
        id: generateId("msg"),
        role: "assistant",
        model: selectedModel,
        content: "",
        createdAt: new Date(),
        streaming: true,
      });

      try {
        await streamMessage(
          chatId,
          safeText || "Please analyze the attached file(s).",
          selectedModel,
          selectedMode,
          (chunk) => {
            if (controller.signal.aborted) return;

            patchLastMessage(chatId, (last) => ({
              content: `${last.content || ""}${chunk || ""}`,
            }));
          },
          safeAttachments.map((file) => file.id).filter(Boolean),
          controller.signal
        );

        if (!controller.signal.aborted) {
          patchLastMessage(chatId, () => ({
            streaming: false,
          }));
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          patchLastMessage(chatId, () => ({
            streaming: false,
          }));
          return;
        }

        console.error(err);

        patchLastMessage(chatId, () => ({
          streaming: false,
        }));

        appendMessage(chatId, {
          id: generateId("msg"),
          role: "assistant",
          model: MODEL_NAME,
          createdAt: new Date(),
          content:
            err?.message ||
            "Unable to connect to backend.",
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }

        setIsThinking(false);
        setIsStreaming(false);
      }
    },
    [
      activeId,
      selectedModel,
      selectedMode,
      appendMessage,
      patchLastMessage,
    ]
  );

  /* ----------------------------- */
  /* Regenerate                    */
  /* ----------------------------- */

  const regenerateLast = useCallback(async () => {
    if (!activeConversation) return;

    const lastUser = [...activeConversation.messages]
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUser) return;

    const chatId = activeConversation.id;

    updateConversation(chatId, (c) => ({
      ...c,
      messages:
        c.messages[c.messages.length - 1]?.role === "assistant"
          ? c.messages.slice(0, -1)
          : c.messages,
    }));

    try {
      const fileIds = Array.isArray(lastUser.attachments)
        ? lastUser.attachments.filter(Boolean).map((file) => file.id).filter(Boolean)
        : [];

      const reply = await sendMessage(
        chatId,
        lastUser.content,
        selectedModel,
        selectedMode,
        fileIds
      );

      await streamReply(chatId, reply);

    } catch (err) {
      console.error(err);
    }
  }, [
    activeConversation,
    selectedModel,
    selectedMode,
    streamReply,
    updateConversation,
  ]);

  /* ----------------------------- */
  /* Provider                      */
  /* ----------------------------- */

  const value = {
    conversations,

    activeConversation,

    activeId,
    setActiveId,

    openChat,

    modelName: MODEL_NAME,

    selectedModel,
    setSelectedModel,

    selectedMode,
    setSelectedMode,

    isStreaming,
    isThinking,

    newChat,
    clearChat,
    deleteChat,
    renameChat,
    toggleFavorite,

    sendUserMessage,
    regenerateLast,
    stopResponse,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

/* ----------------------------- */
/* Hook                          */
/* ----------------------------- */

export function useChat() {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error(
      "useChat must be used inside ChatProvider"
    );
  }

  return ctx;
}
