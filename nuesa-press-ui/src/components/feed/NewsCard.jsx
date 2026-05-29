import {
  Heart,
  Share2,
  Bookmark,
  Eye
} from 'lucide-react';

const formatTime = (date) => {
  const now = new Date();
  const postDate = new Date(date);

  const diffMs = now - postDate;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Now';
  }

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return postDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NewsCard = ({
  post,
  onExpand,
  onLike,
  onShare,
  onBookmark,
  isLiked,
  isBookmarked
}) => {

  const textPreview = post.content
    ? post.content.replace(/<[^>]*>/g, '')
    : '';

  return (
    <div
      onClick={() => onExpand(post)}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >

      {/* IMAGE */}
      {post.image?.url && (
        <div className="w-full h-64 overflow-hidden bg-slate-100">
          <img
            src={post.image.url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition duration-700"
          />
        </div>
      )}

      {/* CONTENT */}
      <div className="p-5">

        {/* TOP META */}
        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <img
              src={
                post.avatar ||
                "https://i.pravatar.cc/100"
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <h4 className="text-sm font-black text-slate-800">
                {post.fullName}
              </h4>

              <p className="text-xs text-slate-400">
                {formatTime(post.createdAt)}
              </p>
            </div>
          </div>

          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-black text-slate-900 leading-tight mb-3 line-clamp-2">
          {post.title}
        </h2>

        {/* PREVIEW */}
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {textPreview}
        </p>

        {/* ACTIONS */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100"
        >

          {/* LIKE */}
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-2 transition ${
              isLiked
                ? 'text-rose-600'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart
              size={18}
              fill={isLiked ? 'currentColor' : 'none'}
            />

            <span className="text-sm font-bold">
              {post.metrics?.likes?.length || 0}
            </span>
          </button>

          {/* VIEWS */}
          <div className="flex items-center gap-2 text-slate-500">
            <Eye size={18} />

            <span className="text-sm font-bold">
              {post.metrics?.views || 0}
            </span>
          </div>

          {/* SHARE */}
          <button
            onClick={() => onShare(post)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition"
          >
            <Share2 size={18} />

            <span className="text-sm font-bold">
              {post.metrics?.shares || 0}
            </span>
          </button>

          {/* BOOKMARK */}
          <button
            onClick={() => onBookmark(post._id)}
            className={`transition ${
              isBookmarked
                ? 'text-amber-500'
                : 'text-slate-500 hover:text-amber-500'
            }`}
          >
            <Bookmark
              size={18}
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;