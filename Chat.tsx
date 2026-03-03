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
  imageOutline,
  trashOutline,
  eyeOutline,
  close,
  add,
  cameraOutline,
  imagesOutline,
  checkmark,
  chevronBack,
  chevronForward,
} from 'ionicons/icons';
import { translateWithOpenNMT } from '../utils/translationApi';
import AttachmentModal from './AttachmentModal';
import VoiceRecordModal from './VoiceRecordModal';
import CameraModal from './CameraModal';
import './Chat.css';

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  type?: 'text' | 'voice' | 'image';
  audioUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  translationMode?: 'ocr' | 'describe' | 'ask';
}

interface PendingImage {
  id: string;
  data: string;
  caption: string;
  selected: boolean;
}

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
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  // Image attachment state - Messenger/DeepSeek style
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isImageTrayOpen, setIsImageTrayOpen] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
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
      const reply = await translateWithOpenNMT(text, 'en', 'fil');
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
        content: `Sorry, something went wrong: ${errMsg}. Please make sure the translation server is running.`,
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
    if (type === 'camera') {
      setIsAttachmentModalOpen(false);
      setIsCameraModalOpen(true);
      return;
    }
    
    if (type === 'gallery') {
      filePickerRef.current?.click();
      setIsAttachmentModalOpen(false);
      return;
    }
    
    const featureMessages: Record<string, string> = {
      document: '📄 Document attachment coming soon!',
      voice: '🎤 Voice recording coming soon!',
      location: '📍 Location sharing coming soon!',
    };

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: featureMessages[type],
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAttachmentModalOpen(false);
  };

  const handleCameraCapture = (imageData: string) => {
    const newImage: PendingImage = {
      id: Date.now().toString(),
      data: imageData,
      caption: '',
      selected: false,
    };
    setPendingImages(prev => [...prev, newImage]);
    setIsImageTrayOpen(true);
    setIsCameraModalOpen(false);
  };

  const handleFilePickerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImage: PendingImage = {
          id: Date.now().toString() + i + Math.random().toString(),
          data: base64,
          caption: '',
          selected: false,
        };
        setPendingImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }
    setIsImageTrayOpen(true);
    e.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setPendingImages(prev => prev.filter(img => img.id !== id));
    if (pendingImages.length <= 1) {
      setIsImageTrayOpen(false);
      setIsFullscreenPreview(false);
    } else if (previewIndex >= pendingImages.length - 1) {
      setPreviewIndex(Math.max(0, pendingImages.length - 2));
    }
  };

  const handleToggleSelect = (id: string) => {
    setPendingImages(prev => prev.map(img => 
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
  };

  const handleSelectAll = () => {
    const allSelected = pendingImages.every(img => img.selected);
    setPendingImages(prev => prev.map(img => ({ ...img, selected: !allSelected })));
  };

  const handleDeleteSelected = () => {
    setPendingImages(prev => prev.filter(img => !img.selected));
    setSelectMode(false);
    if (pendingImages.filter(img => !img.selected).length === 0) {
      setIsImageTrayOpen(false);
      setIsFullscreenPreview(false);
    }
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setPendingImages(prev => prev.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
  };

  const handleOpenFullscreen = (index: number) => {
    setPreviewIndex(index);
    setIsFullscreenPreview(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreenPreview(false);
  };

  const handlePrevImage = () => {
    setPreviewIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setPreviewIndex(prev => Math.min(pendingImages.length - 1, prev + 1));
  };

  const handleAddMoreFromPreview = () => {
    filePickerRef.current?.click();
  };

  const handleSendImages = () => {
    if (pendingImages.length === 0) return;
    
    pendingImages.forEach((img, index) => {
      const userMessage: ChatMessage = {
        id: (Date.now() + index).toString(),
        role: 'user',
        content: img.caption || `📷 Image ${index + 1}`,
        timestamp: formatTime(),
        type: 'image',
        imageUrl: img.data,
        translationMode: 'ocr',
      };
      setMessages(prev => [...prev, userMessage]);
    });
    
    setPendingImages([]);
    setIsImageTrayOpen(false);
    setIsFullscreenPreview(false);
    setSelectMode(false);
    
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1000).toString(),
        role: 'ai',
        content: `🔍 I've analyzed your ${pendingImages.length} image${pendingImages.length > 1 ? 's' : ''}! Here are the translations:\n\n| Original | Translation |\n|----------|-------------|\n| Hello | Kamusta |\n| Thank you | Salamat |\n| Welcome | Maligayang pagdating |`,
        timestamp: formatTime(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleTrayClose = () => {
    setIsImageTrayOpen(false);
    setIsFullscreenPreview(false);
    setSelectMode(false);
    setPendingImages([]);
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="chat-voice-waveform-bar"></div>
            ))}
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
    
    if (msg.type === 'image') {
      return (
        <div className="chat-image-message">
          {msg.imageUrl && (
            <div className="chat-image-thumbnail">
              <img src={msg.imageUrl} alt="User upload" />
            </div>
          )}
          {msg.content && msg.content !== `📷 Image` && (
            <p className="chat-image-caption">{msg.content}</p>
          )}
        </div>
      );
    }
    
    return <p className="chat-message__text">{msg.content}</p>;
  };

  const selectedCount = pendingImages.filter(img => img.selected).length;

  return (
    <IonPage>
      <IonContent fullscreen className="chat-content">
        <div className="chat-page">
          <header className="chat-header-sticky">
            <div className="chat-header">
              <div className="chat-header__brand">
                <IonIcon icon={chatbubbleOutline} className="chat-header__chat-icon" aria-hidden />
                <div className="chat-header__text">
                  <h1 className="chat-header__title">SalinTayo AI</h1>
                  <p className="chat-header__tagline">Translate. Learn. Converse.</p>
                </div>
              </div>
              <button className="chat-header__action-btn" aria-label="Options">
                <IonIcon icon={documentOutline} />
              </button>
            </div>
            <div className="chat-header__dots">
              <span className="chat-header__dot" />
              <span className="chat-header__dot chat-header__dot--active" />
              <span className="chat-header__dot" />
            </div>
            <hr className="chat-header__divider" />
          </header>

          <section className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty-state">
                <p>Kumusta! I&apos;m your Filipino AI tutor.</p>
                <p>Type a message or attach an image to translate.</p>
              </div>
            )}
            {isLoading && (
              <div className="chat-message chat-message--ai" data-role="ai">
                <div className="chat-message__avatar">
                  <IonIcon icon={chatbubbleEllipsesOutline} />
                </div>
                <div className="chat-message__bubble-wrap">
                  <div className="chat-message__bubble">
                    <p className="chat-message__text">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message chat-message--${msg.role} ${msg.type === 'image' ? 'chat-message--image' : ''}`} data-role={msg.role}>
                <div className="chat-message__avatar">
                  {msg.role === 'ai' ? (
                    <IonIcon icon={chatbubbleEllipsesOutline} />
                  ) : msg.type === 'voice' ? (
                    <IonIcon icon={volumeHighOutline} />
                  ) : msg.type === 'image' ? (
                    <IonIcon icon={imageOutline} />
                  ) : (
                    <IonIcon icon={personCircleOutline} />
                  )}
                </div>
                <div className="chat-message__bubble-wrap">
                  <div className="chat-message__bubble">
                    {msg.role === 'ai' && (
                      <button className="chat-message__settings">
                        <IonIcon icon={settingsOutline} />
                      </button>
                    )}
                    {renderMessageContent(msg)}
                  </div>
                  <span className="chat-message__time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </section>

          {/* Hidden file input */}
          <input
            ref={filePickerRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFilePickerChange}
          />

          {/* Image Tray - Messenger Style */}
          {isImageTrayOpen && pendingImages.length > 0 && !isFullscreenPreview && (
            <div className="chat-image-tray">
              {/* Tray Header */}
              <div className="chat-image-tray__header">
                <div className="chat-image-tray__header-left">
                  <button className="chat-image-tray__close" onClick={handleTrayClose}>
                    <IonIcon icon={close} />
                  </button>
                  <span className="chat-image-tray__count">{pendingImages.length} image{pendingImages.length > 1 ? 's' : ''}</span>
                </div>
                <div className="chat-image-tray__header-right">
                  <button className="chat-image-tray__select-all" onClick={handleSelectAll}>
                    {pendingImages.every(img => img.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedCount > 0 && (
                    <button className="chat-image-tray__delete" onClick={handleDeleteSelected}>
                      <IonIcon icon={trashOutline} />
                      <span>Delete ({selectedCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail Grid - Horizontal Scroll */}
              <div className="chat-image-tray__grid">
                {pendingImages.map((img, index) => (
                  <div 
                    key={img.id} 
                    className={`chat-image-tray__tile ${img.selected ? 'chat-image-tray__tile--selected' : ''}`}
                    onClick={() => handleOpenFullscreen(index)}
                  >
                    <img src={img.data} alt={`Preview ${index + 1}`} />
                    {img.selected && (
                      <div className="chat-image-tray__tile-check">
                        <IonIcon icon={checkmark} />
                      </div>
                    )}
                    <button 
                      className="chat-image-tray__tile-remove"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}
                    >
                      <IonIcon icon={close} />
                    </button>
                  </div>
                ))}
                
                {/* Add More Tiles */}
                <div className="chat-image-tray__tile chat-image-tray__tile--add" onClick={() => filePickerRef.current?.click()}>
                  <IonIcon icon={add} />
                </div>
                <div className="chat-image-tray__tile chat-image-tray__tile--camera" onClick={() => setIsCameraModalOpen(true)}>
                  <IonIcon icon={cameraOutline} />
                </div>
              </div>

              {/* Caption Input */}
              <div className="chat-image-tray__caption-wrap">
                <input
                  type="text"
                  className="chat-image-tray__caption"
                  placeholder="Add a caption..."
                  value={pendingImages[0]?.caption || ''}
                  onChange={(e) => handleUpdateCaption(pendingImages[0]?.id || '', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Fullscreen Preview */}
          {isFullscreenPreview && pendingImages.length > 0 && (
            <div className="chat-fullscreen-preview">
              <div className="chat-fullscreen-preview__header">
                <button className="chat-fullscreen-preview__close" onClick={handleCloseFullscreen}>
                  <IonIcon icon={close} />
                </button>
                <button className="chat-fullscreen-preview__trash" onClick={() => handleRemoveImage(pendingImages[previewIndex].id)}>
                  <IonIcon icon={trashOutline} />
                </button>
              </div>

              <div className="chat-fullscreen-preview__nav chat-fullscreen-preview__nav--prev" onClick={handlePrevImage}>
                <IonIcon icon={chevronBack} />
              </div>
              
              <div className="chat-fullscreen-preview__image">
                <img src={pendingImages[previewIndex].data} alt={`Preview ${previewIndex + 1}`} />
              </div>

              <div className="chat-fullscreen-preview__nav chat-fullscreen-preview__nav--next" onClick={handleNextImage}>
                <IonIcon icon={chevronForward} />
              </div>

              <div className="chat-fullscreen-preview__footer">
                <input
                  type="text"
                  className="chat-fullscreen-preview__caption"
                  placeholder="Add a caption..."
                  value={pendingImages[previewIndex]?.caption || ''}
                  onChange={(e) => handleUpdateCaption(pendingImages[previewIndex]?.id || '', e.target.value)}
                />
                <button 
                  className="chat-fullscreen-preview__send"
                  onClick={handleSendImages}
                  disabled={isLoading}
                >
                  <IonIcon icon={send} />
                  <span>Send {pendingImages.length > 1 ? `(${pendingImages.length})` : ''}</span>
                </button>
              </div>

              {/* Filmstrip */}
              <div className="chat-fullscreen-preview__filmstrip">
                {pendingImages.map((img, index) => (
                  <div 
                    key={img.id}
                    className={`chat-fullscreen-preview__filmstrip-tile ${index === previewIndex ? 'chat-fullscreen-preview__filmstrip-tile--active' : ''}`}
                    onClick={() => setPreviewIndex(index)}
                  >
                    <img src={img.data} alt="" />
                  </div>
                ))}
                <div className="chat-fullscreen-preview__filmstrip-add" onClick={handleAddMoreFromPreview}>
                  <IonIcon icon={add} />
                </div>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className={`chat-input-wrap ${isImageTrayOpen ? 'chat-input-wrap--with-tray' : ''}`}>
            <button className="chat-input__attach" onClick={isImageTrayOpen ? () => setIsCameraModalOpen(true) : handleAttachmentClick}>
              <IonIcon icon={isImageTrayOpen ? cameraOutline : attachOutline} />
            </button>
            <input
              ref={inputRef}
              type="text"
              className="chat-input__field"
              placeholder={isImageTrayOpen ? "Add caption..." : "Type your message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-input__mic" onClick={isImageTrayOpen ? () => filePickerRef.current?.click() : handleVoiceClick}>
              <IonIcon icon={isImageTrayOpen ? imagesOutline : micOutline} />
            </button>
            {isImageTrayOpen ? (
              <button 
                className="chat-input__send chat-input__send--image"
                onClick={handleSendImages}
                disabled={isLoading || pendingImages.length === 0}
              >
                <IonIcon icon={send} />
                {pendingImages.length > 1 && <span className="chat-input__send-badge">{pendingImages.length}</span>}
              </button>
            ) : (
              <button 
                className="chat-input__send"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
              >
                <IonIcon icon={send} />
              </button>
            )}
          </div>
        </div>

        <footer className="home-footer">
          <nav className="home-nav" aria-label="Main">
            <Link to="/learn" className="home-nav__item">
              <IonIcon icon={bookOutline} className="home-nav__icon" />
              <span className="home-nav__label">Learn</span>
            </Link>
            <Link to="/quiz" className="home-nav__item">
              <IonIcon icon={documentTextOutline} className="home-nav__icon" />
              <span className="home-nav__label">Quiz</span>
            </Link>
            <Link to="/home" className="home-nav__item">
              <IonIcon icon={homeOutline} className="home-nav__icon" />
              <span className="home-nav__label">Home</span>
            </Link>
            <Link to="/chat" className={`home-nav__item ${isChat ? 'home-nav__item--active' : ''}`}>
              <IonIcon icon={chatbubbleOutline} className="home-nav__icon" />
              <span className="home-nav__label">Chat</span>
            </Link>
            <Link to="/profile" className="home-nav__item">
              <IonIcon icon={personCircleOutline} className="home-nav__icon" />
              <span className="home-nav__label">Profile</span>
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

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onOpenGallery={() => filePickerRef.current?.click()}
      />
    </IonPage>
  );
};

export default ChatPage;
