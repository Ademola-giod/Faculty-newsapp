import express from 'express';
import {
  createPost,
  getPublicPosts,
  deletePost,
  toggleLike,
  incrementView,
  addComment,
  getComments
} from '../controllers/postController.js';

import {
  checkJwt,
  attachUserInfo
} from '../middleware/authMiddleware.js';

import {
  isAdmin
} from '../middleware/roleMiddleware.js';

import { upload } from '../utils/cloudinary.js';

const router = express.Router();


// ───────────────── PUBLIC ROUTES ─────────────────

// Get all posts
router.get('/', getPublicPosts);

// Increment views
router.patch('/:id/view', incrementView);

// Get comments
router.get('/:id/comments', getComments);


// ───────────── AUTH REQUIRED ROUTES ─────────────

// Like post
router.patch(
  '/:id/like',
  checkJwt,
  attachUserInfo,
  toggleLike
);

// Add comment
router.post(
  '/:id/comments',
  checkJwt,
  attachUserInfo,
  addComment
);


// ───────────── ADMIN ROUTES ─────────────

// Create post
router.post(
  '/',
  checkJwt,
  attachUserInfo,
  isAdmin,
  upload.single('image'),
  createPost
);

// Delete post
router.delete(
  '/:id',
  checkJwt,
  attachUserInfo,
  isAdmin,
  deletePost
);

export default router;