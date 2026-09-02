import express from 'express';
import { checkJwt, attachUserInfo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', checkJwt, attachUserInfo, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    fullName: req.user.fullName,
    avatar: req.user.avatar,
    role: req.user.role,
    isActiveStaff: req.user.isActiveStaff,
    nameSetByUser: req.user.nameSetByUser
  });
});





export default router;