const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChatLog } = require('../database').models;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/symptoms/diagnose - AI diagnosis with conversation memory
router.post('/diagnose', async (req, res, next) => {
  try {
    const { symptoms, sessionId, userId } = req.body;
    const userMessage = Array.isArray(symptoms) ? symptoms.join(', ') : String(symptoms);

    console.log('📋 Patient Message:', userMessage);
    console.log('🔗 Session:', sessionId);

    try {
      // Get conversation history
      let conversationHistory = [];
      if (sessionId) {
        const session = await ChatLog.findOne({ sessionId }).lean();
        if (session && session.messages) {
          conversationHistory = session.messages;
        }
      }

      // Build context from history
      let contextText = '';
      if (conversationHistory.length > 0) {
        contextText = '\n\nPrevious conversation context:\n';
        conversationHistory.slice(-8).forEach(msg => {
          contextText += `${msg.role === 'user' ? 'Patient' : 'Doctor'}: ${msg.content}\n`;
        });
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are Dr. Sarah, a compassionate, experienced medical consultant. 

Instructions:
- Respond naturally like a real doctor having a conversation
- Ask one or two clarifying questions at a time
- Remember the patient's previous symptoms and concerns
- Use simple, understandable language
- Never diagnose definitively, suggest "could be" or "might be"
- Always recommend seeing a doctor for persistent symptoms
- If symptoms sound serious, recommend immediate medical attention
- Be warm, empathetic, and professional
- No markdown, no asterisks, no special formatting
- Just natural conversation

${contextText}

Patient says: "${userMessage}"

Respond naturally as Dr. Sarah would in a real consultation.`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      console.log('✅ Doctor Response:', aiResponse);

      res.json({
        success: true,
        response: {
          message: aiResponse.trim(),
          type: 'conversation'
        },
        mode: 'GEMINI_AI',
        sessionId: sessionId,
        timestamp: new Date()
      });

    } catch (geminiError) {
      console.error('❌ Gemini API error:', geminiError.message);
      
      // Fallback responses
      const fallbackResponses = [
        "I'm here to help you feel better. Tell me, when did these symptoms start? And is this something new or have you experienced it before?",
        "Thank you for sharing that. To give you better guidance, could you describe how intense these symptoms are? Are they mild, moderate, or severe?",
        "I hear you. Let me ask a few more questions to understand your situation better. Have you experienced any fever, or are there any other symptoms happening at the same time?",
        "That sounds uncomfortable. Is this affecting your daily activities? And have you tried anything to help, or taken any medicines?",
        "I understand. These symptoms can be concerning. Have you noticed if anything makes them better or worse? Like rest, food, or certain activities?",
        "Based on what you're telling me, it could be several things. How long exactly have you been experiencing this? And have you had a temperature?",
        "That's helpful information. Are you taking any medications currently? And do you have any existing health conditions I should know about?",
        "I see. It's good that you're paying attention to these symptoms. Have you had any recent changes in your diet, sleep, or stress levels?"
      ];

      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      res.json({
        success: true,
        response: {
          message: randomResponse,
          type: 'conversation'
        },
        mode: 'FALLBACK',
        sessionId: sessionId
      });
    }

  } catch (error) {
    console.error('❌ Diagnosis error:', error);
    next(error);
  }
});

module.exports = router;
