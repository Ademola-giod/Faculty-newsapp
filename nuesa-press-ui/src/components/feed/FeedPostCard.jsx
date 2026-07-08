import { Heart, Share2, Bookmark, Layers, ArrowRight } from 'lucide-react';

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const relTime = (date) => {
  const h = Math.floor((Date.now() - new Date(date)) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

const FeedPostCard = ({
  post,
  onExpand,
  onLike,
  onShare,
  onBookmark,
  likedPosts,
  bookmarkedPosts,
  likeCounts,
}) => {
  const isLiked = !!likedPosts[post._id];
  const isBookmarked = !!bookmarkedPosts[post._id];
  const count = likeCounts[post._id] ?? 0;
  const excerpt = stripHtml(post.content).slice(0, 120);

  return (
    <article
      onClick={() => onExpand(post)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {post.image?.url ? (
        <div className="h-48 overflow-hidden shrink-0">
          <img
            src={post.image.url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition duration-500"
          />
        </div>
      ) : (
        <div className="h-48 bg-slate-100 flex items-center justify-center shrink-0">
          <Layers size={26} className="text-slate-300" />
        </div>
      )}

      <div className="px-5 pt-4 pb-2 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">{post.category}</span>
          <span className="text-[10px] text-slate-400">{relTime(post.createdAt)}</span>
        </div>
        <h4 className="text-base font-black text-slate-900 leading-snug line-clamp-2">{post.title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
      </div>

      <div className="flex items-center justify-between px-5 py-3 mt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => onLike(post._id, e)}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{count}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(post);
            }}
            className="text-slate-400 hover:text-blue-700 transition-colors"
          >
            <Share2 size={15} />
          </button>
          <button
            onClick={(e) => onBookmark(post._id, e)}
            className={`transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
          >
            <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand(post);
          }}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-800 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
        >
          Read more <ArrowRight size={11} />
        </button>
      </div>
    </article>
  );
};

export default FeedPostCard;
