import express from 'express';
import AdminRequest from '../models/AdminRequest.js';
import { checkJwt, attachUserInfo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/apply',
  checkJwt,
  attachUserInfo,
  async (req, res) => {
    try {
      const { department, reason } = req.body;

      const existing = await AdminRequest.findOne({
        email: req.user.email
      });

      if (existing) {
        return res.status(400).json({
          message: 'You already applied'
        });
      }

      const request = await AdminRequest.create({
        name: req.user.fullName,
        email: req.user.email,
        department,
        reason
      });

      res.json(request);

    } catch (err) {
      res.status(500).json({
        message: err.message
      });
    }
  }
);

// 🔥 THIS IS THE PART YOU MISSED
export default router;