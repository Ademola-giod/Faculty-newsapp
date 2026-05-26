import express from 'express';
import { syncUser } from '../controllers/userController.js';
import { checkJwt } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every time the frontend boots up or user logs in, we sync their profile
router.post('/sync', checkJwt, syncUser);

export default router;