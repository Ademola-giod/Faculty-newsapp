import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { checkJwt, attachUserInfo } from '../middleware/authMiddleware.js';
import { isEiC } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Only the EiC can see the "Watchtower" logs
router.get('/', checkJwt, attachUserInfo, isEiC, async (req, res) => {
  try {
    // Get the last 100 actions to keep the dashboard fast
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;