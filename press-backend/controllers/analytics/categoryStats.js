import Post from '../../models/Post.js';

export const getCategoryStats = async (req, res) => {
  try {
    const categories = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          totalPosts: { $sum: 1 }
        }
      },
      { $sort: { totalPosts: -1 } }
    ]);

    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};