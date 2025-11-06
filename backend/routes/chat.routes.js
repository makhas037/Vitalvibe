const express = require('express');
const router = express.Router();
const { ChatLog } = require('../database').models;

// GET /api/chat/sessions/:userId - Get user's chat sessions
router.get('/sessions/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    console.log('📂 Fetching sessions for:', userId);
    
    const sessions = await ChatLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    console.log('✅ Found sessions:', sessions.length);

    res.json(sessions);
  } catch (error) {
    console.error('❌ Chat sessions error:', error);
    next(error);
  }
});

// POST /api/chat/sessions - Create new session
router.post('/sessions', async (req, res, next) => {
  try {
    const { userId, title } = req.body;
    const sessionId = `session-${Date.now()}`;

    const session = await ChatLog.create({
      userId,
      sessionId,
      title: title || 'New Chat',
      messages: []
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('❌ Create session error:', error);
    next(error);
  }
});

// GET /api/chat/session/:sessionId - Get specific session
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    console.log('📂 Loading session:', sessionId);
    
    const session = await ChatLog.findOne({ sessionId }).lean();
    
    if (!session) {
      console.log('⚠️  Session not found:', sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }
    
    console.log('✅ Session loaded:', session.messages.length, 'messages');
    res.json(session);
  } catch (error) {
    console.error('❌ Get session error:', error);
    next(error);
  }
});

// POST /api/chat/log - Log message to session
router.post('/log', async (req, res, next) => {
  try {
    const { sessionId, userMessage, aiResponse } = req.body;

    let session = await ChatLog.findOne({ sessionId });
    
    if (!session) {
      session = new ChatLog({ 
        sessionId, 
        userId: 'demo-user',
        title: 'Chat',
        messages: [] 
      });
    }

    if (userMessage) {
      session.messages.push({
        role: 'user',
        content: String(userMessage),
        timestamp: new Date()
      });
    }

    if (aiResponse) {
      session.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
    }

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('❌ Log message error:', error);
    next(error);
  }
});

// DELETE /api/chat/session/:sessionId - Delete session
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    await ChatLog.deleteOne({ sessionId: req.params.sessionId });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('❌ Delete session error:', error);
    next(error);
  }
});

module.exports = router;
