import React from 'react';
import { MessageCircle, Lock } from 'lucide-react';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <MessageCircle size={120} />
        </div>
        
        <h1 className="welcome-title">WhatsApp Web</h1>
        
        <p className="welcome-description">
          Send and receive messages without keeping your phone online.<br />
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>
        
        <div className="welcome-features">
          <div className="feature-item">
            <div className="feature-icon">
              <MessageCircle size={24} />
            </div>
            <div className="feature-text">
              <h3>Message privately</h3>
              <p>Simple, reliable, private messaging and calling for free*, available all over the world.</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Lock size={24} />
            </div>
            <div className="feature-text">
              <h3>End-to-end encrypted</h3>
              <p>Your personal messages are protected by end-to-end encryption.</p>
            </div>
          </div>
        </div>
        
        <div className="welcome-footer">
          <div className="encryption-notice">
            <Lock size={12} />
            <span>Your personal messages are end-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;