import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  bookOutline,
  documentTextOutline,
  homeOutline,
  chatbubbleOutline,
  personCircleOutline,
  documentOutline,
  attachOutline,
  micOutline,
  send,
  settingsOutline,
  chatbubbleEllipsesOutline,
  playOutline,
  pauseOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import { chatWithDeepSeek, type DeepSeekMessage } from '../utils/api';
import AttachmentModal from './AttachmentModal';
import VoiceRecordModal from './VoiceRecordModal';
import './Chat.css';

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  type?: 'text' | 'voice';
  audioUrl?: string;
  audioDuration?: number;
}

const SYSTEM_PROMPT = `You are a friendly Filipino language tutor for the SalinTayo app. Help users translate, learn, and converse in Filipino/Tagalog. Be warm, encouraging, and concise. Use appropriate emojis sparingly.`;

const formatTime = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ChatPage: React.FC = () => {
  const location = useLocation();
  const isChat = location.pathname === '/chat';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiMessages: DeepSeekMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
          .filter((m) => m.role === 'user' || m.role === 'ai')
          .map((m) => ({
            role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: m.content,
          })),
        { role: 'user', content: text },
      ];

      const reply = await chatWithDeepSeek(apiMessages);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: reply || 'Sorry, I could not generate a response. Please try again.',
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to get response';
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Sorry, something went wrong: ${errMsg}. Please check your connection and try again.`,
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    setIsAttachmentModalOpen(true);
  };

  const handleVoiceClick = () => {
    setIsVoiceModalOpen(true);
  };

  const handleAttachmentSelect = (type: 'camera' | 'gallery' | 'document' | 'voice' | 'location') => {
    console.log('Attachment selected:', type);
    
    const featureMessages: Record<string, string> = {
      camera: '📷 Camera attachment feature coming soon!',
      gallery: '🖼️ Photo/video attachment feature coming soon!',
      document: '📄 Document attachment feature coming soon!',
      voice: '🎤 Voice recording feature coming soon!',
      location: '📍 Location sharing feature coming soon!',
    };

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: featureMessages[type],
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  const handleVoiceSend = (audioBlob: Blob, caption: string) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: caption || '🎤 Voice message',
      timestamp: formatTime(),
      type: 'voice',
      audioUrl,
      audioDuration: 0,
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  const toggleVoicePlayback = (messageId: string, audioUrl: string) => {
    if (playingVoiceId === messageId) {
      audioRefs.current[messageId]?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRefs.current[messageId]) {
        audioRefs.current[messageId].play();
      } else {
        const audio = new Audio(audioUrl);
        audioRefs.current[messageId] = audio;
        audio.onended = () => setPlayingVoiceId(null);
        audio.play();
      }
      setPlayingVoiceId(messageId);
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.type === 'voice') {
      return (
        <div className="chat-voice-message">
          <button 
            className="chat-voice-play-btn"
            onClick={() => msg.audioUrl && toggleVoicePlayback(msg.id, msg.audioUrl)}
          >
            <IonIcon icon={playingVoiceId === msg.id ? pauseOutline : playOutline} />
          </button>
          <div className="chat-voice-waveform">
            <div className="chat-voice-waveform-bar"></div>
            <div className="chat-voice-waveform-bar"></div>
            <div className="chat-voice-waveform-bar"></div>
            <div className="chat-voice-waveform-bar"></div>
            <div className="chat-voice-waveform-bar"></div>
          </div>
          {msg.audioDuration && (
            <span className="chat-voice-duration">{formatDuration(msg.audioDuration)}</span>
          )}
          {msg.content !== '🎤 Voice message' && (
            <p className="chat-voice-caption">{msg.content}</p>
          )}
        </div>
      );
    }
    return <p className="chat-message__text">{msg.content}</p>;
  };

  return (
    <IonPage>
      <IonContent fullscreen className="chat-content">
        <div className="chat-page">
          <header className="chat-header-sticky">
            <div className="chat-header">
              <div className="chat-header__brand">
                <IonIcon
                  icon={chatbubbleOutline}
                  className="chat-header__chat-icon"
                  aria-hidden
                />
                <div className="chat-header__text">
                  <h1 className="chat-header__title">SalinTayo AI</h1>
                  <p className="chat-header__tagline">Translate. Learn. Converse.</p>
                </div>
              </div>
              <button
                type="button"
                className="chat-header__action-btn"
                aria-label="Open chat history or options"
              >
                <IonIcon icon={documentOutline} aria-hidden />
              </button>
            </div>
            <div className="chat-header__dots" role="tablist" aria-label="Page indicator">
              <span className="chat-header__dot" aria-hidden />
              <span className="chat-header__dot chat-header__dot--active" aria-hidden />
              <span className="chat-header__dot" aria-hidden />
            </div>
            <hr className="chat-header__divider" />
          </header>

          <section className="chat-messages" aria-label="Chat conversation">
            {messages.length === 0 && (
              <div className="chat-empty-state">
                <p>Kumusta! I&apos;m your Filipino AI tutor powered by DeepSeek-V3.</p>
                <p>Type a message below to translate, learn, or converse in Filipino.</p>
              </div>
            )}
            {isLoading && (
              <div className="chat-message chat-message--ai chat-message--loading" data-role="ai">
                <div className="chat-message__avatar">
                  <IonIcon icon={chatbubbleEllipsesOutline} aria-hidden />
                </div>
                <div className="chat-message__bubble-wrap">
                  <div className="chat-message__bubble">
                    <p className="chat-message__text chat-message__typing">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message--${msg.role} ${msg.type === 'voice' ? 'chat-message--voice' : ''}`}
                data-role={msg.role}
              >
                <div className="chat-message__avatar">
                  {msg.role === 'ai' ? (
                    <IonIcon icon={chatbubbleEllipsesOutline} aria-hidden />
                  ) : msg.type === 'voice' ? (
                    <IonIcon icon={volumeHighOutline} aria-hidden />
                  ) : (
                    <IonIcon icon={personCircleOutline} aria-hidden />
                  )}
                </div>
                <div className="chat-message__bubble-wrap">
                  <div className="chat-message__bubble">
                    {msg.role === 'ai' && (
                      <button
                        type="button"
                        className="chat-message__settings"
                        aria-label="Message options"
                      >
                        <IonIcon icon={settingsOutline} aria-hidden />
                      </button>
                    )}
                    {renderMessageContent(msg)}
                  </div>
                  <span className="chat-message__time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} aria-hidden />
          </section>

          <div className="chat-input-wrap">
            <button
              type="button"
              className="chat-input__attach"
              onClick={handleAttachmentClick}
              aria-label="Attach file"
            >
              <IonIcon icon={attachOutline} aria-hidden />
            </button>
            <input
              ref={inputRef}
              type="text"
              className="chat-input__field"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message input"
            />
            <button
              type="button"
              className="chat-input__mic"
              onClick={handleVoiceClick}
              aria-label="Voice input"
            >
              <IonIcon icon={micOutline} aria-hidden />
            </button>
            <button
              type="button"
              className="chat-input__send"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <IonIcon icon={send} aria-hidden />
            </button>
          </div>
        </div>

        <footer className="chat-footer">
          <nav className="chat-nav" aria-label="Main">
            <Link to="/learn" className="chat-nav__item">
              <IonIcon icon={bookOutline} className="chat-nav__icon" />
              <span className="chat-nav__label">Learn</span>
            </Link>
            <Link to="/quiz" className="chat-nav__item">
              <IonIcon icon={documentTextOutline} className="chat-nav__icon" />
              <span className="chat-nav__label">Quiz</span>
            </Link>
            <Link to="/home" className="chat-nav__item">
              <IonIcon icon={homeOutline} className="chat-nav__icon" />
              <span className="chat-nav__label">Home</span>
            </Link>
            <Link
              to="/chat"
              className={`chat-nav__item ${isChat ? 'chat-nav__item--active' : ''}`}
            >
              <IonIcon icon={chatbubbleOutline} className="chat-nav__icon" />
              <span className="chat-nav__label">Chat</span>
            </Link>
            <Link to="/profile" className="chat-nav__item">
              <IonIcon icon={personCircleOutline} className="chat-nav__icon" />
              <span className="chat-nav__label">Profile</span>
            </Link>
          </nav>
        </footer>
      </IonContent>

      <AttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onAttachmentSelect={handleAttachmentSelect}
      />

      <VoiceRecordModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendVoice={handleVoiceSend}
      />
    </IonPage>
  );
};

export default ChatPage;
