import { Search, LogOut, X } from 'lucide-react';

const FeedHeader = ({
  isAdmin,
  searchQuery,
  setSearchQuery,
  setActiveMenu,
  setActiveCategory,
  logout,
}) => {
  return (
    <>
      {isAdmin && (
        <div className="sticky top-0 z-80 bg-blue-900 text-white px-6 py-2 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Admin Session Active
          </span>
          <a href="/admin" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition">
            Dashboard
          </a>
        </div>
      )}

      <header className={`sticky z-50 bg-white border-b border-slate-200 shadow-sm ${isAdmin ? 'top-36px' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => {
              setActiveMenu('feed');
              setActiveCategory('Recommended');
              setSearchQuery('');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow">
              N
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-blue-900 leading-none">
                NUESA<span className="text-slate-800">IO</span>
              </h1>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                Campus News Feed
              </p>
            </div>
          </div>

          <div className="hidden sm:block relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search news..."
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMenu('feed');
              }}
              className="w-full bg-slate-100 rounded-full pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition shrink-0"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="sm:hidden px-4 pt-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            placeholder="Search news..."
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveMenu('feed');
            }}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none"
          />
        </div>
      </div>
    </>
  );
};

export default FeedHeader;
