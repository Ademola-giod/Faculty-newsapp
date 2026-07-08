import { Flame } from 'lucide-react';

const FeedHero = ({ heroPost, onExpand, relTime }) => {
  if (!heroPost) return null;

  return (
    <div
      onClick={() => onExpand(heroPost)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group h-[360px] md:h-[420px] shadow-md"
    >
      <img
        src={heroPost.image?.url || 'https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=1400'}
        alt={heroPost.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">
          <Flame size={11} /> TRENDING
        </div>
        <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-2 line-clamp-2">
          {heroPost.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-white/60 font-semibold uppercase tracking-wider">
          <span>{heroPost.category}</span>
          <span>·</span>
          <span>{relTime(heroPost.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default FeedHero;
