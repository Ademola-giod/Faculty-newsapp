import { EmptySavedState } from './EmptyState';

const SavedPostsSection = ({ bookmarkedPosts, posts, onOpenPost, relTime }) => {
  const savedPosts = posts.filter((post) => !!bookmarkedPosts[post._id]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-black mb-6">Saved Posts</h2>
      {savedPosts.length === 0 ? (
        <EmptySavedState />
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <div
              key={post._id}
              onClick={() => onOpenPost(post)}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <img src={post.image?.url || 'https://picsum.photos/300'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs uppercase font-black text-blue-800">{post.category}</span>
                <h4 className="font-black text-base mt-0.5 line-clamp-2">{post.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{relTime(post.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPostsSection;
