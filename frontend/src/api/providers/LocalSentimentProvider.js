/**
 * Local Sentiment Analysis (No API needed)
 * Uses client-side sentiment analysis
 */
class LocalSentimentProvider {
  constructor() {
    this.name = 'Local Sentiment Analysis';
    this.isConnected = true;
    console.log('🧠 LocalSentimentProvider initialized (no API needed!)');
  }

  /**
   * Analyze text sentiment
   */
  analyzeSentiment(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for sentiment analysis');
    }

    console.log('📊 Analyzing sentiment...');
    const result = this.simpleAnalysis(text);
    console.log('✅ Sentiment analyzed:', result);
    return result;
  }

  /**
   * Simple sentiment analysis without library
   */
  simpleAnalysis(text) {
    const lowerText = text.toLowerCase();

    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'awesome',
      'happy', 'love', 'fantastic', 'perfect', 'brilliant', 'superb',
      'delighted', 'thrilled', 'best', 'beautiful',
      'healthy', 'fit', 'strong', 'energetic', 'motivated'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'poor', 'sad',
      'hate', 'disappointed', 'frustrated', 'angry', 'worst',
      'disgusting', 'painful', 'weak', 'tired', 'exhausted',
      'sick', 'ill', 'unwell', 'depressed', 'anxious'
    ];

    const healthWords = {
      positive: ['exercise', 'workout', 'running', 'healthy', 'fit', 'strong'],
      negative: ['pain', 'illness', 'sick', 'disease', 'injury']
    };

    let score = 0;
    let details = [];

    // Count positive words
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
        details.push(`positive: ${word} (${matches.length})`);
      }
    });

    // Count negative words
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score -= matches.length;
        details.push(`negative: ${word} (${matches.length})`);
      }
    });

    // Detect health concerns
    const healthConcerns = [];
    healthWords.negative.forEach(word => {
      if (lowerText.includes(word)) {
        healthConcerns.push(word);
      }
    });

    return {
      score: score,
      magnitude: Math.abs(score),
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      confidence: Math.min(Math.abs(score) / 10, 1),
      details,
      healthConcerns,
      recommendation: this.getRecommendation(score, healthConcerns),
      timestamp: new Date()
    };
  }

  /**
   * Get health recommendation based on sentiment
   */
  getRecommendation(score, healthConcerns) {
    if (healthConcerns.length > 0) {
      return {
        type: 'health-warning',
        message: `Detected health concerns: ${healthConcerns.join(', ')}`,
        action: 'Consider consulting a healthcare provider'
      };
    }

    if (score > 5) {
      return {
        type: 'positive',
        message: 'Great mood! Keep up the good habits.',
        action: 'Continue your current exercise and nutrition routine'
      };
    }

    if (score < -5) {
      return {
        type: 'concern',
        message: 'You seem stressed or unwell.',
        action: 'Try relaxation techniques or consult a professional'
      };
    }

    return {
      type: 'neutral',
      message: 'Your mood is neutral.',
      action: 'Monitor your wellbeing regularly'
    };
  }

  /**
   * Extract health keywords
   */
  extractHealthKeywords(text) {
    const healthKeywords = {
      symptoms: ['pain', 'fever', 'cough', 'headache', 'nausea'],
      activities: ['exercise', 'running', 'walking', 'workout', 'gym'],
      nutrition: ['breakfast', 'lunch', 'dinner', 'snack', 'meal'],
      emotions: ['happy', 'sad', 'stressed', 'anxious', 'calm']
    };

    const lowerText = text.toLowerCase();
    const found = {};

    Object.entries(healthKeywords).forEach(([category, keywords]) => {
      found[category] = keywords.filter(keyword => 
        lowerText.includes(keyword)
      );
    });

    return found;
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      provider: this.name,
      connected: this.isConnected,
      note: 'Local processing - no API keys needed!',
      timestamp: new Date()
    };
  }
}

export default LocalSentimentProvider;
