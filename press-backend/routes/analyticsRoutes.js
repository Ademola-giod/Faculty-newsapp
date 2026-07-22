import express from 'express';

import {
  getDashboardStats,
  getTrendingPosts,
  getCategoryStats,
  getDailyPostStats,
  getDashboardAnalytics
} from '../controllers/analytics/index.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);

router.get('/trending', getTrendingPosts);

router.get('/categories', getCategoryStats);

router.get('/daily-posts', getDailyPostStats);

export default router;