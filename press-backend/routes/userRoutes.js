import express from 'express';
import { syncUser, updateUserName} from '../controllers/userController.js';
import { checkJwt, attachUserInfo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every time the frontend boots up or user logs in, we sync their profile
router.post('/sync', checkJwt, syncUser);

// let a logged-in user set their own display name
router.patch('/me/name', checkJwt, attachUserInfo, updateUserName);

export default router;