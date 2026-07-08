import { Compass } from 'lucide-react';

const ExploreSection = ({ categories, posts, onSelectCategory }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-black mb-6">Explore Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.filter((c) => c !== 'Recommended').map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-blue-800 hover:shadow-md transition"
          >
            <Compass size={22} className="text-blue-900 mb-3" />
            <h3 className="font-black text-slate-800">{cat}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {posts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length} updates
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExploreSection;
