import Post from '../../models/Post.js';

export const getDashboardAnalytics = async (req, res) => {
  try {

    const posts = await Post.find();

    const totalViews = posts.reduce(
      (acc, post) => acc + (post.metrics?.views || 0),
      0
    );

    const totalShares = posts.reduce(
      (acc, post) => acc + (post.metrics?.shares || 0),
      0
    );

    const totalLikes = posts.reduce(
      (acc, post) => acc + (post.metrics?.likes?.length || 0),
      0
    );

    res.json({
      totalViews,
      totalShares,
      totalLikes,
      totalPosts: posts.length
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};