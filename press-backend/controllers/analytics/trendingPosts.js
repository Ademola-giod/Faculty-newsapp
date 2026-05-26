import Post from '../../models/Post.js';

export const getTrendingPosts = async (req, res) => {
  try {
    const trending = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: '$metrics.likes' },

          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$metrics.likes' }, 3] },
              { $multiply: ['$metrics.views', 0.2] },
              { $multiply: ['$metrics.shares', 5] }
            ]
          }
        }
      },

      { $sort: { engagementScore: -1 } },
      { $limit: 5 },

      {
        $project: {
          title: 1,
          category: 1,
          createdAt: 1,
          engagementScore: 1,
          likesCount: 1,
          'metrics.views': 1,
          'metrics.shares': 1
        }
      }
    ]);

    res.status(200).json(trending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};