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
import { streamMessage } from "../services/chatService";

const ChatContext = createContext(null);

const MODEL_NAME = "Aether-1 Coder";

/* =========================================================
   MESSAGE NORMALIZER
========================================================= */

function normalizeMessage(message) {
  if (!message || typeof message !== "object") {
    return null;
  }

  return {
    ...message,

    id:
      message.id ||
      message._id ||
      generateId("msg"),

    role:
      message.role === "user"
        ? "user"
        : "assistant",

    content:
      typeof message.content === "string"
        ? message.content
        : "",

    createdAt:
      message.createdAt ||
      message.created_at ||
      new Date(),

    attachments:
      Array.isArray(message.attachments)
        ? message.attachments.filter(Boolean)
        : [],

    streaming:
      Boolean(message.streaming),
  };
}

/* =========================================================
   CONVERSATION NORMALIZER
========================================================= */

function normalizeConversation(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const id =
    value.id ||
    value._id ||
    value.chat_id ||
    value.conversation_id ||
    null;

  if (!id) {
    return null;
  }

  return {
    id,

    title:
      value.title ||
      "New Chat",

    favorite:
      Boolean(value.favorite),

    createdAt:
      value.createdAt ||
      value.created_at ||
      new Date(),

    updatedAt:
      value.updatedAt ||
      value.updated_at ||
      new Date(),

    messages:
      Array.isArray(value.messages)
        ? value.messages
            .map(normalizeMessage)
            .filter(Boolean)
        : [],
  };
}

/* =========================================================
   EXTRACT CONVERSATION LIST
   Supports:
   []
   { conversations: [] }
   { data: [] }
   { items: [] }
========================================================= */

function extractConversationList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.conversations)
  ) {
    return response.conversations;
  }

  if (
    response &&
    Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    Array.isArray(response.items)
  ) {
    return response.items;
  }

  return [];
}

/* =========================================================
   EXTRACT CREATED CONVERSATION
========================================================= */

function extractCreatedConversation(response) {
  if (!response) {
    return null;
  }

  if (response.conversation) {
    return response.conversation;
  }

  if (response.data?.conversation) {
    return response.data.conversation;
  }

  if (response.data?.id) {
    return response.data;
  }

  if (
    response.id ||
    response._id ||
    response.chat_id ||
    response.conversation_id
  ) {
    return response;
  }

  return null;
}

/* =========================================================
   PROVIDER
========================================================= */

export function ChatProvider({ children }) {
  const [conversations, setConversations] =
    useState([]);

  const [activeId, setActiveId] =
    useState(null);

  const [selectedModel, setSelectedModel] =
    useState("qwen3:8b");

  const [selectedMode, setSelectedMode] =
    useState("chat");

  const [isStreaming, setIsStreaming] =
    useState(false);

  const [isThinking, setIsThinking] =
    useState(false);

  const abortRef = useRef(null);

  /* =======================================================
     UPDATE CONVERSATION
  ======================================================= */

  const updateConversation = useCallback(
    (id, updater) => {
      if (!id) return;

      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== id) {
            return conversation;
          }

          return updater(conversation);
        })
      );
    },
    []
  );

  /* =======================================================
     APPEND MESSAGE
  ======================================================= */

  const appendMessage = useCallback(
    (chatId, message) => {
      const safeMessage =
        normalizeMessage(message);

      if (!chatId || !safeMessage) {
        return;
      }

      updateConversation(
        chatId,
        (conversation) => ({
          ...conversation,

          messages: [
            ...(Array.isArray(
              conversation.messages
            )
              ? conversation.messages
              : []),

            safeMessage,
          ],

          updatedAt: new Date(),

          title:
            conversation.title === "New Chat" &&
            safeMessage.role === "user" &&
            safeMessage.content
              ? safeMessage.content.slice(0, 40)
              : conversation.title,
        })
      );
    },
    [updateConversation]
  );

  /* =======================================================
     PATCH LAST MESSAGE
  ======================================================= */

  const patchLastMessage = useCallback(
    (chatId, updater) => {
      updateConversation(
        chatId,
        (conversation) => {
          const messages = Array.isArray(
            conversation.messages
          )
            ? [...conversation.messages]
            : [];

          if (!messages.length) {
            return conversation;
          }

          const current =
            messages[messages.length - 1];

          const updated =
            typeof updater === "function"
              ? updater(current)
              : updater;

          messages[
            messages.length - 1
          ] = normalizeMessage({
            ...current,
            ...updated,
          });

          return {
            ...conversation,
            messages,
            updatedAt: new Date(),
          };
        }
      );
    },
    [updateConversation]
  );

  /* =======================================================
     LOAD CONVERSATIONS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadChats() {
      try {
        console.log(
          "[CHAT] Loading conversations..."
        );

        const response =
          await getConversations();

        console.log(
          "[CHAT] Conversations response:",
          response
        );

        if (cancelled) {
          return;
        }

        const list =
          extractConversationList(response);

        const formatted = list
          .map(normalizeConversation)
          .filter(Boolean);

        console.log(
          "[CHAT] Normalized conversations:",
          formatted
        );

        /* ---------------------------------------------
           Existing conversations
        --------------------------------------------- */

        if (formatted.length > 0) {
          setConversations(formatted);
          setActiveId(formatted[0].id);
          return;
        }

        /* ---------------------------------------------
           No conversations → create first chat
        --------------------------------------------- */

        console.log(
          "[CHAT] No conversations. Creating first chat..."
        );

        const created =
          await createConversation();

        if (cancelled) {
          return;
        }

        console.log(
          "[CHAT] Created conversation:",
          created
        );

        const createdConversation =
          extractCreatedConversation(created);

        const chat =
          normalizeConversation(
            createdConversation
          );

        if (!chat?.id) {
          throw new Error(
            "Server did not return a valid conversation ID."
          );
        }

        setConversations([chat]);
        setActiveId(chat.id);

      } catch (error) {
        if (!cancelled) {
          console.error(
            "[LOAD CONVERSATIONS ERROR]",
            error
          );

          setConversations([]);
          setActiveId(null);
        }
      }
    }

    loadChats();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     ACTIVE CONVERSATION
  ======================================================= */

  const activeConversation = useMemo(() => {
    if (!activeId) {
      return null;
    }

    return (
      conversations.find(
        (conversation) =>
          conversation.id === activeId
      ) || null
    );
  }, [conversations, activeId]);

  /* =======================================================
     NEW CHAT
  ======================================================= */

  const newChat = useCallback(async () => {
    try {
      console.log(
        "[CHAT] Creating new conversation..."
      );

      const response =
        await createConversation();

      console.log(
        "[CHAT] CREATE CONVERSATION:",
        response
      );

      const rawConversation =
        extractCreatedConversation(response);

      const chat =
        normalizeConversation(
          rawConversation
        );

      if (!chat?.id) {
        throw new Error(
          "Server did not return a valid conversation ID."
        );
      }

      setConversations((previous) => [
        chat,
        ...previous.filter(
          (conversation) =>
            conversation.id !== chat.id
        ),
      ]);

      setActiveId(chat.id);

      return chat.id;

    } catch (error) {
      console.error(
        "[NEW CHAT ERROR]",
        error
      );

      throw error;
    }
  }, []);

  /* =======================================================
     OPEN CHAT
  ======================================================= */

  const openChat = useCallback(
    async (chatId) => {
      if (!chatId) {
        return;
      }

      try {
        const response =
          await getConversation(chatId);

        console.log(
          "[CHAT] Open conversation:",
          response
        );

        const raw =
          response?.conversation ||
          response?.data?.conversation ||
          response?.data ||
          response;

        const normalized =
          normalizeConversation(raw);

        if (!normalized) {
          throw new Error(
            "Invalid conversation response."
          );
        }

        updateConversation(
          chatId,
          (oldConversation) => ({
            ...oldConversation,

            ...normalized,

            messages:
              normalized.messages || [],
          })
        );

        setActiveId(chatId);

      } catch (error) {
        console.error(
          "[OPEN CHAT ERROR]",
          error
        );
      }
    },
    [updateConversation]
  );

  /* =======================================================
     DELETE CHAT
  ======================================================= */

  const deleteChat = useCallback(
    async (chatId) => {
      if (!chatId) {
        return;
      }

      try {
        await deleteConversationApi(
          chatId
        );

        setConversations(
          (previous) =>
            previous.filter(
              (conversation) =>
                conversation.id !== chatId
            )
        );

        setActiveId(
          (currentActiveId) => {
            if (
              currentActiveId !== chatId
            ) {
              return currentActiveId;
            }

            const remaining =
              conversations.filter(
                (conversation) =>
                  conversation.id !== chatId
              );

            return remaining[0]?.id || null;
          }
        );

      } catch (error) {
        console.error(
          "[DELETE CHAT ERROR]",
          error
        );

        throw error;
      }
    },
    [conversations]
  );

  /* =======================================================
     RENAME CHAT
  ======================================================= */

  const renameChat = useCallback(
    async (chatId, title) => {
      if (!chatId || !title?.trim()) {
        return;
      }

      try {
        const response =
          await renameConversation(
            chatId,
            title.trim()
          );

        updateConversation(
          chatId,
          (conversation) => ({
            ...conversation,

            title:
              response?.conversation?.title ||
              response?.title ||
              title.trim(),
          })
        );

      } catch (error) {
        console.error(
          "[RENAME CHAT ERROR]",
          error
        );

        throw error;
      }
    },
    [updateConversation]
  );

  /* =======================================================
     FAVORITE CHAT
  ======================================================= */

  const toggleFavorite = useCallback(
    async (chatId, favorite) => {
      if (!chatId) {
        return;
      }

      try {
        const response =
          await favoriteConversation(
            chatId,
            Boolean(favorite)
          );

        updateConversation(
          chatId,
          (conversation) => ({
            ...conversation,

            favorite:
              response?.conversation
                ?.favorite ??
              response?.favorite ??
              Boolean(favorite),
          })
        );

      } catch (error) {
        console.error(
          "[FAVORITE CHAT ERROR]",
          error
        );

        throw error;
      }
    },
    [updateConversation]
  );

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendUserMessage = useCallback(
    async (content, attachments = []) => {
      const text =
        typeof content === "string"
          ? content.trim()
          : "";

      if (!text && !attachments.length) {
        return;
      }

      let chatId = activeId;

      /* ---------------------------------------------
         Create chat automatically if none exists
      --------------------------------------------- */

      if (!chatId) {
        chatId = await newChat();

        if (!chatId) {
          throw new Error(
            "Unable to create a conversation."
          );
        }
      }

      /* ---------------------------------------------
         User message
      --------------------------------------------- */

      const userMessage =
        normalizeMessage({
          id: generateId("msg"),
          role: "user",
          content: text,
          attachments,
          createdAt: new Date(),
        });

      appendMessage(
        chatId,
        userMessage
      );

      /* ---------------------------------------------
         AI placeholder
      --------------------------------------------- */

      const assistantMessage =
        normalizeMessage({
          id: generateId("msg"),
          role: "assistant",
          content: "",
          streaming: true,
          createdAt: new Date(),
        });

      appendMessage(
        chatId,
        assistantMessage
      );

      setIsStreaming(true);
      setIsThinking(true);

      try {
        if (abortRef.current) {
          abortRef.current.abort();
        }

        const controller =
          new AbortController();

        abortRef.current =
          controller;

        await streamMessage(
          {
            conversation_id: chatId,
            message: text,
            model: selectedModel,
            mode: selectedMode,
            attachments,
          },
          {
            signal:
              controller.signal,

            onStart: () => {
              setIsThinking(false);
            },

            onToken: (token) => {
              if (!token) {
                return;
              }

              setIsThinking(false);

              patchLastMessage(
                chatId,
                (message) => ({
                  content:
                    (message.content || "") +
                    token,

                  streaming: true,
                })
              );
            },

            onComplete: () => {
              setIsThinking(false);

              patchLastMessage(
                chatId,
                () => ({
                  streaming: false,
                })
              );
            },

            onError: (error) => {
              console.error(
                "[STREAM ERROR]",
                error
              );

              setIsThinking(false);

              patchLastMessage(
                chatId,
                (message) => ({
                  content:
                    message.content ||
                    "Sorry, something went wrong.",

                  streaming: false,
                })
              );
            },
          }
        );

      } catch (error) {
        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "[SEND MESSAGE ERROR]",
            error
          );

          patchLastMessage(
            chatId,
            (message) => ({
              content:
                message.content ||
                "Unable to get a response from the AI.",

              streaming: false,
            })
          );
        }
      } finally {
        setIsStreaming(false);
        setIsThinking(false);
        abortRef.current = null;
      }
    },
    [
      activeId,
      newChat,
      appendMessage,
      patchLastMessage,
      selectedModel,
      selectedMode,
    ]
  );

  /* =======================================================
     STOP GENERATION
  ======================================================= */

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    setIsStreaming(false);
    setIsThinking(false);

    if (activeId) {
      patchLastMessage(
        activeId,
        () => ({
          streaming: false,
        })
      );
    }
  }, [
    activeId,
    patchLastMessage,
  ]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      conversations,
      activeId,
      activeConversation,

      selectedModel,
      setSelectedModel,

      selectedMode,
      setSelectedMode,

      isStreaming,
      isThinking,

      newChat,
      openChat,
      deleteChat,
      renameChat,
      toggleFavorite,

      sendUserMessage,
      stopGeneration,

      appendMessage,
      patchLastMessage,

      MODEL_NAME,
    }),
    [
      conversations,
      activeId,
      activeConversation,
      selectedModel,
      selectedMode,
      isStreaming,
      isThinking,
      newChat,
      openChat,
      deleteChat,
      renameChat,
      toggleFavorite,
      sendUserMessage,
      stopGeneration,
      appendMessage,
      patchLastMessage,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useChat() {
  const context =
    useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChat must be used inside ChatProvider."
    );
  }

  return context;
}

export default ChatContext;