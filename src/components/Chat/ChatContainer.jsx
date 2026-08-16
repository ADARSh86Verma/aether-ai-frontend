import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiErrorWarningLine,
  RiStopCircleLine,
} from "react-icons/ri";

import WelcomeScreen from "./WelcomeScreen.jsx";
import MessageBubble from "../Message/MessageBubble.jsx";
import ChatInput from "../Input/ChatInput.jsx";
import Button from "../Common/Button.jsx";

import { useChat } from "../../context/ChatContext.jsx";

import "./ChatContainer.scss";
import CodingLoader from "../Common/CodingLoader";

export default function ChatContainer() {
  const {
    activeConversation,
    sendUserMessage,
    regenerateLast,
    stopResponse,
    isStreaming,
    isThinking,
  } = useChat();

  const [error, setError] = useState("");

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  const messages = activeConversation?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages.length,
    messages[messages.length - 1]?.content,
  ]);

  const handleSend = async (text, attachments = []) => {
    setError("");

    try {
      await sendUserMessage(text, attachments);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Unknown error.");
      }
    }
  };

  const lastMessage = messages[messages.length - 1];

  const showThinking =
    isThinking &&
    lastMessage?.role === "assistant";

  return (
    <section className="chat-container">
      <div
        className="chat-container__scroll"
        ref={scrollRef}
      >
        {messages.length === 0 ? (
          <WelcomeScreen onPick={handleSend} />
        ) : (
          <div className="chat-container__messages">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isThinking={
                    showThinking &&
                    index === messages.length - 1
                  }
                  canRegenerate={
                    index === messages.length - 1 &&
                    !isStreaming &&
                    !isThinking &&
                    message.role === "assistant"
                  }
                  onRegenerate={regenerateLast}
                />
              ))}
            </AnimatePresence>

           {/* Claude Style AI Loader */}
            <AnimatePresence>
              {(isThinking || isStreaming) && (
                <motion.div
                  className="chat-container__loader"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <CodingLoader />
                </motion.div>
              )}
            </AnimatePresence>

            {!!error && (
              <motion.div
                className="chat-container__error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <RiErrorWarningLine />
                <span>{error}</span>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="chat-container__footer">
        {isStreaming && (
          <div className="chat-container__stop">
            <Button
              variant="glass"
              size="sm"
              icon={<RiStopCircleLine />}
              onClick={stopResponse}
            >
              Stop generating
            </Button>
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          disabled={isStreaming || isThinking}
        />
      </div>
    </section>
  );
}