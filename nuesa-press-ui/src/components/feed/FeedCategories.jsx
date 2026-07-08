const FeedCategories = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
            activeCategory === cat
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-800 hover:text-blue-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default FeedCategories;
