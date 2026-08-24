// const FeedCategories = ({ categories, activeCategory, setActiveCategory }) => {
//   return (
//     <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-none">
//       {categories.map((cat) => (
//         <button
//           key={cat}
//           onClick={() => setActiveCategory(cat)}
//           className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
//             activeCategory === cat
//               ? 'bg-blue-900 text-white border-blue-900'
//               : 'bg-white border-slate-200 text-slate-600 hover:border-blue-800 hover:text-blue-800'
//           }`}
//         >
//           {cat}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default FeedCategories;


import { motion } from 'framer-motion';

const FeedCategories = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        {categories.map((category) => {
          const active = activeCategory === category;

          return (
            <motion.button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              whileTap={{ scale: 0.95 }}
              className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${
                active
                  ? 'text-white'
                  : 'text-slate-500 hover:text-[var(--nuesa-primary)] hover:bg-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="activeCategory"
                  className="absolute inset-0 rounded-full bg-[var(--nuesa-primary)] shadow-lg shadow-blue-500/20"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative z-10">
                {category}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default FeedCategories;