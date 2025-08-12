import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import './ChatWindow.css';

const ChatWindow = ({ chat, messages, onSendMessage, onBack, isMobile }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);
    
    return !isSameDay(currentDate, previousDate);
  };

  const getStatusIcon = (message) => {
    if (!message.from_me) return null;
    
    switch (message.status) {
      case 'sent':
        return <span className="message-status sent">✓</span>;
      case 'delivered':
        return <span className="message-status delivered">✓✓</span>;
      case 'read':
        return <span className="message-status read">✓✓</span>;
      default:
        return <span className="message-status pending">⏱</span>;
    }
  };

  const chatName = chat.lastMessage?.name || chat.wa_id;
  const chatNumber = chat.lastMessage?.number || chat.wa_id;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {isMobile && (
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
        )}
        
        <div className="chat-info">
          <div className="chat-avatar">
            <img 
              src="/default-avatar.png" 
              alt={chatName}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="avatar-fallback">
              {chatName.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="chat-details">
            <h2 className="chat-name">{chatName}</h2>
            <p className="chat-status">{chatNumber}</p>
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-btn">
            <Phone size={20} />
          </button>
          <button className="action-btn">
            <Video size={20} />
          </button>
          <button className="action-btn">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
            
            return (
              <React.Fragment key={message._id || index}>
                {showDateSeparator && (
                  <div className="date-separator">
                    <span>{formatDateSeparator(message.timestamp)}</span>
                  </div>
                )}
                
                <div className={`message ${message.from_me ? 'outgoing' : 'incoming'}`}>
                  <div className="message-content">
                    <p className="message-text">{message.text}</p>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {getStatusIcon(message)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSend} className="message-input-form">
          <div className="input-actions-left">
            <button type="button" className="input-action-btn">
              <Smile size={20} />
            </button>
            <button type="button" className="input-action-btn">
              <Paperclip size={20} />
            </button>
          </div>
          
          <div className="message-input-wrapper">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="message-input"
              rows="1"
            />
          </div>
          
          <div className="input-actions-right">
            {newMessage.trim() ? (
              <button type="submit" className="send-button">
                <Send size={20} />
              </button>
            ) : (
              <button type="button" className="input-action-btn">
                <Mic size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;