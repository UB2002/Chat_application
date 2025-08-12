import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import WelcomeScreen from './components/WelcomeScreen';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://chat-application-ycgv.onrender.com';

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true); ``
  const [socket, setSocket] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('connect_error', (error) => {
      console.log('Connection error:', error);
    });

    // Listen for real-time messages
    newSocket.on('new_message', (message) => {
      // Update conversations list
      fetchConversations();

      // If this message is for the currently selected chat, add it to messages
      if (selectedChat && message.wa_id === selectedChat.wa_id) {
        setMessages(prev => {
          const exists = prev.find(m =>
            (m.message_id && m.message_id === message.message_id) ||
            (m.meta_msg_id && m.meta_msg_id === message.meta_msg_id) ||
            m._id === message._id
          );
          if (exists) {
            return prev.map(m => m._id === message._id ? message : m);
          }
          return [...prev, message];
        });
      }
    });

    // Listen for status updates
    newSocket.on('update_status', (message) => {
      if (selectedChat && message.wa_id === selectedChat.wa_id) {
        setMessages(prev => prev.map(m =>
          (m.message_id && m.message_id === message.message_id) ||
            (m.meta_msg_id && m.meta_msg_id === message.meta_msg_id) ||
            m._id === message._id ? { ...m, status: message.status } : m
        ));
      }
    });

    return () => {
      newSocket.close();
    };
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations from:', `${API_BASE}/api/conversations`);
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Conversations data:', data);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (wa_id) => {
    try {
      const response = await fetch(`${API_BASE}/api/conversations/${encodeURIComponent(wa_id)}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!selectedChat || !text.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wa_id: selectedChat.wa_id,
          text: text.trim(),
          name: selectedChat.lastMessage?.name,
          number: selectedChat.lastMessage?.number
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        fetchConversations(); // Refresh conversations to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.wa_id);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToChats = () => {
    if (isMobile) {
      setShowSidebar(true);
      setSelectedChat(null);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading WhatsApp Web...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`sidebar-container ${showSidebar ? 'show' : 'hide'}`}>
        <Sidebar
          conversations={conversations}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
        />
      </div>

      <div className={`main-container ${!showSidebar ? 'full-width' : ''}`}>
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            onSendMessage={sendMessage}
            onBack={handleBackToChats}
            isMobile={isMobile}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
}

export default App;