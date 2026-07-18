import  { useEffect, useState, useCallback  } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { getTokenWithFallback } from '../../utils/authHelpers';
import { MessageCircle, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CommentsSection = ({
  expandedPost,
  user,
  getAccessTokenSilently
}) => {

  const { loginWithPopup, loginWithRedirect } = useAuth0();

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── fetch comments ─────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!expandedPost?._id) return;

    try {
      setLoadingComments(true);

      const res = await axios.get(
        `${API_URL}/api/posts/${expandedPost._id}/comments`
      );

      setComments(res.data);

    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [expandedPost]);

  // ─── submit comment ─────────────────────────────────────────
  const submitComment = useCallback(
    async () => {
      if (!commentText.trim()) return;

    try {
      setSubmitting(true);

      const token = await getTokenWithFallback({
        getAccessTokenSilently,
        loginWithPopup,
        loginWithRedirect,
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access'
        }
      });

      const res = await axios.post(
        `${API_URL}/api/posts/${expandedPost._id}/comments`,
        {
          content: commentText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComments((prev) => [res.data, ...prev]);
      setCommentText('');

    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [
    commentText,
    expandedPost,
    getAccessTokenSilently
  ]);

  useEffect(() => {
  const init = async () => {
    await fetchComments();
  };

  init();
}, [fetchComments]);

  return (
    <section className="mt-12 border-t border-slate-200 pt-8">

      {/* TITLE */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={18} className="text-blue-900" />
        <h2 className="text-xl font-black text-slate-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* INPUT */}
      {user ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8">
          <textarea
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            className="w-full resize-none outline-none text-sm bg-transparent"
          />

          <div className="flex justify-end mt-4">
            <button
              onClick={submitComment}
              disabled={submitting}
              className="bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 transition"
            >
              <Send size={14} />
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 text-sm text-slate-500 mb-8">
          Login to comment.
        </div>
      )}

      {/* COMMENTS */}
      {loadingComments ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
          <MessageCircle size={24} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">
            No comments yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">

                <img
                  src={
                    comment.user?.picture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      comment.user?.name || 'User'
                    )}`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {comment.user?.name || 'Anonymous'}
                  </h4>

                  <p className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentsSection;