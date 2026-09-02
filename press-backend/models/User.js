import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  avatar: { type: String },
  nameSetByUser: { type: Boolean, default: false }, // true if user has set their own display name
  // Roles: SUPER_ADMIN (EiC), ADMIN (Staff), STUDENT (.ui.edu.ng), GUEST (Others)
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'ADMIN', 'STUDENT', 'GUEST'], 
    default: 'GUEST' 
  },
  isActiveStaff: { type: Boolean, default: false }, // Extra safety for the 20 admins
}, { timestamps: true });

export default mongoose.model('User', userSchema);