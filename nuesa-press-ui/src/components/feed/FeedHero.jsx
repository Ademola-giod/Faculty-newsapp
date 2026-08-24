// import { useEffect, useMemo, useState } from 'react';
// import BreakingNews from './BreakingNews';

// const FeedHero = ({ heroPost, featuredPosts = [], onExpand, relTime }) => {
//   const [activeIndex, setActiveIndex] = useState(0);

//   const carouselPosts = useMemo(() => {
//     if (featuredPosts.length > 0) return featuredPosts;
//     return heroPost ? [heroPost] : [];
//   }, [featuredPosts, heroPost]);

//   useEffect(() => {
//     if (carouselPosts.length <= 1) return undefined;

//     const timer = window.setInterval(() => {
//       setActiveIndex((prev) => (prev + 1) % carouselPosts.length);
//     }, 7000);

//     return () => window.clearInterval(timer);
//   }, [carouselPosts.length]);

//   useEffect(() => {
//     setActiveIndex(0);
//   }, [heroPost?._id]);

//   if (!carouselPosts.length) return null;

//   const activePost = carouselPosts[activeIndex] || carouselPosts[0];

//   return (
//     <div className="relative">
//       <div className="absolute inset-0 -z-10 blur-3xl bg-red-500/20 rounded-[2rem] scale-95" />

//       <div className="relative overflow-hidden rounded-[2rem]">
//         <div className="w-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
//           <div className="flex w-full">
//             {carouselPosts.map((post) => (
//               <div key={post._id} className="w-full shrink-0">
//                 <BreakingNews topPost={post} onExpand={onExpand} relTime={relTime} />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {carouselPosts.length > 1 && (
//         <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
//           {carouselPosts.map((post, index) => (
//             <button
//               key={post._id}
//               type="button"
//               aria-label={`Go to slide ${index + 1}`}
//               onClick={() => setActiveIndex(index)}
//               className={`h-1.5 rounded-full transition-all duration-300 ${
//                 activeIndex === index ? 'w-8 bg-white' : 'w-4 bg-white/55 hover:bg-white/80'
//               }`}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeedHero;



import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import BreakingNews from './BreakingNews';

const FeedHero = ({
  heroPost,
  featuredPosts = [],
  onExpand,
  relTime,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselPosts = useMemo(() => {
    if (featuredPosts.length > 0) {
      return featuredPosts;
    }

    return heroPost ? [heroPost] : [];
  }, [featuredPosts, heroPost]);

  useEffect(() => {
    if (carouselPosts.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((previous) => {
        return (previous + 1) % carouselPosts.length;
      });
    }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, [carouselPosts.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [heroPost?._id]);

  if (!carouselPosts.length) {
    return null;
  }

  const activePost =
    carouselPosts[activeIndex] || carouselPosts[0];

  return (
    <section className="relative">
      <motion.div
        key={activePost._id}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <BreakingNews
          topPost={activePost}
          onExpand={onExpand}
          relTime={relTime}
        />
      </motion.div>

      {carouselPosts.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {carouselPosts.map((post, index) => (
            <button
              key={post._id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className="p-1"
            >
              <motion.span
                animate={{
                  width: activeIndex === index ? 28 : 7,
                  opacity: activeIndex === index ? 1 : 0.5,
                }}
                className="block h-1.5 rounded-full bg-white"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeedHero;