import React, { useState } from 'react';
import './AIMessageContent.css';

const AIMessageContent = ({ data, onFollowUpClick }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getMessage = () => {
    if (!data) return '';
    if (data.response?.message) return data.response.message;
    if (data.message) return data.message;
    return '';
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const warmVoice = voices.find(v => 
      v.name.includes('Microsoft David') || 
      v.name.includes('Google UK') ||
      v.name.includes('Samantha') ||
      v.lang === 'en-US'
    );

    if (warmVoice) {
      utterance.voice = warmVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const message = getMessage();

  const suggestedFollowUps = [
    "I've had this for 3 days",
    "Yes, with a fever",
    "I also feel very tired",
    "Should I take medicine?"
  ];

  return (
    <div className="ai-message-content">
      <div className="response-section">
        <p className="response-text">{message}</p>
        <button 
          className={`btn-speak ${isSpeaking ? 'speaking' : ''}`}
          onClick={() => speak(message)}
          title="Read aloud"
        >
          {isSpeaking ? '⏸️' : '🔊'}
        </button>
      </div>

      {message && (
        <div className="suggested-replies">
          {suggestedFollowUps.map((reply, idx) => (
            <button 
              key={idx}
              className="suggested-reply-btn"
              onClick={() => onFollowUpClick?.(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIMessageContent;
