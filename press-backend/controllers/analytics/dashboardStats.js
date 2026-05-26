import Post from '../../models/Post.js';
import User from '../../models/User.js';
import Comment from '../../models/comment.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();

    const metrics = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$metrics.views' },
          totalShares: { $sum: '$metrics.shares' },
          totalLikes: {
            $sum: {
                $size: { $ifNull: ['$metrics.likes', []] }
            }
            }
          //   totalLikes: { $sum: { $size: '$metrics.likes' } }
        }
      }
    ]);

    res.status(200).json({
      totalPosts,
      totalUsers,
      totalComments,
      totalViews: metrics[0]?.totalViews || 0,
      totalShares: metrics[0]?.totalShares || 0,
      totalLikes: metrics[0]?.totalLikes || 0
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};