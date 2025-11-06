import React, { useState, useEffect, useRef, useCallback } from "react";
import { symptomService, chatService } from "../../services"; 
import AIMessageContent from "../../components/Chatbot/AIMessageContent.jsx";
import Toast from "../../components/UI/Toast";
import { IoSend, IoChatboxOutline, IoAddCircleOutline, IoRefresh, IoClose, IoChevronDown, IoChevronUp, IoTrash } from 'react-icons/io5';
import "./SymptomCheckerPage.css"; 

const initialAiMessage = {
    id: 1,
    sender: "ai",
    data: { 
        response: { 
            message: "Hello! I'm Dr.AI. I'm here to help you with any health concerns or symptoms you might have. What brings you in today?" 
        }
    },
};

const SymptomCheckerPage = () => {
    const userId = 'demo-user';
    const [messages, setMessages] = useState([initialAiMessage]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
    const [chatSessions, setChatSessions] = useState([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchSessions = useCallback(async () => {
        try {
            const response = await chatService.getSessions(userId);
            const sessions = Array.isArray(response.data) ? response.data : [];
            setChatSessions(sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        }
    }, [userId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const startNewChat = () => {
        const newSessionId = `session_${Date.now()}`;
        setMessages([initialAiMessage]);
        setSessionId(newSessionId);
        setError(null);
        setExpandedSession(null);
    };

    const deleteCurrentChat = async () => {
        if (window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
            try {
                await chatService.deleteSession(sessionId);
                showToast("Conversation deleted successfully", 'success');
                startNewChat();
                fetchSessions();
            } catch (err) {
                console.error("Error deleting chat:", err);
                showToast("Failed to delete conversation", 'error');
            }
        }
    };

    const loadChatSession = async (sessionIdToLoad) => {
        setIsLoading(true);
        try {
            const response = await chatService.getSession(sessionIdToLoad);
            const session = response.data || response;
            
            if (session.messages && session.messages.length > 0) {
                const formattedMessages = session.messages.map((msg) => ({
                    id: msg.timestamp || Date.now(),
                    sender: msg.role === 'user' ? 'user' : 'ai',
                    text: msg.role === 'user' ? msg.content : undefined,
                    data: msg.role === 'assistant' ? {
                        response: {
                            message: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
                        }
                    } : undefined
                }));

                setMessages([initialAiMessage, ...formattedMessages]);
                setSessionId(sessionIdToLoad);
                setExpandedSession(null);
                showToast("Conversation loaded", 'success');
            }
        } catch (err) {
            console.error("Error loading session:", err);
            showToast("Failed to load conversation", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSession = async (e, sessionIdToDelete) => {
        e.stopPropagation();
        try {
            await chatService.deleteSession(sessionIdToDelete);
            setChatSessions(prev => prev.filter(s => s.sessionId !== sessionIdToDelete));
            showToast("Conversation deleted", 'success');
        } catch (err) {
            console.error("Error deleting session:", err);
            showToast("Failed to delete conversation", 'error');
        }
    };

    const handleSendMessage = async (messageText) => {
        const currentInput = messageText || inputValue;
        if (!currentInput.trim() || isLoading) return;

        setError(null);
        const userMessage = { 
            id: Date.now(), 
            sender: "user", 
            text: currentInput 
        };
        setMessages((prev) => [...prev, userMessage]);
        
        if (!messageText) setInputValue("");
        setIsLoading(true);

        try {
            const diagnosisResult = await symptomService.diagnose(currentInput, sessionId);

            const aiMessage = { 
                id: Date.now() + 1, 
                sender: "ai", 
                data: diagnosisResult.data || diagnosisResult
            };
            
            setMessages((prev) => [...prev, aiMessage]);

            await chatService.logMessage(
                sessionId,
                currentInput,
                aiMessage.data?.response?.message || JSON.stringify(aiMessage.data)
            );
            
            fetchSessions();

        } catch (err) {
            console.error("Error:", err);
            showToast("Connection error. Please try again.", 'error');
            setMessages((prev) => [...prev, { 
                id: Date.now() + 1, 
                sender: "ai", 
                data: { response: { message: "I apologize, I'm having trouble connecting right now. Please try again in a moment." }}
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowUpClick = (followUpText) => {
        handleSendMessage(followUpText);
    };
    
    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getSessionPreview = (session) => {
        if (session.messages && session.messages.length > 0) {
            const firstUserMsg = session.messages.find(m => m.role === 'user');
            if (firstUserMsg) {
                return firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '');
            }
        }
        return 'No messages';
    };

    return (
        <section className="symptom-checker-page">
            <div className="section-header">
                <div>
                    <h1>🩺 Dr.AI - Health Assistant</h1>
                    <p>Chat with an AI doctor about your health concerns</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={startNewChat} title="Start a new conversation">
                        <IoAddCircleOutline /> New Chat
                    </button>
                    <button className="btn btn-danger" onClick={deleteCurrentChat} title="Delete current conversation">
                        <IoTrash /> Delete
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsHistoryVisible(!isHistoryVisible)}>
                        {isHistoryVisible ? <IoClose /> : <IoChatboxOutline />}
                    </button>
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}

            <div className="chat-layout-container">
                <div className="chat-container">
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}-message`}>
                                {msg.sender === "ai" && <div className="message-avatar">👨‍⚕️</div>}
                                {msg.sender === "user" && <div className="message-avatar-user">👤</div>}
                                <div className="message-content">
                                    {msg.sender === 'ai' && msg.data ? (
                                        <AIMessageContent data={msg.data} onFollowUpClick={handleFollowUpClick} />
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message ai-message">
                                <div className="message-avatar">👨‍⚕️</div>
                                <div className="message-content typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chat-input-container">
                        <input
                            type="text"
                            placeholder="Tell me about your symptoms or health concerns..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            autoFocus
                        />
                        <button 
                            className="btn-send" 
                            onClick={() => handleSendMessage()} 
                            disabled={isLoading || !inputValue.trim()}
                        >
                            <IoSend />
                        </button>
                    </div>
                </div>

                {isHistoryVisible && (
                    <div className="history-panel card">
                        <div className="history-header">
                            <h3><IoChatboxOutline /> Chat History</h3>
                            <button className="btn-refresh" onClick={fetchSessions} title="Refresh">
                                <IoRefresh />
                            </button>
                        </div>

                        <div className="history-list">
                            {chatSessions.length > 0 ? (
                                chatSessions
                                    .filter(s => s.sessionId !== sessionId)
                                    .map(session => (
                                        <div key={session._id} className="history-session-group">
                                            <div 
                                                className="history-session-item"
                                                onClick={() => {
                                                    if (expandedSession === session.sessionId) {
                                                        setExpandedSession(null);
                                                    } else {
                                                        setExpandedSession(session.sessionId);
                                                    }
                                                }}
                                            >
                                                <div className="session-header">
                                                    <div className="session-toggle">
                                                        {expandedSession === session.sessionId ? <IoChevronUp /> : <IoChevronDown />}
                                                    </div>
                                                    <div className="session-info">
                                                        <div className="session-title">
                                                            {session.title || 'Health Chat'}
                                                        </div>
                                                        <div className="session-preview">
                                                            {getSessionPreview(session)}
                                                        </div>
                                                    </div>
                                                    <div className="session-date">
                                                        {formatDate(session.createdAt)}
                                                    </div>
                                                    <button 
                                                        className="btn-delete-history"
                                                        onClick={(e) => deleteSession(e, session.sessionId)}
                                                        title="Delete chat"
                                                    >
                                                        <IoTrash />
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedSession === session.sessionId && (
                                                <div className="session-expanded">
                                                    <div className="session-messages">
                                                        {session.messages && session.messages.length > 0 ? (
                                                            session.messages.map((msg, idx) => (
                                                                <div key={idx} className={`session-msg ${msg.role}`}>
                                                                    <span className="msg-role">
                                                                        {msg.role === 'user' ? '👤' : '👨‍⚕️'}
                                                                    </span>
                                                                    <span className="msg-text">
                                                                        {msg.content.substring(0, 200)}
                                                                        {msg.content.length > 200 ? '...' : ''}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-messages">No messages</div>
                                                        )}
                                                    </div>
                                                    <button 
                                                        className="btn-load-chat"
                                                        onClick={() => loadChatSession(session.sessionId)}
                                                    >
                                                        Load Full Conversation
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <div className="empty-history">No previous conversations yet</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </section>
    );
};

export default SymptomCheckerPage;
