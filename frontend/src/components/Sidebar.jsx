import React, { useState } from 'react';
import { Search, MessageCircle, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './Sidebar.css';

const Sidebar = ({ conversations, selectedChat, onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const name = conv.lastMessage?.name || conv.wa_id;
    const text = conv.lastMessage?.text || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getStatusIcon = (message) => {
    if (!message?.from_me) return null;
    
    switch (message.status) {
      case 'sent':
        return <span className="status-icon sent">✓</span>;
      case 'delivered':
        return <span className="status-icon delivered">✓✓</span>;
      case 'read':
        return <span className="status-icon read">✓✓</span>;
      default:
        return <span className="status-icon">⏱</span>;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="profile-section">
          <div className="profile-avatar">
            <img src="/default-avatar.png" alt="Profile" onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} />
            <div className="avatar-fallback">
              <MessageCircle size={24} />
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="search-container">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <MessageCircle size={64} className="no-chats-icon" />
            <p>No conversations yet</p>
            <span>Start a conversation by sending a message</span>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.wa_id}
              className={`conversation-item ${selectedChat?.wa_id === conv.wa_id ? 'selected' : ''}`}
              onClick={() => onChatSelect(conv)}
            >
              <div className="conversation-avatar">
                <img 
                  src="/default-avatar.png" 
                  alt={conv.lastMessage?.name || conv.wa_id}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="avatar-fallback">
                  {(conv.lastMessage?.name || conv.wa_id).charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3 className="conversation-name">
                    {conv.lastMessage?.name || conv.wa_id}
                  </h3>
                  <span className="conversation-time">
                    {formatTime(conv.lastMessage?.timestamp)}
                  </span>
                </div>
                
                <div className="conversation-preview">
                  <div className="last-message">
                    {getStatusIcon(conv.lastMessage)}
                    <span className="message-text">
                      {conv.lastMessage?.text || 'No messages yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;