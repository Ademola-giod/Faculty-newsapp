import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName: { type: String, required: true },
  action: { 
    type: String, 
    enum: ['CREATE_POST', 'APPROVE_POST', 'DELETE_POST', 'DELETE_COMMENT', 'LOGIN'],
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the post/comment acted upon
  details: { type: String }, // e.g., "EiC approved 'Strikes in UI' article"
  ipAddress: { type: String }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);