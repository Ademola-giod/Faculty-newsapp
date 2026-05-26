import AuditLog from '../models/AuditLog.js';

export const logActivity = async (req, action, targetId, details) => {
  try {
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action,
      targetId,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for']
    });
  } catch (error) {
    console.error("Audit Log Failed:", error.message);
    // We don't throw the error here so the main action (like posting) 
    // doesn't fail just because the log failed.
  }
};