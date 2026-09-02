// import { Search, LogOut, X } from 'lucide-react';

// const FeedHeader = ({
//   isAdmin,
//   searchQuery,
//   setSearchQuery,
//   setActiveMenu,
//   setActiveCategory,
//   logout,
// }) => {
//   return (
//     <>
//       {isAdmin && (
//         <div className="sticky top-0 z-80 bg-blue-900 text-white px-6 py-2 text-xs font-bold flex items-center justify-between">
//           <span className="flex items-center gap-2">
//             <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
//             Admin Session Active
//           </span>
//           <a href="/admin" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition">
//             Dashboard
//           </a>
//         </div>
//       )}

//       <header className={`sticky z-50 bg-white border-b border-slate-200 shadow-sm ${isAdmin ? 'top-36px' : 'top-0'}`}>
//         <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
//           <div
//             className="flex items-center gap-3 cursor-pointer shrink-0"
//             onClick={() => {
//               setActiveMenu('feed');
//               setActiveCategory('Recommended');
//               setSearchQuery('');
//             }}
//           >
//             <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow">
//               N
//             </div>
//             <div>
//               <h1 className="text-lg font-black tracking-tight text-blue-900 leading-none">
//                 NUESA<span className="text-slate-800">IO</span>
//               </h1>
//               <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
//                 Campus News Feed
//               </p>
//             </div>
//           </div>

//           <div className="hidden sm:block relative w-full max-w-md">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               placeholder="Search news..."
//               onChange={(e) => {
//                 setSearchQuery(e.target.value);
//                 setActiveMenu('feed');
//               }}
//               className="w-full bg-slate-100 rounded-full pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800"
//             />
//             {searchQuery && (
//               <button
//                 onClick={() => setSearchQuery('')}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//               >
//                 <X size={13} />
//               </button>
//             )}
//           </div>

//           <button
//             onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
//             className="p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition shrink-0"
//           >
//             <LogOut size={17} />
//           </button>
//         </div>
//       </header>

//       <div className="sm:hidden px-4 pt-3">
//         <div className="relative">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             value={searchQuery}
//             placeholder="Search news..."
//             onChange={(e) => {
//               setSearchQuery(e.target.value);
//               setActiveMenu('feed');
//             }}
//             className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none"
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// export default FeedHeader;


import {
  Search,
  LogOut,
  X,
} from 'lucide-react';

import { motion } from 'framer-motion';

const FeedHeader = ({
  isAdmin,
  searchQuery,
  setSearchQuery,
  setActiveMenu,
  setActiveCategory,
  logout,
}) => {

  const handleHome = () => {
    setActiveMenu('feed');
    setActiveCategory('Recommended');
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};

  return (
    <>
      {/* =========================
          ADMIN BAR
      ========================= */}

      {isAdmin && (
        <div
          className="
            sticky
            top-0
            z-[100]
            bg-[var(--nuesa-blue-900)]
            text-white
          "
        >
          <div
            className="
              max-w-7xl
              mx-auto
              px-4
              sm:px-6
              py-2
              flex
              items-center
              justify-between
              text-xs
              font-semibold
            "
          >

            <span className="flex items-center gap-2">
              <span
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-emerald-400
                  animate-pulse
                "
              />

              Admin session active
            </span>

            <a
              href="/admin"
              className="
                px-3
                py-1
                rounded-full
                bg-white/10
                hover:bg-white/20
                transition
              "
            >
              Dashboard
            </a>

          </div>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <header
        className={`
          sticky
          z-[90]
          bg-white/90
          backdrop-blur-xl
          border-b
          border-slate-200/80
          ${
            isAdmin
              ? 'top-[32px]'
              : 'top-0'
          }
        `}
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            h-[68px]
            flex
            items-center
            justify-between
            gap-6
          "
        >

          {/* =========================
              BRAND
          ========================= */}

          <motion.button
            type="button"
            onClick={handleHome}
            whileTap={{
              scale: 0.97,
            }}
            className="
              flex
              items-center
              gap-3
              shrink-0
              text-left
            "
          >

            <div
              className="
                w-10
                h-10
                sm:w-11
                sm:h-11
                rounded-2xl
                bg-[var(--nuesa-primary)]
                text-white
                flex
                items-center
                justify-center
                shadow-lg
                shadow-blue-800/20
              "
            >
              <span className="font-black text-lg">
                N
              </span>
            </div>

            <div className="block">

              <div className="flex items-baseline gap-1">

                <span
                  className="
                    text-lg
                    font-black
                    tracking-tight
                    text-[var(--nuesa-ink)]
                  "
                >
                 NUESA
                </span>

                <span
                  className="
                    text-lg
                    font-black
                    tracking-tight
                    text-[var(--nuesa-primary)]
                  "
                >
                  PRESS
                </span>

              </div>

              {/* <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                  font-bold
                "
              >
                Faculty News
              </p> */}

            </div>

          </motion.button>


          {/* =========================
              DESKTOP NAV
          ========================= */}

          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-7
            "
          >

            <button
              type="button"
              onClick={handleHome}
              className="
                text-sm
                font-bold
                text-slate-700
                hover:text-[var(--nuesa-primary)]
                transition
              "
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu('explore')}
              className="
                text-sm
                font-bold
                text-slate-500
                hover:text-[var(--nuesa-primary)]
                transition
              "
            >
              Explore
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu('saved')}
              className="
                text-sm
                font-bold
                text-slate-500
                hover:text-[var(--nuesa-primary)]
                transition
              "
            >
              Saved
            </button>

          </nav>


          {/* =========================
              SEARCH
          ========================= */}

          <div
            className="
              hidden
              sm:block
              relative
              w-full
              max-w-sm
            "
          >

            <Search
              size={17}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={searchQuery}
              placeholder="Search stories..."
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMenu('feed');
              }}
               onKeyDown={handleSearchKeyDown}
              className="
                w-full
                bg-slate-100/80
                border
                border-transparent
                rounded-full
                pl-11
                pr-10
                py-2.5
                text-sm
                font-medium
                text-slate-800
                placeholder:text-slate-400
                outline-none
                transition
                focus:bg-white
                focus:border-blue-200
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  p-1
                  text-slate-400
                  hover:text-slate-700
                "
              >
                <X size={14} />
              </button>
            )}

          </div>


          {/* =========================
              LOGOUT
              ========================= */}

          <button
            type="button"
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo:
                    window.location.origin,
                },
              })
            }
            className="
              p-2.5
              rounded-full
              bg-slate-100
              text-slate-500
              hover:bg-red-50
              hover:text-red-500
              transition
              shrink-0
            "
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>

        </div>

      </header>


      {/* =========================
          MOBILE SEARCH
      ========================= */}

      <div className="sm:hidden px-4 pt-3">

        <form onSubmit={(e) => e.preventDefault()} className="relative">

          <Search
            size={16}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
             type="text"
              value={searchQuery}
              placeholder="Search stories..."
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMenu('feed');
              }}

            className="
              w-full
              bg-white
              border
              border-slate-200
              rounded-2xl
              pl-11
              pr-4
              py-3
              text-sm
              outline-none
              focus:border-blue-300
              focus:ring-4
              focus:ring-blue-500/10
            "
          />

        </form>

      </div>
    </>
  );
};

export default FeedHeader;