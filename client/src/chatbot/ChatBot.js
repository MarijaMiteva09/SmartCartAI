import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! Ask me anything about our products.' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage = { type: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, something went wrong.' }]);
      console.error('Chat error:', error);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`} aria-live="polite" aria-label="Chatbot">
      <button
        className="chatbot-toggle"
        aria-expanded={isOpen}
        aria-controls="chatbot-window"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        💬
      </button>

      {isOpen && (
        <div className="chatbot-window" id="chatbot-window" role="region" aria-live="polite">
          <div className="chatbot-header">
            <h3>SmartCart AI Assistant</h3>
            <button
              className="chatbot-close"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages" tabIndex={0}>
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about our products..."
              aria-label="Chat message input"
              autoFocus
            />
            <button onClick={handleSend} aria-label="Send message">
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
