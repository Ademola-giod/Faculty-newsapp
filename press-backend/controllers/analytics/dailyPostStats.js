import Post from '../../models/Post.js';

export const getDailyPostStats = async (req, res) => {
  try {
    const daily = await Post.aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalPosts: { $sum: 1 }
        }
      },

      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    res.status(200).json(daily);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};