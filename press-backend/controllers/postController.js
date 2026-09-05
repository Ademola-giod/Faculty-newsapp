import Post from '../models/Post.js';
import { logActivity } from '../utils/logger.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import Comment from '../models/comment.js';


// 1. CREATE POST
export const createPost = async (req, res) => {

  try {

    const { title, content, category, keywords } = req.body;

    const keywordsArray = keywords
      ? keywords.split(',').map(tag => tag.trim())
      : [];

    const imageUrl = req.file?.path || null;
    const imageId = req.file?.filename || null;

    if (!req.user) {
      return res.status(403).json({
        message: 'User not attached to request'
      });
    }

    const newPost = await Post.create({
      title,
      content,
      category,
      keywords: keywordsArray,
      authorId: req.user._id,
      authorName: req.user.fullName || req.user.name || req.user.email,
      image: {
        url: imageUrl,
        public_id: imageId
      },
      status: 'Published'
    });

    // POST CREATED EVENT
    req.io.emit(SOCKET_EVENTS.POST_CREATED, {
      post: newPost
    });

    // GLOBAL DASHBOARD REFRESH
    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    await logActivity(
      req,
      'CREATE_POST',
      newPost._id,
      `Admin created live post`
    );

    res.status(201).json(newPost);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }

};


// 2. UPDATE POST
export const updatePost = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      title,
      content,
      category,
      keywords,
      authorName
    } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.authorName = authorName || post.authorName;

    if (keywords !== undefined) {
      post.keywords = keywords
        ? keywords.split(',').map(tag => tag.trim())
        : [];
    }

    if (req.file) {
      post.image = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    await post.save();

    req.io.emit(SOCKET_EVENTS.POST_UPDATED, {
      post
    });

    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    await logActivity(
      req,
      'UPDATE_POST',
      post._id,
      `Post edited`
    );

    res.json({
      message: 'Post updated successfully!',
      post
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// 3. GET PUBLIC POSTS
export const getPublicPosts = async (req, res) => {

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();

    const query = { status: 'Published' };

    if (category && category !== 'Recommended') {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
        { keywords: { $elemMatch: { $regex: searchRegex, $options: 'i' } } }
      ];
    }

    const total = await Post.countDocuments(query);
    const posts = await Post
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      posts,
      page,
      limit,
      total,
      hasMore: page * limit < total
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// 2. GET ADMIN POSTS (paginated)
export const getAdminPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const search = req.query.search?.trim();

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
        { keywords: { $elemMatch: { $regex: searchRegex, $options: 'i' } } }
      ];
    }

    const total = await Post.countDocuments(query);
    const posts = await Post
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      posts,
      page,
      limit,
      total,
      hasMore: page * limit < total
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// . GET SINGLE POST
export const getPostById = async (req, res) => {

  try {

    const post = await Post.findOne(
      {_id: req.params.id,
        status: 'Published'
      }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.status(200).json(post);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// 4. TRACK SHARE
export const trackShare = async (req, res) => {

  try {

    const { id } = req.params;

    const post = await Post.findByIdAndUpdate(
      id,
      {
        $inc: {
          'metrics.shares': 1
        }
      },
      {
        new: true
      }
    );

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    req.io.emit(SOCKET_EVENTS.POST_SHARED, {
      postId: id,
      shares: post.metrics.shares
    });

    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    res.json({
      success: true,
      shares: post.metrics.shares
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// 5. DELETE POST
export const deletePost = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // const isAuthor =
    //   post.authorId.toString() === req.user._id.toString();

    // const isEiC =
    //   req.user.role === 'SUPER_ADMIN';

    // if (!isAuthor && !isEiC) {
    //   return res.status(403).json({
    //     message: 'Unauthorized deletion attempt.'
    //   });
    // }

    // any NUESA admin can delete any post 
    if(req.user.role !== 'ADMIN') {

      return res.status(403).json({
        message: 'Unauthorized deletion attempt.'
      });
    }

    await post.deleteOne();

    req.io.emit(SOCKET_EVENTS.POST_DELETED, {
      postId: post._id
    });

    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    await logActivity(
      req,
      'DELETE_POST',
      post._id,
      `Deleted article`
    );

    res.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// 6. TOGGLE LIKE
export const toggleLike = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    const userId = req.user._id;

    const alreadyLiked =
      post.metrics.likes.includes(userId);

    if (alreadyLiked) {
      post.metrics.likes.pull(userId);
    } else {
      post.metrics.likes.push(userId);
    }

    await post.save();

    req.io.emit(SOCKET_EVENTS.POST_LIKED, {
      postId: post._id,
      likes: post.metrics.likes.length
    });

    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    res.status(200).json({
      likes: post.metrics.likes.length,
      liked: !alreadyLiked
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};


// 7. VIEW TRACKING
export const incrementView = async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    post.metrics.views += 1;

    await post.save();

    req.io.emit(SOCKET_EVENTS.POST_VIEWED, {
      postId: post._id,
      views: post.metrics.views
    });

    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    res.status(200).json({
      views: post.metrics.views
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};


// 8. ADD COMMENT
export const addComment = async (req, res) => {

  try {

    const { content } = req.body;

    const newComment = await Comment.create({
      postId: req.params.id,
      userId: req.user._id,
      content,
      fullName:
        req.user.fullName ||
        req.user.name ||
        req.user.email,
      avatar: req.user.avatar || ''
    });

    req.io.emit(SOCKET_EVENTS.NEW_COMMENT, {
      postId: req.params.id,
      comment: newComment
    });

    req.io.emit(SOCKET_EVENTS.DASHBOARD_UPDATE);

    res.status(201).json(newComment);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

};


// 9. GET COMMENTS
export const getComments = async (req, res) => {

  try {

    const comments = await Comment
      .find({ postId: req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json(comments);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};


// EDIT COMMENT
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comment' });
    }

    comment.content = content.trim();
    comment.edited = true;
    await comment.save();

    res.json(comment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE COMMENT LIKE
export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      liked: !alreadyLiked,
      likes: comment.likes.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
