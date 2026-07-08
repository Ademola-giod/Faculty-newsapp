import { X, Heart, Bookmark, Share2, Eye } from 'lucide-react';
import CommentsSection from './CommentsSection';

const PostModal = ({
  post,
  onClose,
  likedPosts,
  bookmarkedPosts,
  likeCounts,
  toggleLike,
  toggleBookmark,
  sharePost,
  user,
  getAccessTokenSilently,
}) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-100 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-900 transition"
          >
            <X size={18} /> Close
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => toggleLike(post._id, e)}
              className={`flex items-center gap-1.5 text-sm font-bold transition ${likedPosts[post._id] ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
            >
              <Heart size={17} fill={likedPosts[post._id] ? 'currentColor' : 'none'} />
              {likeCounts[post._id] ?? 0}
            </button>
            <button
              onClick={(e) => toggleBookmark(post._id, e)}
              className={`transition ${bookmarkedPosts[post._id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
            >
              <Bookmark size={17} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => sharePost(post)}
              className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-bold px-4 py-1.5 rounded-full hover:bg-blue-950 transition"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {post.image?.url && (
        <div className="w-full h-[260px] md:h-[400px] overflow-hidden">
          <img src={post.image.url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-blue-50 text-blue-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
            {post.category}
          </span>
          <span className="text-xs text-slate-400 font-semibold">{post.createdAt}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black leading-tight text-slate-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-200">
          <Eye size={13} /><span>{post.metrics?.views || 0} views</span>
          <span>·</span>
          <Heart size={13} /><span>{likeCounts[post._id] ?? 0} likes</span>
        </div>

        <div
          className="prose prose-slate prose-base max-w-none break-words overflow-hidden prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:break-words prose-a:text-blue-800 prose-a:font-semibold prose-a:break-all prose-strong:text-slate-900 prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto prose-pre:overflow-x-auto prose-code:break-words prose-li:text-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => toggleLike(post._id, e)}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${likedPosts[post._id] ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'}`}
            >
              <Heart size={15} fill={likedPosts[post._id] ? 'currentColor' : 'none'} />
              {likedPosts[post._id] ? 'Liked' : 'Like'} · {likeCounts[post._id] ?? 0}
            </button>
            <button
              onClick={(e) => toggleBookmark(post._id, e)}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${bookmarkedPosts[post._id] ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'}`}
            >
              <Bookmark size={15} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
              {bookmarkedPosts[post._id] ? 'Saved' : 'Save'}
            </button>
          </div>
          <button
            onClick={() => sharePost(post)}
            className="flex items-center gap-2 bg-blue-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-blue-950 transition"
          >
            <Share2 size={14} /> Share this post
          </button>
        </div>
      </article>

      <CommentsSection
        expandedPost={post}
        user={user}
        getAccessTokenSilently={getAccessTokenSilently}
      />
    </div>
  );
};

export default PostModal;
