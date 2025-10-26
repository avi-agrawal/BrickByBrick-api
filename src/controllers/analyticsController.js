/**
 * ANALYTICS CONTROLLER
 * 
 * Handles all analytics and insights operations including
 * user statistics, performance metrics, and AI-powered recommendations.
 */

const { Problem, LearningItem, RevisionItem, Roadmap } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/analytics
 * Get comprehensive analytics for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAnalytics = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log(userId);
    const { timeframe, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Build date filter based on parameters
    let dateFilter = {};
    if (startDate && endDate) {
      // Custom date range
      dateFilter = {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
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
          startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to month
      }

      dateFilter = {
        date: {
          [Op.gte]: startDateFilter
        }
      };
    }

    // Get problems for the user with date filter
    const problems = await Problem.findAll({
      where: {
        userId: userId,
        ...dateFilter
      }
    });

    // Get all learning items for the user with date filter
    const learningItems = await LearningItem.findAll({
      where: {
        userId: userId,
        ...dateFilter
      }
    });

    // Get all revision items for the user with date filter
    // For revision items, we need to filter by nextRevisionDate instead of date
    let revisionDateFilter = {};
    if (startDate && endDate) {
      // Custom date range - filter by nextRevisionDate
      revisionDateFilter = {
        nextRevisionDate: {
          [Op.between]: [startDate, endDate]
        }
      };
    } else if (timeframe) {
      // Predefined timeframes - filter by nextRevisionDate
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
          startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to month
      }

      revisionDateFilter = {
        nextRevisionDate: {
          [Op.gte]: startDateFilter.toISOString().split('T')[0]
        }
      };
    }

    const revisionItems = await RevisionItem.findAll({
      where: {
        userId: userId,
        ...revisionDateFilter
      }
    });

    // Calculate analytics
    const totalProblems = problems.length;
    const solvedProblems = problems.filter(p => p.outcome === 'solved').length;
    const successRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    // Calculate weekly solved (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklySolved = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= oneWeekAgo && p.outcome === 'solved';
    }).length;

    // Calculate current streak (consecutive days with solved problems)
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
            // Skip days without problems
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
      }
    }

    // Calculate monthly change (compare current month to previous month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthProblems = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= currentMonthStart && p.outcome === 'solved';
    }).length;

    const lastMonthProblems = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= lastMonthStart && problemDate <= lastMonthEnd && p.outcome === 'solved';
    }).length;

    const monthlyChange = currentMonthProblems - lastMonthProblems;

    // Calculate weekly change (compare current week to previous week)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setDate(currentWeekStart.getDate() - 1);

    const currentWeekProblems = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= currentWeekStart && p.outcome === 'solved';
    }).length;

    const lastWeekProblems = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= lastWeekStart && problemDate <= lastWeekEnd && p.outcome === 'solved';
    }).length;

    const weeklyChange = currentWeekProblems - lastWeekProblems;

    // Calculate streak change (compare current streak to previous streak)
    const streakChange = currentStreak > 0 ? 1 : 0;

    // Calculate rate change (compare current success rate to previous month)
    const currentMonthTotal = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= currentMonthStart;
    }).length;

    const lastMonthTotal = problems.filter(p => {
      const problemDate = new Date(p.date);
      return problemDate >= lastMonthStart && problemDate <= lastMonthEnd;
    }).length;

    const currentMonthSuccessRate = currentMonthTotal > 0 ? Math.round((currentMonthProblems / currentMonthTotal) * 100) : 0;
    const lastMonthSuccessRate = lastMonthTotal > 0 ? Math.round((lastMonthProblems / lastMonthTotal) * 100) : 0;
    const rateChange = currentMonthSuccessRate - lastMonthSuccessRate;

    // Calculate advanced analytics
    const totalLearningHours = learningItems.reduce((total, item) => total + (item.timeSpent || 0), 0) / 60; // Convert minutes to hours
    const averageTimePerProblem = totalProblems > 0 ? Math.round(problems.reduce((total, p) => total + (p.timeSpent || 0), 0) / totalProblems) : 0;

    // Get unique topics
    const uniqueTopics = [...new Set(problems.map(p => p.topic))].length;

    // Get completed roadmaps
    const roadmaps = await Roadmap.findAll({
      where: { userId: userId }
    });
    const completedRoadmaps = roadmaps.filter(r => r.isCompleted).length;

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

    // Topic analysis
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

    // Difficulty analysis
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

    // Platform analysis
    const platformStats = {};
    problems.forEach(problem => {
      if (!platformStats[problem.platform]) {
        platformStats[problem.platform] = { total: 0, solved: 0 };
      }
      platformStats[problem.platform].total++;
      if (problem.outcome === 'solved') {
        platformStats[problem.platform].solved++;
      }
    });

    const platformAnalysis = Object.entries(platformStats)
      .map(([platform, stats]) => ({
        platform,
        totalProblems: stats.total,
        solvedProblems: stats.solved,
        successRate: Math.round((stats.solved / stats.total) * 100)
      }))
      .sort((a, b) => b.totalProblems - a.totalProblems);

    // Transform difficulty analysis to match frontend expectations
    const difficultyAnalysis = {
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

    // Generate topic distribution
    const topicDistribution = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        count: stats.total,
        percentage: Math.round((stats.total / totalProblems) * 100) || 0
      }))
      .sort((a, b) => b.count - a.count);

    // Generate time analysis (mock data for now)
    const timeAnalysis = {
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

    // Generate AI insights (mock data for now)
    const aiInsights = {
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
          current: totalProblems,
          predicted: totalProblems + 10,
          timeframe: 'Next Month'
        },
        {
          metric: 'Success Rate',
          current: successRate,
          predicted: Math.min(successRate + 5, 100),
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

    // Generate learning progress
    const learningProgress = {
      coursesCompleted: learningItems.filter(l => l.status === 'completed').length,
      coursesInProgress: learningItems.filter(l => l.status === 'in-progress').length,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10,
      learningStreak: currentStreak, // Using current streak as learning streak
      favoriteTopics: topicDistribution.slice(0, 3).map(t => ({
        topic: t.topic,
        hours: Math.round(t.count * 0.5) // Mock calculation
      }))
    };

    // Generate roadmap progress
    const roadmapProgress = {
      totalRoadmaps: roadmaps.length,
      completedRoadmaps,
      inProgressRoadmaps: roadmaps.filter(r => !r.isCompleted).length,
      nextMilestones: roadmaps.slice(0, 3).map(r => ({
        roadmap: r.title,
        milestone: 'Complete first topic',
        progress: 25
      }))
    };

    const analytics = {
      overview: {
        totalProblems,
        totalLearningHours: Math.round(totalLearningHours * 10) / 10,
        currentStreak,
        successRate,
        averageTimePerProblem,
        totalTopics: uniqueTopics,
        completedRoadmaps
      },

      // Added compact stats for problems screen
      problemStats: {
        totalProblems,
        weeklySolved,
        currentStreak,
        successRate,
        weeklyChange,
        streakChange,
        rateChange
      },

      performanceMetrics: {
        dailyActivity,
        weeklyProgress,
        monthlyTrends: [] // Can be implemented later if needed
      },

      topicAnalysis: {
        strongestTopics,
        weakestTopics,
        topicDistribution
      },

      difficultyAnalysis,

      timeAnalysis,

      aiInsights,

      learningProgress,

      roadmapProgress
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating analytics',
      error: error.message
    });
  }
};

module.exports = {
  getAnalytics
};
