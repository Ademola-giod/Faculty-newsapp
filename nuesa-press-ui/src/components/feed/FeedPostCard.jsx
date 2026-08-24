// import { Heart, Share2, Bookmark, Layers, ArrowRight } from 'lucide-react';

// const stripHtml = (html = '') =>
//   html
//     .replace(/<[^>]*>?/gm, '')
//     .replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'")
//     .replace(/\s+/g, ' ')
//     .trim();

// const relTime = (date) => {
//   const h = Math.floor((Date.now() - new Date(date)) / 3600000);
//   if (h < 1) return 'Just now';
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   if (d < 7) return `${d}d ago`;
//   return new Date(date).toLocaleDateString();
// };

// const FeedPostCard = ({
//   post,
//   onExpand,
//   onLike,
//   onShare,
//   onBookmark,
//   likedPosts,
//   bookmarkedPosts,
//   likeCounts,
// }) => {
//   const isLiked = !!likedPosts[post._id];
//   const isBookmarked = !!bookmarkedPosts[post._id];
//   const count = likeCounts[post._id] ?? 0;
//   const excerpt = stripHtml(post.content).slice(0, 120);

//   return (
//     <article
//       onClick={() => onExpand(post)}
//       className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
//     >
//       {post.image?.url ? (
//         <div className="h-48 w-full overflow-hidden shrink-0 bg-slate-100">
//           <img
//             src={post.image.url}
//             alt={post.title}
//             loading="lazy"
//             className="w-full h-full object-cover object-center block hover:scale-105 transition duration-500"
//           />
//         </div>
//       ) : (
//         <div className="h-48 bg-slate-100 flex items-center justify-center shrink-0">
//           <Layers size={26} className="text-slate-300" />
//         </div>
//       )}

//       <div className="px-5 pt-4 pb-2 flex flex-col gap-2 flex-1">
//         <div className="flex items-center justify-between">
//           <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">{post.category}</span>
//           <span className="text-[10px] text-slate-400">{relTime(post.createdAt)}</span>
//         </div>
//         <h4 className="text-base font-black text-slate-900 leading-snug line-clamp-2">{post.title}</h4>
//         <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
//       </div>

//       <div className="flex items-center justify-between px-5 py-3 mt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-center gap-4">
//           <button
//             onClick={(e) => onLike(post._id, e)}
//             className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
//           >
//             <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
//             <span>{count}</span>
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onShare(post);
//             }}
//             className="text-slate-400 hover:text-blue-700 transition-colors"
//           >
//             <Share2 size={15} />
//           </button>
//           <button
//             onClick={(e) => onBookmark(post._id, e)}
//             className={`transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
//           >
//             <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
//           </button>
//         </div>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onExpand(post);
//           }}
//           className="flex items-center gap-1 text-[11px] font-bold text-blue-800 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
//         >
//           Read more <ArrowRight size={11} />
//         </button>
//       </div>
//     </article>
//   );
// };

// export default FeedPostCard;


import {
  Heart,
  Share2,
  Bookmark,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

import { motion } from 'framer-motion';

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const relTime = (date) => {
  const hours = Math.floor(
    (Date.now() - new Date(date)) / 3600000
  );

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

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

  const excerpt = stripHtml(post.content).slice(0, 135);

  const handleOpenPost = (event) => {
    event.stopPropagation();
    onExpand(post);
  };

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -5,
      }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => onExpand(post)}
      className="
        group
        bg-white
        rounded-[22px]
        overflow-hidden
        border border-slate-200/80
        shadow-sm
        hover:shadow-[var(--nuesa-shadow-md)]
        cursor-pointer
        transition-shadow
        duration-300
      "
    >

      {/* =========================
          IMAGE
      ========================= */}

      <div className="relative h-52 overflow-hidden bg-slate-100">

        {post.image?.url ? (
          <motion.img
            src={post.image.url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{
              scale: 1.06,
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers
              size={30}
              className="text-slate-300"
            />
          </div>
        )}

        {/* Image overlay */}

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black/40
            via-transparent
            to-transparent
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
          "
        />

        {/* Category */}

        <span
          className="
            absolute
            top-4
            left-4
            bg-white/90
            backdrop-blur-md
            text-[var(--nuesa-primary)]
            text-[10px]
            font-black
            uppercase
            tracking-widest
            px-3
            py-1.5
            rounded-full
            shadow-sm
          "
        >
          {post.category}
        </span>

        {/* Open icon */}

        <motion.div
          whileHover={{
            rotate: 45,
            scale: 1.08,
          }}
          className="
            absolute
            top-4
            right-4
            w-9
            h-9
            rounded-full
            bg-black/20
            backdrop-blur-md
            text-white
            flex
            items-center
            justify-center
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
          "
        >
          <ArrowUpRight size={16} />
        </motion.div>

      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="p-5">

        <div className="
          flex
          items-center
          gap-2
          text-[11px]
          text-slate-400
          font-semibold
          mb-2
        ">
          <span>
            {relTime(post.createdAt)}
          </span>

          <span className="w-1 h-1 rounded-full bg-slate-300" />

          <span>
            {post.authorName || 'News Desk'}
          </span>
        </div>

        <h3
          className="
            text-lg
            font-black
            leading-tight
            tracking-tight
            text-slate-900
            line-clamp-2
            group-hover:text-[var(--nuesa-primary)]
            transition-colors
            duration-300
          "
        >
          {post.title}
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-relaxed
            text-slate-500
            line-clamp-2
          "
        >
          {excerpt}
        </p>

      </div>

      {/* =========================
          ACTIONS
      ========================= */}

      <div
        onClick={(event) => event.stopPropagation()}
        className="
          px-5
          py-3.5
          border-t
          border-slate-100
          flex
          items-center
          justify-between
        "
      >

        {/* Left actions */}

        <div className="flex items-center gap-4">

          {/* LIKE */}

          <button
            type="button"
            onClick={(event) =>
              onLike(post._id, event)
            }
            className={`
              flex
              items-center
              gap-1.5
              text-xs
              font-bold
              transition
              ${
                isLiked
                  ? 'text-rose-500'
                  : 'text-slate-400 hover:text-rose-500'
              }
            `}
          >
            <Heart
              size={16}
              fill={
                isLiked
                  ? 'currentColor'
                  : 'none'
              }
            />

            <span>{count}</span>
          </button>

          {/* SHARE */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShare(post);
            }}
            className="
              text-slate-400
              hover:text-[var(--nuesa-primary)]
              transition
            "
          >
            <Share2 size={16} />
          </button>

          {/* BOOKMARK */}

          <button
            type="button"
            onClick={(event) =>
              onBookmark(post._id, event)
            }
            className={`
              transition
              ${
                isBookmarked
                  ? 'text-[var(--nuesa-primary)]'
                  : 'text-slate-400 hover:text-[var(--nuesa-primary)]'
              }
            `}
          >
            <Bookmark
              size={16}
              fill={
                isBookmarked
                  ? 'currentColor'
                  : 'none'
              }
            />
          </button>

        </div>

        {/* =========================
            READ STORY
        ========================= */}

        <motion.button
          type="button"
          onClick={handleOpenPost}
          whileHover={{
            x: 3,
          }}
          whileTap={{
            scale: 0.96,
          }}
          className="
            flex
            items-center
            gap-1
            text-[11px]
            font-black
            text-[var(--nuesa-primary)]
            hover:text-blue-800
            transition-colors
            duration-200
          "
        >
          Read story

          <ArrowUpRight
            size={13}
            className="transition-transform duration-200"
          />
        </motion.button>

      </div>

    </motion.article>
  );
};

export default FeedPostCard;