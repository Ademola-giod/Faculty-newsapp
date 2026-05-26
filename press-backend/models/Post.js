import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  keywords: [{ type: String }], // For better searchability and SEO
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  image: {
    url: { type: String },
    public_id: { type: String } // Needed to delete from Cloudinary later
  },
  status: { 
    type: String, 
    enum: ['Published', 'Archived'], 
    default: 'Published' 
  },
  lastEditedBy: { type: String },  // Store the name of the last editor for transparency

  // --- THE TRANSPARENCY FIELDS ---
  // isAppealed: { type: Boolean, default: false },
  // appealReason: { type: String },
  // appealDate: { type: Date },
  
//   comments: [
//   {
//     userId: String,
//     userName: String,
//     text: String,
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }
//   ],

  // data not saving for each user interaction
  // metrics: {
  //   views: { type: Number, default: 0 },
  //   likes: { type: [String], default: [] }, // Array of User IDs to prevent double-liking
  //   shares: { type: Number, default: 0 }
  // }

  // data saving for each user interaction

  metrics: {
   likes: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      }
   ],

   shares: {
      type: Number,
      default: 0
   },

   views: {
      type: Number,
      default: 0
   }
}

}, { timestamps: true });

// Create a text index so students can search for news later
postSchema.index({ title: 'text', content: 'text', keywords: 'text' });

export default mongoose.model('Post', postSchema);