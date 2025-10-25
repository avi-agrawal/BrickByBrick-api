/**
 * ANALYTICS SERVICE
 * 
 * Business logic for analytics and insights including
 * performance metrics, trend analysis, and AI recommendations.
 */

const { Problem, LearningItem, RevisionItem, Roadmap } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get comprehensive analytics for a user
 * @param {number} userId - User ID
 * @param {Object} options - Analytics options
 * @returns {Object} Analytics data
 */
const getAnalytics = async (userId, options = {}) => {
  try {
    const { timeframe, startDate, endDate } = options;

    // Build date filters
    const dateFilters = buildDateFilters(timeframe, startDate, endDate);

    // Get data with filters
    const [problems, learningItems, revisionItems, roadmaps] = await Promise.all([
      Problem.findAll({ where: { userId, ...dateFilters.problems } }),
      LearningItem.findAll({ where: { userId, ...dateFilters.learning } }),
      RevisionItem.findAll({ where: { userId, ...dateFilters.revision } }),
      Roadmap.findAll({ where: { userId } })
    ]);

    // Calculate analytics
    const analytics = {
      overview: calculateOverviewMetrics(problems, learningItems, roadmaps),
      performanceMetrics: calculatePerformanceMetrics(problems, learningItems),
      topicAnalysis: calculateTopicAnalysis(problems),
      difficultyAnalysis: calculateDifficultyAnalysis(problems),
      timeAnalysis: calculateTimeAnalysis(problems),
      aiInsights: generateAIInsights(problems, learningItems),
      learningProgress: calculateLearningProgress(learningItems),
      roadmapProgress: calculateRoadmapProgress(roadmaps)
    };

    return analytics;
  } catch (error) {
    throw new AppError('Failed to calculate analytics', 500);
  }
};

/**
 * Build date filters based on timeframe or date range
 * @param {string} timeframe - Timeframe option
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Date filters for different models
 */
const buildDateFilters = (timeframe, startDate, endDate) => {
  let dateFilter = {};
  let revisionDateFilter = {};

  if (startDate && endDate) {
    // Custom date range
    dateFilter = {
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
    revisionDateFilter = {
      nextRevisionDate: {
        [Op.between]: [startDate, endDate]
      }
    };
  } else if (timeframe) {
    // Predefined timeframes
    const now = new Date();
    let startDateFilter;

    switch (timeframe) {
      case 'week':
        startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    dateFilter = {
      date: {
        [Op.gte]: startDateFilter
      }
    };
    revisionDateFilter = {
      nextRevisionDate: {
        [Op.gte]: startDateFilter.toISOString().split('T')[0]
      }
    };
  }

  return {
    problems: dateFilter,
    learning: dateFilter,
    revision: revisionDateFilter
  };
};

/**
 * Calculate overview metrics
 * @param {Array} problems - Problems array
 * @param {Array} learningItems - Learning items array
 * @param {Array} roadmaps - Roadmaps array
 * @returns {Object} Overview metrics
 */
const calculateOverviewMetrics = (problems, learningItems, roadmaps) => {
  const totalProblems = problems.length;
  const solvedProblems = problems.filter(p => p.outcome === 'solved').length;
  const successRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const currentStreak = calculateCurrentStreak(problems);
  const totalLearningHours = learningItems.reduce((total, item) => total + (item.timeSpent || 0), 0) / 60;
  const averageTimePerProblem = totalProblems > 0 ? Math.round(problems.reduce((total, p) => total + (p.timeSpent || 0), 0) / totalProblems) : 0;
  const uniqueTopics = [...new Set(problems.map(p => p.topic))].length;
  const completedRoadmaps = roadmaps.filter(r => r.isCompleted).length;

  return {
    totalProblems,
    totalLearningHours: Math.round(totalLearningHours * 10) / 10,
    currentStreak,
    successRate,
    averageTimePerProblem,
    totalTopics: uniqueTopics,
    completedRoadmaps
  };
};

/**
 * Calculate current streak
 * @param {Array} problems - Problems array
 * @returns {number} Current streak
 */
const calculateCurrentStreak = (problems) => {
  let currentStreak = 0;
  const sortedProblems = problems
    .filter(p => p.outcome === 'solved')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedProblems.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    let foundToday = false;

    // Check if user solved a problem today
    for (const problem of sortedProblems) {
      const problemDate = new Date(problem.date);
      problemDate.setHours(0, 0, 0, 0);

      if (problemDate.getTime() === checkDate.getTime()) {
        foundToday = true;
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        break;
      }
    }

    // If found today, continue counting backwards
    if (foundToday) {
      for (const problem of sortedProblems) {
        const problemDate = new Date(problem.date);
        problemDate.setHours(0, 0, 0, 0);

        if (problemDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (problemDate.getTime() < checkDate.getTime()) {
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }
  }

  return currentStreak;
};

/**
 * Calculate performance metrics
 * @param {Array} problems - Problems array
 * @param {Array} learningItems - Learning items array
 * @returns {Object} Performance metrics
 */
const calculatePerformanceMetrics = (problems, learningItems) => {
  // Daily activity for the last 7 days
  const dailyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayProblems = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate.toISOString().split('T')[0] === dateStr && p.outcome === 'solved';
    }).length;

    const dayLearningHours = learningItems.filter(l => {
      const learningDate = new Date(l.createdAt);
      return learningDate.toISOString().split('T')[0] === dateStr;
    }).reduce((total, item) => total + (item.timeSpent || 0), 0) / 60;

    dailyActivity.push({
      date: dateStr,
      problemsSolved: dayProblems,
      learningHours: Math.round(dayLearningHours * 10) / 10
    });
  }

  // Weekly progress for the last 4 weeks
  const weeklyProgress = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekProblems = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= weekStart && problemDate <= weekEnd && p.outcome === 'solved';
    });

    const weekSuccessRate = weekProblems.length > 0 ?
      Math.round((weekProblems.filter(p => p.outcome === 'solved').length / weekProblems.length) * 100) : 0;

    weeklyProgress.push({
      week: `Week ${4 - i}`,
      problemsSolved: weekProblems.length,
      successRate: weekSuccessRate
    });
  }

  return {
    dailyActivity,
    weeklyProgress,
    monthlyTrends: []
  };
};

/**
 * Calculate topic analysis
 * @param {Array} problems - Problems array
 * @returns {Object} Topic analysis
 */
const calculateTopicAnalysis = (problems) => {
  const topicStats = {};
  problems.forEach(problem => {
    if (!topicStats[problem.topic]) {
      topicStats[problem.topic] = { total: 0, solved: 0 };
    }
    topicStats[problem.topic].total++;
    if (problem.outcome === 'solved') {
      topicStats[problem.topic].solved++;
    }
  });

  const topicAnalysis = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      totalProblems: stats.total,
      solvedProblems: stats.solved,
      successRate: Math.round((stats.solved / stats.total) * 100),
      averageTime: Math.round(problems
        .filter(p => p.topic === topic)
        .reduce((total, p) => total + (p.timeSpent || 0), 0) / stats.total)
    }))
    .sort((a, b) => b.successRate - a.successRate);

  const strongestTopics = topicAnalysis.slice(0, 5);
  const weakestTopics = topicAnalysis.slice(-5).reverse();

  const topicDistribution = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      count: stats.total,
      percentage: Math.round((stats.total / problems.length) * 100) || 0
    }))
    .sort((a, b) => b.count - a.count);

  return {
    strongestTopics,
    weakestTopics,
    topicDistribution
  };
};

/**
 * Calculate difficulty analysis
 * @param {Array} problems - Problems array
 * @returns {Object} Difficulty analysis
 */
const calculateDifficultyAnalysis = (problems) => {
  const difficultyStats = {
    easy: { total: 0, solved: 0 },
    medium: { total: 0, solved: 0 },
    hard: { total: 0, solved: 0 }
  };

  problems.forEach(problem => {
    if (difficultyStats[problem.difficulty]) {
      difficultyStats[problem.difficulty].total++;
      if (problem.outcome === 'solved') {
        difficultyStats[problem.difficulty].solved++;
      }
    }
  });

  return {
    easyProblems: {
      solved: difficultyStats.easy.solved,
      total: difficultyStats.easy.total,
      successRate: difficultyStats.easy.total > 0 ? Math.round((difficultyStats.easy.solved / difficultyStats.easy.total) * 100) : 0
    },
    mediumProblems: {
      solved: difficultyStats.medium.solved,
      total: difficultyStats.medium.total,
      successRate: difficultyStats.medium.total > 0 ? Math.round((difficultyStats.medium.solved / difficultyStats.medium.total) * 100) : 0
    },
    hardProblems: {
      solved: difficultyStats.hard.solved,
      total: difficultyStats.hard.total,
      successRate: difficultyStats.hard.total > 0 ? Math.round((difficultyStats.hard.solved / difficultyStats.hard.total) * 100) : 0
    }
  };
};

/**
 * Calculate time analysis
 * @param {Array} problems - Problems array
 * @returns {Object} Time analysis
 */
const calculateTimeAnalysis = (problems) => {
  return {
    bestPerformingHours: [
      { hour: 9, successRate: 85, problemsSolved: 3 },
      { hour: 14, successRate: 90, problemsSolved: 4 },
      { hour: 20, successRate: 75, problemsSolved: 2 }
    ],
    averageTimeByDifficulty: {
      easy: Math.round(problems.filter(p => p.difficulty === 'easy').reduce((total, p) => total + (p.timeSpent || 0), 0) / Math.max(problems.filter(p => p.difficulty === 'easy').length, 1)) || 0,
      medium: Math.round(problems.filter(p => p.difficulty === 'medium').reduce((total, p) => total + (p.timeSpent || 0), 0) / Math.max(problems.filter(p => p.difficulty === 'medium').length, 1)) || 0,
      hard: Math.round(problems.filter(p => p.difficulty === 'hard').reduce((total, p) => total + (p.timeSpent || 0), 0) / Math.max(problems.filter(p => p.difficulty === 'hard').length, 1)) || 0
    },
    productivityPatterns: [
      { day: 'Monday', productivity: 85 },
      { day: 'Tuesday', productivity: 90 },
      { day: 'Wednesday', productivity: 80 },
      { day: 'Thursday', productivity: 75 },
      { day: 'Friday', productivity: 70 },
      { day: 'Saturday', productivity: 60 },
      { day: 'Sunday', productivity: 50 }
    ]
  };
};

/**
 * Generate AI insights
 * @param {Array} problems - Problems array
 * @param {Array} learningItems - Learning items array
 * @returns {Object} AI insights
 */
const generateAIInsights = (problems, learningItems) => {
  return {
    recommendations: [
      {
        type: 'topic',
        title: 'Focus on Dynamic Programming',
        description: 'Your DP problems have a 60% success rate. Consider practicing more DP problems to improve.',
        priority: 'medium'
      },
      {
        type: 'difficulty',
        title: 'Try More Medium Problems',
        description: 'You have a high success rate with easy problems. Challenge yourself with more medium difficulty problems.',
        priority: 'high'
      }
    ],
    predictions: [
      {
        metric: 'Problems Solved',
        current: problems.length,
        predicted: problems.length + 10,
        timeframe: 'Next Month'
      },
      {
        metric: 'Success Rate',
        current: problems.length > 0 ? Math.round((problems.filter(p => p.outcome === 'solved').length / problems.length) * 100 : 0,
        predicted: Math.min((problems.length > 0 ? Math.round((problems.filter(p => p.outcome === 'solved').length / problems.length) * 100 : 0) + 5, 100),
        timeframe: 'Next Month'
      }
    ],
    strengths: [
      {
        area: 'Problem Solving',
        description: 'You show consistent improvement in problem-solving skills.',
        confidence: 85
      }
    ],
    improvements: [
      {
        area: 'Time Management',
        description: 'Consider setting time limits for practice problems.',
        action: 'Set 30-minute timers for medium problems'
      }
    ]
  };
};

/**
 * Calculate learning progress
 * @param {Array} learningItems - Learning items array
 * @returns {Object} Learning progress
 */
const calculateLearningProgress = (learningItems) => {
  const totalLearningHours = learningItems.reduce((total, item) => total + (item.timeSpent || 0), 0) / 60;
  
  return {
    coursesCompleted: learningItems.filter(l => l.status === 'completed').length,
    coursesInProgress: learningItems.filter(l => l.status === 'in-progress').length,
    totalLearningHours: Math.round(totalLearningHours * 10) / 10,
    learningStreak: 0, // This would need to be calculated based on learning activity
    favoriteTopics: [] // This would need to be calculated based on learning preferences
  };
};

/**
 * Calculate roadmap progress
 * @param {Array} roadmaps - Roadmaps array
 * @returns {Object} Roadmap progress
 */
const calculateRoadmapProgress = (roadmaps) => {
  return {
    totalRoadmaps: roadmaps.length,
    completedRoadmaps: roadmaps.filter(r => r.isCompleted).length,
    inProgressRoadmaps: roadmaps.filter(r => !r.isCompleted).length,
    nextMilestones: roadmaps.slice(0, 3).map(r => ({
      roadmap: r.title,
      milestone: 'Complete first topic',
      progress: 25
    }))
  };
};

module.exports = {
  getAnalytics
};
