import { useAuth0 } from '@auth0/auth0-react';
import { Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import BottomNav from '../components/feed/BottomNav';
import FeedHeader from '../components/feed/FeedHeader';
import FeedCategories from '../components/feed/FeedCategories';
import { EmptyFeedState } from '../components/feed/EmptyState';
import FeedPostCard from '../components/feed/FeedPostCard';
import FeedHero from '../components/feed/FeedHero';
import ExploreSection from '../components/feed/ExploreSection';
import SavedPostsSection from '../components/feed/SavedPostsSection';

import { useFeedPosts } from '../hooks/useFeedPosts';

const Home = ({ backendUser }) => {
  const {
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();

  const {
    loading,
    loadingMore,
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
    loadMore,
    hasMore,

    toggleLike,
    toggleBookmark,
    sharePost,

    relTime,

    showHero,
    heroPost,
    featuredPosts,

    gridPosts,
    posts,
  } = useFeedPosts({
    getAccessTokenSilently,
  });

  const isAdmin =
    backendUser?.role === 'ADMIN' ||
    backendUser?.role === 'SUPER_ADMIN';

  const handleOpenPost = (post) => {
    navigate(`/post/${post._id}`);
  };

  /* ============================
     LOADING
     ============================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold text-slate-500"
        >
          Loading NUESA Press...
        </motion.p>
      </div>
    );
  }

  /* ============================
     ERROR
     ============================ */

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center px-6 text-center">
        <Layers
          size={38}
          className="text-slate-300 mb-4"
        />

        <h2 className="text-xl font-black text-slate-800">
          Failed to load stories
        </h2>

        <p className="mt-2 text-sm text-slate-500 max-w-md">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchPosts}
          className="mt-5 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="nuesa-page min-h-screen pb-32 text-slate-900">

      {/* ============================
          HEADER
          ============================ */}

      <FeedHeader
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setActiveMenu={setActiveMenu}
        setActiveCategory={setActiveCategory}
        logout={logout}
      />

      {/* ============================
          FEED
          ============================ */}

      {activeMenu === 'feed' && (
        <>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* ==========================
                HERO
                ========================== */}

            {showHero && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-4 sm:mt-6 lg:mt-8 mb-10"
              >

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                      Breaking News
                    </p>

                    <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                      Stories that matter
                    </h1>
                  </div>

                  <button
                    type="button"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    View more
                  </button>
                </div>

                <FeedHero
                  heroPost={heroPost}
                  featuredPosts={featuredPosts}
                  onExpand={handleOpenPost}
                  relTime={relTime}
                />

                <FeedCategories
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />

              </motion.section>
            )}

            {/* ==========================
                NEWSROOM HEADER
                ========================== */}

            <motion.section
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.15,
                duration: 0.5,
              }}
              className="mb-5"
            >

              <div className="flex items-end justify-between gap-4">

                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-black text-slate-400">
                    {searchQuery ? 'Search' : 'Newsroom'}
                  </p>

                  <h2 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                    {searchQuery
                      ? `Results for "${searchQuery}"`
                      : activeCategory === 'Recommended'
                        ? 'Latest updates'
                        : activeCategory}
                  </h2>
                </div>

                <span className="hidden sm:block text-xs font-bold text-slate-400">
                  {filteredPosts.length} stories
                </span>

              </div>

            </motion.section>

            {/* ==========================
                POSTS
                ========================== */}

            {gridPosts.length > 0 ? (
              <motion.div
                layout
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-4
                  sm:gap-5
                  lg:gap-6
                "
              >

                {gridPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: Math.min(index * 0.05, 0.35),
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >

                    <FeedPostCard
                      post={post}
                      onExpand={handleOpenPost}
                      onLike={toggleLike}
                      onShare={sharePost}
                      onBookmark={toggleBookmark}
                      likedPosts={likedPosts}
                      bookmarkedPosts={bookmarkedPosts}
                      likeCounts={likeCounts}
                    />

                  </motion.div>
                ))}

              </motion.div>
            ) : (
              <EmptyFeedState
                title="No stories found"
                message="Try another search or category."
              />
            )}

            {/* ==========================
                LOAD MORE
                ========================== */}

            {hasMore && gridPosts.length > 0 && (
              <div className="flex justify-center py-10">

                <motion.button
                  whileTap={{
                    scale: 0.96,
                  }}
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="
                    rounded-full
                    bg-white
                    border border-slate-200
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                    shadow-sm
                    hover:border-blue-300
                    hover:text-blue-600
                    transition
                    disabled:opacity-50
                  "
                >
                  {loadingMore
                    ? 'Loading stories...'
                    : 'Load more stories'}
                </motion.button>

              </div>
            )}

          </main>
        </>
      )}

      {/* ============================
          EXPLORE
          ============================ */}

      {activeMenu === 'explore' && (
        <ExploreSection
          categories={categories}
          posts={posts}
          onSelectCategory={(category) => {
            setActiveCategory(category);
            setActiveMenu('feed');
          }}
        />
      )}

      {/* ============================
          SAVED
          ============================ */}

      {activeMenu === 'saved' && (
        <SavedPostsSection
          bookmarkedPosts={bookmarkedPosts}
          posts={posts}
          onOpenPost={handleOpenPost}
          relTime={relTime}
        />
      )}

      <BottomNav
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

    </div>
  );
};

export default Home;

// import { useAuth0 } from '@auth0/auth0-react';
// import { Compass, Layers } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// import BottomNav from '../components/feed/BottomNav';
// import FeedHeader from '../components/feed/FeedHeader';
// import FeedCategories from '../components/feed/FeedCategories';
// import { EmptyFeedState } from '../components/feed/EmptyState';
// import FeedPostCard from '../components/feed/FeedPostCard';
// import FeedHero from '../components/feed/FeedHero';
// import ExploreSection from '../components/feed/ExploreSection';
// import SavedPostsSection from '../components/feed/SavedPostsSection';
// import { useFeedPosts } from '../hooks/useFeedPosts';




// const Home = ({backendUser}) => {
//   const { logout, user, getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   // const categories = DEFAULT_CATEGORIES;

//   const {
//     loading,
//     loadingMore,
//     error,
//     activeCategory,
//     setActiveCategory,
//     activeMenu,
//     setActiveMenu,
//     searchQuery,
//     setSearchQuery,
//     likedPosts,
//     filteredPosts,
//     bookmarkedPosts,
//     likeCounts,
//     categories,
//     fetchPosts,
//     loadMore,
//     hasMore,
//     toggleLike,
//     toggleBookmark,
//     sharePost,
//     relTime,
//     showHero,
//     heroPost,
//     featuredPosts,
//     gridPosts,
//     posts
//   } = useFeedPosts({ getAccessTokenSilently });


  


//     const isAdmin =
//       backendUser?.role === 'ADMIN' ||
//       backendUser?.role === 'SUPER_ADMIN';
  
//   const handleOpenPost = (post) => navigate(`/post/${post._id}`);
  

//   // ─── loading 
//   if (loading) return (
//     <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
//       <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
//       <p className="text-sm text-slate-500 font-semibold">Loading news feed…</p>
//     </div>
//   );

//   // ─── FIXED: error state instead of blank screen ──────────────────────────────
//   if (error) return (
//     <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
//       <Layers size={32} className="text-slate-300" />
//       <h2 className="text-lg font-black text-slate-800">Failed to load posts</h2>
//       <p className="text-sm text-slate-500">{error}</p>
//       <button
//         onClick={fetchPosts}
//         className="mt-2 bg-blue-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-950 transition"
//       >
//         Try again
//       </button>
//     </div>
//   );

//   // main
//   return (
//     <div className="bg-slate-100 min-h-screen pb-32 text-slate-900">
//       <FeedHeader
//         isAdmin={isAdmin}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         setActiveMenu={setActiveMenu}
//         setActiveCategory={setActiveCategory}
//         logout={logout}
//       />

//       {/*  FEED  */}
//       {activeMenu === 'feed' && (
//         <>
//           <FeedCategories
//             categories={categories}
//             activeCategory={activeCategory}
//             setActiveCategory={setActiveCategory}
//           />

//           <main className="max-w-6xl mx-auto px-4 space-y-6">
//             <FeedHero
//               heroPost={heroPost}
//               featuredPosts={featuredPosts}
//               onExpand={handleOpenPost}
//               relTime={relTime}
//             />

//             <h3 className="text-base font-black text-slate-800">
//               {searchQuery ? `Results (${filteredPosts.length})` : activeCategory === 'Recommended' ? 'Latest updates' : activeCategory}
//             </h3>

//             {gridPosts.length > 0 ? (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
//                   {gridPosts.map((post) => (
//                     <FeedPostCard
//                       key={post._id}
//                       post={post}
//                       onExpand={handleOpenPost}
//                       onLike={toggleLike}
//                       onShare={sharePost}
//                       onBookmark={toggleBookmark}
//                       likedPosts={likedPosts}
//                       bookmarkedPosts={bookmarkedPosts}
//                       likeCounts={likeCounts}
//                     />
//                   ))}
//                 </div>

//                 {hasMore && (
//                   <div className="flex justify-center pb-4">
//                     <button
//                       onClick={loadMore}
//                       disabled={loadingMore}
//                       className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loadingMore ? 'Loading…' : 'Load more'}
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <EmptyFeedState
//                 title="No posts found"
//                 message="Try another search or category."
//               />
//             )}
//           </main>
//         </>
//       )}

//       {/*  EXPLORE  */}
//       {activeMenu === 'explore' && (
//         <ExploreSection
//           categories={categories}
//           posts={posts}
//           onSelectCategory={(cat) => {
//             setActiveCategory(cat);
//             setActiveMenu('feed');
//           }}
//         />
//       )}

//       {/*  SAVED  */}
//       {activeMenu === 'saved' && (
//         <SavedPostsSection
//           bookmarkedPosts={bookmarkedPosts}
//           posts={posts}
//           onOpenPost={handleOpenPost}
//           relTime={relTime}
//         />
//       )}

//       <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

//     </div>
//   );
// };

// export default Home;