const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class MoodAnalysisService {
  /**
   * Analyze mood using Google Gemini AI
   */
  async analyzeMood(moodData) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are a compassionate mental health advisor. Analyze this mood entry and provide personalized advice.

Mood Entry:
- Mood: ${moodData.moodText || moodData.mood}
- Intensity: ${moodData.intensity}/10
- Notes: ${moodData.notes || 'No notes provided'}
- Triggers: ${moodData.triggers?.join(', ') || 'None'}
- Date: ${new Date(moodData.date).toLocaleDateString()}

Please provide:
1. A brief sentiment analysis (1-2 sentences)
2. Personalized advice (3-4 sentences)
3. 3 actionable insights as bullet points
4. Risk level assessment (low/medium/high)

Format your response as JSON:
{
  "sentiment": "brief analysis",
  "advice": "personalized advice",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "riskLevel": "low/medium/high"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          generatedAt: new Date()
        };
      }

      // Fallback if JSON parsing fails
      return {
        sentiment: 'Your mood has been recorded.',
        advice: text.substring(0, 500),
        insights: ['Stay mindful of your emotions', 'Practice self-care', 'Reach out to support if needed'],
        riskLevel: moodData.intensity >= 8 ? 'medium' : 'low',
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ AI Mood Analysis Error:', error.message);
      return this.getFallbackAnalysis(moodData);
    }
  }

  /**
   * Fallback analysis if AI fails
   */
  getFallbackAnalysis(moodData) {
    const moodAdvice = {
      happy: {
        sentiment: "You're feeling positive! This is wonderful.",
        advice: "Keep doing what brings you joy and positivity. Consider journaling about what went well today to reinforce positive patterns.",
        insights: [
          "Share your happiness with loved ones",
          "Document positive moments for future reflection",
          "Maintain healthy habits that contribute to your wellbeing"
        ],
        riskLevel: 'low'
      },
      sad: {
        sentiment: "You're experiencing sadness. It's okay to feel this way.",
        advice: "Allow yourself to feel these emotions without judgment. Consider talking to someone you trust or engaging in activities that usually comfort you.",
        insights: [
          "Practice self-compassion and gentle self-care",
          "Reach out to friends or family for support",
          "Engage in light physical activity like walking"
        ],
        riskLevel: moodData.intensity >= 7 ? 'medium' : 'low'
      },
      anxious: {
        sentiment: "You're feeling anxious. This is a common experience.",
        advice: "Try grounding techniques like deep breathing (4 seconds in, 6 seconds out). Focus on what you can control right now.",
        insights: [
          "Practice 5-minute mindfulness meditation",
          "Use the 5-4-3-2-1 grounding technique",
          "Limit caffeine and maintain regular sleep"
        ],
        riskLevel: moodData.intensity >= 8 ? 'high' : 'medium'
      },
      angry: {
        sentiment: "You're experiencing anger. Let's process this constructively.",
        advice: "Take deep breaths and step away from triggers if possible. Physical activity or journaling can help process these feelings.",
        insights: [
          "Channel anger into physical exercise",
          "Write down what's bothering you without filter",
          "Practice progressive muscle relaxation"
        ],
        riskLevel: moodData.intensity >= 8 ? 'medium' : 'low'
      },
      tired: {
        sentiment: "You're feeling fatigued. Rest is important.",
        advice: "Prioritize quality sleep tonight. Avoid screens 1 hour before bed and maintain a consistent sleep schedule.",
        insights: [
          "Ensure 7-9 hours of quality sleep",
          "Stay hydrated throughout the day",
          "Take short breaks during demanding activities"
        ],
        riskLevel: 'low'
      },
      neutral: {
        sentiment: "You're feeling neutral today. Balance is valuable.",
        advice: "Use this calm state to engage in activities you enjoy or to plan for the week ahead. Maintain healthy routines.",
        insights: [
          "Practice gratitude to enhance positive emotions",
          "Engage in creative or refreshing activities",
          "Plan self-care activities for the coming days"
        ],
        riskLevel: 'low'
      }
    };

    const mood = moodData.moodText || moodData.mood;
    const analysis = moodAdvice[mood] || moodAdvice.neutral;

    return {
      ...analysis,
      generatedAt: new Date()
    };
  }

  /**
   * Get mood trends analysis
   */
  async analyzeTrends(moods) {
    try {
      if (!moods || moods.length === 0) {
        return null;
      }

      const avgIntensity = moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length;
      const moodCounts = {};
      moods.forEach(m => {
        const mood = m.moodText || m.mood;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });

      const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
      );

      return {
        averageIntensity: avgIntensity.toFixed(1),
        dominantMood,
        totalEntries: moods.length,
        moodDistribution: moodCounts
      };
    } catch (error) {
      console.error('❌ Trend Analysis Error:', error.message);
      return null;
    }
  }
}

module.exports = new MoodAnalysisService();
