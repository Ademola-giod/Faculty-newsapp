

const formatTime = (date) => {
  const now = new Date();
  const postDate = new Date(date);

  const diffMs = now - postDate;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Just now';
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return postDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const BreakingNews = ({ topPost, onExpand, relTime }) => {

  if (!topPost) {
    return (
      <div className="h-72 bg-white rounded-4xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
        No active stories available...
      </div>
    );
  }

  const displayTime = relTime ? relTime(topPost.createdAt) : formatTime(topPost.createdAt);

  return (
    <div
      onClick={() => onExpand(topPost)}
      className="relative h-105 w-full rounded-4xl overflow-hidden cursor-pointer shadow-2xl group animate-[fadeIn_0.6s_ease-out]"
    >
      <div className="absolute inset-0 bg-slate-900">
        <img
          src={
            topPost.image?.url ||
            "https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070"
          }
          alt={topPost.title}
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-[24px] opacity-60"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <img
        src={
          topPost.image?.url ||
          "https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070"
        }
        alt={topPost.title}
        className="absolute inset-0 w-full h-full object-cover transition duration-[900ms] ease-out group-hover:scale-110 group-hover:rotate-1"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent transition duration-500 group-hover:from-black/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/20" />

      <div className="absolute bottom-0 left-0 right-0 p-7">

        <div className="flex items-center gap-2 mb-3 translate-y-1 opacity-90 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-600/30 animate-pulse">
            Breaking
          </span>

          <span className="text-white/80 text-xs font-semibold">
            {displayTime}
          </span>
        </div>

        <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-4 line-clamp-2 transition duration-500 group-hover:translate-x-1">
          {topPost.title}
        </h2>

        <div className="flex items-center gap-3 transition duration-500 group-hover:translate-y-0.5">
          <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs text-white font-bold uppercase">
            {topPost.category}
          </span>

          <span className="text-white/70 text-xs">
            by {topPost.authorName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;