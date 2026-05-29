import mongoose from 'mongoose';

const adminRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true
    },

    department: {
      type: String
    },

    reason: {
      type: String
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  'AdminRequest',
  adminRequestSchema
);