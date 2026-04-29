import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  ImagePlus,
  Leaf,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  Wrench,
  X,
} from 'lucide-react';
import './Chatbot.css';

const QUICK_CHIPS = [
  { icon: '🌾', label: 'Crop Doctor', prompt: 'Diagnose my crop disease from symptoms' },
  { icon: '🌱', label: 'Fertilizer Plan', prompt: 'Best fertilizer schedule for rice this season' },
  { icon: '💧', label: 'Irrigation', prompt: 'When should I irrigate based on soil moisture?' },
  { icon: '🐛', label: 'Pest Control', prompt: 'Pest alert: identify and control aphids on tomato' },
  { icon: '🌤️', label: 'Weather', prompt: 'What is the weather forecast for my farm this week?' },
];

const ONBOARDING_ITEMS = [
  { id: 'ob1', label: 'Connect your farm location 📍' },
  { id: 'ob2', label: 'Add your crop types and field size 🌾' },
  { id: 'ob3', label: 'Link your soil sensor or upload a report 🧪' },
  { id: 'ob4', label: 'Ask your first question to AgriMind AI 🤖' },
];

const INITIAL_ONBOARDING = {
  ob1: false,
  ob2: false,
  ob3: false,
  ob4: false,
};

function convertImageToJpegDataUrl(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas is not available for image processing.'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image could not be loaded.'));
    };

    image.src = objectUrl;
  });
}

function getGreetingText() {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.error === 'string') return data.error;
  return fallback;
}

function AgriMindMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C7 17.45 10.12 14 17 12.5V16L21 12L17 8Z" />
    </svg>
  );
}

function GreetingEmblem() {
  return (
    <svg className="agri-chat__greeting-emblem" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="23" stroke="rgba(90,172,90,0.2)" strokeWidth="1" />
      <path d="M34 10C20 14 14 22 12 38c4-2 16-6 22-18v6l6-6-6-8z" fill="#5aac5a" opacity="0.9" />
      <path d="M14 38c2-8 6-14 12-18" stroke="#7dcf7d" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [onboarding, setOnboarding] = useState(INITIAL_ONBOARDING);

  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  const greetingText = useMemo(() => `${getGreetingText()}, Farmer`, []);
  const onboardingDoneCount = Object.values(onboarding).filter(Boolean).length;
  const canSend = !isLoading && (input.trim().length > 0 || Boolean(attachment));

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }, [input, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [isOpen, isChatMode]);

  const scrollMessagesToBottom = () => {
    if (!isOpen || !isChatMode || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    if (!isOpen || !isChatMode || !messagesContainerRef.current) return undefined;

    let frameId = 0;
    let nestedFrameId = 0;

    frameId = window.requestAnimationFrame(() => {
      scrollMessagesToBottom();
      nestedFrameId = window.requestAnimationFrame(() => {
        scrollMessagesToBottom();
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(nestedFrameId);
    };
  }, [messages, isLoading, isOpen, isChatMode]);

  useEffect(() => {
    if (!isOpen || !isChatMode || !messages.length || !messagesContainerRef.current) return undefined;

    let frameId = 0;
    let nestedFrameId = 0;

    frameId = window.requestAnimationFrame(() => {
      scrollMessagesToBottom();
      nestedFrameId = window.requestAnimationFrame(() => {
        scrollMessagesToBottom();
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(nestedFrameId);
    };
  }, [isChatMode, isOpen]);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  const resetAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const invalidatePendingRequest = () => {
    activeRequestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  const resetChat = () => {
    invalidatePendingRequest();
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setIsChatMode(false);
    resetAttachment();
    setOnboarding((prev) => ({ ...prev, ob4: false }));
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const normalizedUrl = await convertImageToJpegDataUrl(file);
      setAttachment({
        name: `${file.name.replace(/\.[^.]+$/, '')}.jpg`,
        url: normalizedUrl,
      });
      setIsOpen(true);
    } catch (error) {
      console.error('Image processing error:', error);
      resetAttachment();
      setIsOpen(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not process that image. Please try another JPG, PNG, or WEBP file.',
        },
      ]);
      setIsChatMode(true);
    }
  };

  const buildUserContent = () => {
    if (!attachment) return input.trim();

    const content = [];
    if (input.trim()) {
      content.push({ type: 'text', text: input.trim() });
    } else {
      content.push({ type: 'text', text: 'Please analyze this crop image.' });
    }

    content.push({
      type: 'image_url',
      image_url: { url: attachment.url },
    });

    return content;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading || !canSend) return;

    const userMessage = { role: 'user', content: buildUserContent() };
    const nextMessages = [...messages, userMessage];
    const requestId = activeRequestIdRef.current + 1;
    const abortController = new AbortController();

    activeRequestIdRef.current = requestId;
    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;

    setMessages(nextMessages);
    setInput('');
    resetAttachment();
    setIsLoading(true);
    setIsOpen(true);
    setIsChatMode(true);
    setOnboarding((prev) => ({ ...prev, ob4: true }));

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data?.reply || '' }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: getErrorMessage(data, 'Oops, I encountered an error.'),
          },
        ]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Could not connect to the server. Is it running?',
        },
      ]);
    } finally {
      if (requestId === activeRequestIdRef.current) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        handleSubmit(event);
      }
    }
  };

  const handleChipClick = (prompt) => {
    setInput(prompt);
    setIsOpen(true);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const toggleOnboarding = (id) => {
    setOnboarding((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMessageContent = (content) => {
    if (typeof content === 'string') {
      return <div className="agri-chat__message-text">{content}</div>;
    }

    return (
      <div className="agri-chat__message-stack">
        {content.map((item, index) => {
          if (item.type === 'text') {
            return (
              <div key={`${item.type}-${index}`} className="agri-chat__message-text">
                {item.text}
              </div>
            );
          }

          return (
            <img
              key={`${item.type}-${index}`}
              src={item.image_url.url}
              alt="Uploaded crop"
              className="agri-chat__message-image"
            />
          );
        })}
      </div>
    );
  };

  const renderComposer = (variant) => (
    <form className={`agri-chat__composer agri-chat__composer--${variant}`} onSubmit={handleSubmit}>
      {attachment && (
        <div className="agri-chat__attachment-preview">
          <img src={attachment.url} alt={attachment.name} className="agri-chat__attachment-thumb" />
          <div className="agri-chat__attachment-meta">
            <span>{attachment.name}</span>
            <small>Ready to send with your next question</small>
          </div>
          <button
            type="button"
            className="agri-chat__attachment-remove"
            onClick={resetAttachment}
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="agri-chat__composer-shell">
        <textarea
          ref={textareaRef}
          className="agri-chat__textarea"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crop health, soil, weather, pests..."
          rows={2}
        />

        <div className="agri-chat__composer-footer">
          <div className="agri-chat__composer-actions">
            <button
              type="button"
              className="agri-chat__icon-btn"
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={14} />
            </button>
            <button
              type="button"
              className="agri-chat__icon-btn"
              aria-label="Upload image"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="agri-chat__file-input"
              onChange={handleImageSelect}
              disabled={isLoading}
            />
          </div>

          <div className="agri-chat__composer-submit">
            <select className="agri-chat__model-select" defaultValue="AgriMind Pro" disabled aria-label="Model selection">
              <option>AgriMind Pro</option>
              <option>AgriMind Lite</option>
            </select>
            <button
              type="submit"
              className={`agri-chat__send-btn ${canSend ? 'is-active' : ''}`}
              disabled={!canSend || isLoading}
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <div className="agri-chat">
      {!isOpen && (
        <button className="agri-chat__trigger" onClick={() => setIsOpen(true)} aria-label="Open AgriMind chatbot">
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="agri-chat__overlay" role="dialog" aria-modal="true" aria-label="AgriMind chatbot workspace">
          <div className="agri-chat__shell">
            <aside className="agri-chat__sidebar">
              <button type="button" className="agri-chat__logo" aria-label="AgriMind home">
                <AgriMindMark />
              </button>

              <button type="button" className="agri-chat__sidebar-btn is-active" onClick={resetChat} aria-label="New chat">
                <Plus size={18} />
              </button>
              <button type="button" className="agri-chat__sidebar-btn" aria-label="Search">
                <Search size={18} />
              </button>
              <button type="button" className="agri-chat__sidebar-btn" aria-label="Tools">
                <Wrench size={18} />
              </button>

              <div className="agri-chat__sidebar-spacer" />

              <button type="button" className="agri-chat__sidebar-btn" aria-label="Download">
                <Download size={18} />
              </button>

              <div className="agri-chat__avatar" aria-hidden="true">
                R
              </div>
            </aside>

            <div className={`agri-chat__panel ${isChatMode ? 'is-chat' : ''}`}>
              <header className="agri-chat__topbar">
                <div className="agri-chat__plan-badge">
                  <span>Unlimited crop guidance</span>
                  <span className="agri-chat__plan-separator">·</span>
                  <span>Any time, anywhere</span>
                </div>

                <button type="button" className="agri-chat__close-btn" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
                  <X size={18} />
                </button>
              </header>

              <div className="agri-chat__content">
                {!isChatMode ? (
                  <div className="agri-chat__welcome">
                    <div className="agri-chat__greeting">
                      <GreetingEmblem />
                      <h1 className="agri-chat__greeting-text">{greetingText}</h1>
                    </div>

                    <p className="agri-chat__welcome-subtitle">
                      AgriMind is ready whenever you need crop advice, field guidance, or image-based help.
                    </p>

                    {renderComposer('welcome')}

                    <div className="agri-chat__chips">
                      {QUICK_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          className="agri-chat__chip"
                          onClick={() => handleChipClick(chip.prompt)}
                        >
                          <span className="agri-chat__chip-icon">{chip.icon}</span>
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>

                    <section className="agri-chat__onboarding">
                      <div className="agri-chat__onboarding-header">
                        <span className="agri-chat__onboarding-title">Get started with AgriMind</span>
                        <span className="agri-chat__onboarding-progress">
                          {onboardingDoneCount} of {ONBOARDING_ITEMS.length} completed
                        </span>
                      </div>

                      <div className="agri-chat__onboarding-list">
                        {ONBOARDING_ITEMS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`agri-chat__onboarding-item ${onboarding[item.id] ? 'is-done' : ''}`}
                            onClick={() => toggleOnboarding(item.id)}
                          >
                            <span className="agri-chat__onboarding-check" aria-hidden="true" />
                            <span className="agri-chat__onboarding-label">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="agri-chat__thread">
                    <div ref={messagesContainerRef} className="agri-chat__messages">
                      {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`agri-chat__message agri-chat__message--${message.role}`}>
                          <div className="agri-chat__message-avatar" aria-hidden="true">
                            {message.role === 'assistant' ? <Leaf size={15} /> : 'R'}
                          </div>
                          <div className={`agri-chat__message-bubble agri-chat__message-bubble--${message.role}`}>
                            {renderMessageContent(message.content)}
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="agri-chat__message agri-chat__message--assistant">
                          <div className="agri-chat__message-avatar" aria-hidden="true">
                            <Leaf size={15} />
                          </div>
                          <div className="agri-chat__message-bubble agri-chat__message-bubble--assistant agri-chat__message-bubble--typing">
                            <div className="agri-chat__typing">
                              <span />
                              <span />
                              <span />
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={bottomRef} />
                    </div>
                  </div>
                )}
              </div>

              {isChatMode && (
                <div className="agri-chat__footer-bar">
                  {renderComposer('chat')}
                  <p className="agri-chat__hint">
                    AgriMind can make mistakes. Always verify critical farm decisions with a local agronomist.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
