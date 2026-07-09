


import { useAuth0 } from '@auth0/auth0-react';
import { Compass, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ADMIN_EMAILS } from '../utils/adminList';
import BottomNav from '../components/feed/BottomNav';
import FeedHeader from '../components/feed/FeedHeader';
import FeedCategories from '../components/feed/FeedCategories';
import { EmptyFeedState } from '../components/feed/EmptyState';
import FeedPostCard from '../components/feed/FeedPostCard';
import FeedHero from '../components/feed/FeedHero';
import ExploreSection from '../components/feed/ExploreSection';
import SavedPostsSection from '../components/feed/SavedPostsSection';
import { useFeedPosts } from '../hooks/useFeedPosts';

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const { logout, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const {
    loading,
    error,
    activeCategory,
    setActiveCategory,
    activeMenu,
    setActiveMenu,
    searchQuery,
    setSearchQuery,
    likedPosts,
    filteredPosts,
    bookmarkedPosts,
    likeCounts,
    categories,
    fetchPosts,
    toggleLike,
    toggleBookmark,
    sharePost,
    relTime,
    showHero,
    heroPost,
    gridPosts,
    posts
  } = useFeedPosts({ getAccessTokenSilently });

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const handleOpenPost = (post) => navigate(`/post/${post._id}`);

  // ─── loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-semibold">Loading news feed…</p>
    </div>
  );

  // ─── FIXED: error state instead of blank screen ──────────────────────────────
  if (error) return (
    <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Layers size={32} className="text-slate-300" />
      <h2 className="text-lg font-black text-slate-800">Failed to load posts</h2>
      <p className="text-sm text-slate-500">{error}</p>
      <button
        onClick={fetchPosts}
        className="mt-2 bg-blue-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-950 transition"
      >
        Try again
      </button>
    </div>
  );

  // ─── main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-100 min-h-screen pb-32 text-slate-900">
      <FeedHeader
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setActiveMenu={setActiveMenu}
        setActiveCategory={setActiveCategory}
        logout={logout}
      />

      {/* ── FEED ────────────────────────────────────────────────────────────── */}
      {activeMenu === 'feed' && (
        <>
          <FeedCategories
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          <main className="max-w-6xl mx-auto px-4 space-y-6">
            <FeedHero heroPost={heroPost} onExpand={handleOpenPost} relTime={relTime} />

            <h3 className="text-base font-black text-slate-800">
              {searchQuery ? `Results (${filteredPosts.length})` : activeCategory === 'Recommended' ? 'Latest updates' : activeCategory}
            </h3>

            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                {gridPosts.map((post) => (
                  <FeedPostCard
                    key={post._id}
                    post={post}
                    onExpand={handleOpenPost}
                    onLike={toggleLike}
                    onShare={sharePost}
                    onBookmark={toggleBookmark}
                    likedPosts={likedPosts}
                    bookmarkedPosts={bookmarkedPosts}
                    likeCounts={likeCounts}
                  />
                ))}
              </div>
            ) : (
              <EmptyFeedState
                title="No posts found"
                message="Try another search or category."
              />
            )}
          </main>
        </>
      )}

      {/* ── EXPLORE ───────────────────────────────────────────────────────── */}
      {activeMenu === 'explore' && (
        <ExploreSection
          categories={categories}
          posts={posts}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setActiveMenu('feed');
          }}
        />
      )}

      {/* ── SAVED ─────────────────────────────────────────────────────────── */}
      {activeMenu === 'saved' && (
        <SavedPostsSection
          bookmarkedPosts={bookmarkedPosts}
          posts={posts}
          onOpenPost={handleOpenPost}
          relTime={relTime}
        />
      )}

      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

    </div>
  );
};

export default Home;