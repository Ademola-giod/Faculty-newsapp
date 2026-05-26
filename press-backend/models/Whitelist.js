import mongoose from 'mongoose';

const whitelistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String },
  role: { 
    type: String, 
    enum: ['ADMIN', 'SUPER_ADMIN'], 
    default: 'ADMIN' 
  },
  session: { type: String, default: "2025/2026" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Whitelist', whitelistSchema);