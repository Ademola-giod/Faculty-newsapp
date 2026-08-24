

// import {
//   Home,
//   Compass,
//   Bookmark,
//   // User
// } from 'lucide-react';

// const BottomNav = ({ activeMenu, setActiveMenu }) => {

//   const navItems = [
//     { key: 'feed', icon: Home },
//     { key: 'explore', icon: Compass },
//     { key: 'saved', icon: Bookmark },
//     // { key: 'profile', icon: User }
//   ];

//   return (
//     <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full px-4 py-3 flex items-center gap-3 z-50">

//       {navItems.map((item) => {
//         const Icon = item.icon;

//         const active = activeMenu === item.key;

//         return (
//           <button
//             key={item.key}
//             onClick={() => setActiveMenu(item.key)}
//             className={`p-3 rounded-full transition-all duration-200 ${
//               active
//                 ? 'bg-blue-600 text-white shadow-lg scale-105'
//                 : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
//             }`}
//           >
//             <Icon size={21} />
//           </button>
//         );
//       })}
//     </nav>
//   );
// };

// export default BottomNav;


import {
  Home,
  Compass,
  Bookmark,
} from 'lucide-react';

import { motion } from 'framer-motion';

const BottomNav = ({
  activeMenu,
  setActiveMenu,
}) => {

  const navItems = [
    {
      key: 'feed',
      label: 'Home',
      icon: Home,
    },
    {
      key: 'explore',
      label: 'Explore',
      icon: Compass,
    },
    {
      key: 'saved',
      label: 'Saved',
      icon: Bookmark,
    },
  ];

  return (
    <motion.nav
      initial={{
        opacity: 0,
        y: 30,
        x: '-50%',
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: '-50%',
      }}
      transition={{
        duration: 0.5,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        fixed
        bottom-4
        sm:bottom-5
        left-1/2
        z-[9999]

        flex
        items-center
        gap-1

        rounded-full

        bg-white/95
        backdrop-blur-2xl

        border
        border-slate-200/80

        shadow-[0_15px_45px_rgba(15,23,42,0.16)]

        px-2
        py-2

        sm:px-3
        sm:py-2.5

        md:hidden
      "
      style={{
        paddingBottom:
          'calc(0.5rem + env(safe-area-inset-bottom))',
      }}
    >

      {navItems.map((item) => {

        const Icon = item.icon;
        const active = activeMenu === item.key;

        return (
          <motion.button
            key={item.key}
            type="button"
            onClick={() =>
              setActiveMenu(item.key)
            }
            whileTap={{
              scale: 0.9,
            }}
            className={`
              relative
              flex
              items-center
              justify-center
              gap-2

              rounded-full

              transition-all
              duration-300

              ${
                active
                  ? `
                    bg-[var(--nuesa-primary)]
                    text-white
                    px-5
                    py-3
                    shadow-lg
                    shadow-blue-600/25
                  `
                  : `
                    text-slate-400
                    px-4
                    py-3
                    hover:text-[var(--nuesa-primary)]
                    hover:bg-slate-100
                  `
              }
            `}
          >

            <Icon
              size={20}
              strokeWidth={active ? 2.4 : 2}
            />

            {active && (
              <motion.span
                layoutId="bottom-nav-label"
                initial={{
                  opacity: 0,
                  width: 0,
                }}
                animate={{
                  opacity: 1,
                  width: 'auto',
                }}
                className="
                  text-xs
                  font-black
                  whitespace-nowrap
                "
              >
                {item.label}
              </motion.span>
            )}

          </motion.button>
        );
      })}

    </motion.nav>
  );
};

export default BottomNav;