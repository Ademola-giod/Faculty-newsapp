
import { ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return postDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

const BreakingNews = ({ topPost, onExpand, relTime }) => {
  if (!topPost) {
    return (
      <div className="h-[420px] rounded-[28px] bg-white border border-dashed border-slate-200 flex items-center justify-center">
        <p className="text-sm font-bold text-slate-400">
          No active stories available
        </p>
      </div>
    );
  }

  const displayTime = relTime
    ? relTime(topPost.createdAt)
    : formatTime(topPost.createdAt);

  const image =
    topPost.image?.url ||
    'https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070';

  return (
    <motion.article
      onClick={() => onExpand(topPost)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group relative h-[430px] sm:h-[500px] lg:h-[560px] rounded-[28px] overflow-hidden cursor-pointer bg-slate-900 shadow-[var(--nuesa-shadow-lg)]"
    >
      {/* Blurred background */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-40"
      />

      {/* Main image */}
      <motion.img
        src={image}
        alt={topPost.title}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        whileHover={{ scale: 1.06 }}
      />

      {/* Editorial overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

      {/* Top label */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Breaking
          </span>

          <span className="hidden sm:flex items-center gap-1.5 text-white/80 text-xs font-semibold backdrop-blur-md bg-black/20 px-3 py-1.5 rounded-full">
            <Clock size={12} />
            {displayTime}
          </span>
        </div>

        <motion.div
          whileHover={{ rotate: 45 }}
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
        >
          <ArrowUpRight size={19} />
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 lg:p-9">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-blue-200 text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] mb-3"
          >
            {topPost.category}
          </motion.span>

          <h1 className="text-white text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] max-w-3xl line-clamp-3">
            {topPost.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-white/75 text-xs">
            <span className="font-semibold">
              By {topPost.authorName || 'News Desk'}
            </span>

            <span className="w-1 h-1 rounded-full bg-white/40" />

            <span>{displayTime}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BreakingNews;

// const formatTime = (date) => {
//   const now = new Date();
//   const postDate = new Date(date);

//   const diffMs = now - postDate;

//   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

//   if (diffHours < 1) {
//     return 'Just now';
//   // }

//   if (diffHours < 24) {
//     return `${diffHours}h ago`;
//   }

//   return postDate.toLocaleTimeString([], {
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// const BreakingNews = ({ topPost, onExpand, relTime }) => {

//   if (!topPost) {
//     return (
//       <div className="h-72 bg-white rounded-4xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
//         No active stories available...
//       </div>
//     );
//   }

//   const displayTime = relTime ? relTime(topPost.createdAt) : formatTime(topPost.createdAt);

//   return (
//     <div
//       onClick={() => onExpand(topPost)}
//       className="relative h-105 w-full rounded-4xl overflow-hidden cursor-pointer shadow-2xl group animate-[fadeIn_0.6s_ease-out]"
//     >
//       <div className="absolute inset-0 bg-slate-900">
//         <img
//           src={
//             topPost.image?.url ||
//             "https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070"
//           }
//           alt={topPost.title}
//           className="absolute inset-0 w-full h-full object-cover scale-105 blur-[24px] opacity-60"
//         />
//         <div className="absolute inset-0 bg-black/40" />
//       </div>

//       <img
//         src={
//           topPost.image?.url ||
//           "https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070"
//         }
//         alt={topPost.title}
//         className="absolute inset-0 w-full h-full object-cover transition duration-[900ms] ease-out group-hover:scale-110 group-hover:rotate-1"
//       />

//       <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent transition duration-500 group-hover:from-black/95" />
//       <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/20" />

//       <div className="absolute bottom-0 left-0 right-0 p-7">

//         <div className="flex items-center gap-2 mb-3 translate-y-1 opacity-90 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
//           <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-600/30 animate-pulse">
//             Breaking
//           </span>

//           <span className="text-white/80 text-xs font-semibold">
//             {displayTime}
//           </span>
//         </div>

//         <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-4 line-clamp-2 transition duration-500 group-hover:translate-x-1">
//           {topPost.title}
//         </h2>

//         <div className="flex items-center gap-3 transition duration-500 group-hover:translate-y-0.5">
//           <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs text-white font-bold uppercase">
//             {topPost.category}
//           </span>

//           <span className="text-white/70 text-xs">
//             by {topPost.authorName}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BreakingNews;