"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Send,
  Loader2,
  FileText,
  X,
  Bot,
  User,
  AlertCircle,
  Copy,
  BookOpen,
  Search,
  HelpCircle,
  CheckCircle,
  Sun, MoonStar
} from "lucide-react";
import "./App.css";
import { retry } from "../utils/retry";
import ReactMarkdown from "react-markdown";

interface Message {
  type: "user" | "ai" | "error";
  content: string;
  timestamp: string;
  id: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload only PDF files.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setCurrentFile(uploadedFile);
      setShowWelcome(false);
      setError(null);

      // Add a system message to confirm file upload
      const systemMessage: Message = {
        type: "ai",
        content: `I've loaded "${uploadedFile.name}" (${(
          uploadedFile.size /
          (1024 * 1024)
        ).toFixed(2)} MB). You can now ask questions about this document.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        id: generateId(),
      };

      const uploadForm = new FormData();
      uploadForm.append("file", uploadedFile);

      const uploadRes = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        return new Response("Failed to upload PDF to RAG backend", { status: 500 });
      }

      setMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.log(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.type === "ai" && !lastMessage?.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark-theme");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!currentFile) {
      setError("Please upload a PDF file before asking questions.");
      return;
    }

    setShowWelcome(false);
    setError(null);

    const userMessage: Message = {
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("question", input);

      const makeRequest = async () => {
        const response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
        }

        return response;
      };

      const response = await retry(makeRequest, {
        maxAttempts: 3,
        delayMs: 2000,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} after error:`, error);
          setMessages((prev) => [
            ...prev,
            {
              type: "error",
              content: `Connection failed. Retrying... (${attempt}/3)`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              id: generateId(),
            },
          ]);
        },
      });

      if (!response.body) {
        throw new Error("No response received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamError = false;

      const aiMessage: Message = {
        type: "ai",
        content: "",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        id: generateId(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const lastMsgIndex = prev.length - 1;
            return prev.map((msg, index) =>
              index === lastMsgIndex
                ? { ...msg, content: msg.content + chunk }
                : msg
            );
          });
        } catch (streamErr) {
          console.error("Stream error:", streamErr);
          streamError = true;
          break;
        }
      }

      if (streamError) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.type === "ai") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                type: "error",
                content:
                  "Sorry, there was an error processing your request. Please try again.",
              },
            ];
          }
          return prev;
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error.name === "AbortError"
          ? "Request was cancelled"
          : error.message === "Network Error"
            ? "Connection failed. Please check your internet connection."
            : error.message || "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Format message content with code highlighting

  return (
    <div className={`chat-wrapper ${theme === "dark" ? "dark-theme" : ""}  `}>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="logo">
            <Bot className="bot-icon" />
            <h1>EduMatrix AI</h1>
          </div> <div className="header-actions"> <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Sun size={18} /> : <MoonStar size={18} />}
          </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn button-with-tooltip"
              title="Upload PDF"
              data-tooltip="Upload a PDF document"
            >
              <Plus />
              <span>Upload PDF</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />
          </div>
        </div>

        {/* Error Message Banner */}
        {error && (
          <div className="error-banner">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="error-dismiss">
              <X size={16} />
            </button>
          </div>
        )}

        {/* File Display */}
        {currentFile && (
          <div className="file-indicator">
            <div className="file-info">
              <FileText className="file-icon" />
              <span className="file-name">
                {currentFile.name}
                <span className="file-size">
                  {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </span>
            </div>
            <button
              onClick={() => setCurrentFile(null)}
              className="remove-file-btn"
              title="Remove file"
            >
              <X />
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div ref={chatContainerRef} className="messages-container">
          {showWelcome && (
            <div className="welcome-message">
              <Bot className="welcome-icon" />
              <h2>Welcome to EduMatrix AI!</h2>
              <p>
                Upload a PDF document and ask me questions about it. I&apos;m
                here to help you understand your documents better.
              </p>
              <div className="welcome-features">
                <div className="feature">
                  <BookOpen size={24} />
                  <div className="feature-text">
                    <h3>Document Analysis</h3>
                    <p>Upload any PDF document for instant analysis</p>
                  </div>
                </div>
                <div className="feature">
                  <Search size={24} />
                  <div className="feature-text">
                    <h3>Ask Questions</h3>
                    <p>Get precise answers from your document content</p>
                  </div>
                </div>
                <div className="feature">
                  <HelpCircle size={24} />
                  <div className="feature-text">
                    <h3>Contextual Understanding</h3>
                    <p>AI understands document context for better answers</p>
                  </div>
                </div>
              </div>
              <button
                className="get-started-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={18} />
                Get Started with a PDF
              </button>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.type}-wrapper`}
            >
              <div className={`message ${message.type}-message`}>
                <div className="message-header">
                  {message.type === "user" ? (
                    <User className="user-icon" />
                  ) : message.type === "error" ? (
                    <AlertCircle className="error-icon" />
                  ) : (
                    <Bot className="bot-icon" />
                  )}
                </div>
                <div className="message-content">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <span className="timestamp">{message.timestamp}</span>

                  {/* Message actions */}
                  {message.content && message.type === "ai" && (
                    <div className="message-actions">
                      <button
                        className="action-button"
                        onClick={() =>
                          copyToClipboard(message.content, message.id)
                        }
                        title="Copy to clipboard"
                      >
                        {copied === message.id ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="typing-indicator">
              <div className="typing-bubble">
                <Loader2 className="typing-icon" />
                <span>EduMatrix is thinking...</span>
              </div>
              <button
                className="stop-button"
                onClick={handleStop}
                title="Stop generating"
              >
                <X size={16} />
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentFile
                ? "Ask me anything about your document..."
                : "Please upload a PDF first"
            }
            disabled={isLoading || !currentFile}
            className="message-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !currentFile}
            className="send-button"
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="loading-icon" />
            ) : (
              <Send className="send-icon" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
