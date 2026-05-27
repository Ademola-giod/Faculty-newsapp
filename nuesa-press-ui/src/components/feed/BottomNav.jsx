// import React from 'react';
// import { Home as HomeIcon, Compass, Bookmark, User } from 'lucide-react';

// const BottomNav = () => {
//   return (
//     <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex items-center gap-10 border border-slate-200/50 z-50">
//       <button className="text-blue-600"><HomeIcon size={24}/></button>
//       <button className="text-slate-300 hover:text-blue-500 transition"><Compass size={24}/></button>
//       <button className="text-slate-300 hover:text-blue-500 transition"><Bookmark size={24}/></button>
//       <button className="text-slate-300 hover:text-blue-500 transition"><User size={24}/></button>
//     </nav>
//   );
// };

// export default BottomNav;

import {
  Home,
  Compass,
  Bookmark,
  // User
} from 'lucide-react';

const BottomNav = ({ activeMenu, setActiveMenu }) => {

  const navItems = [
    { key: 'feed', icon: Home },
    { key: 'explore', icon: Compass },
    { key: 'saved', icon: Bookmark },
    // { key: 'profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full px-4 py-3 flex items-center gap-3 z-50">

      {navItems.map((item) => {
        const Icon = item.icon;

        const active = activeMenu === item.key;

        return (
          <button
            key={item.key}
            onClick={() => setActiveMenu(item.key)}
            className={`p-3 rounded-full transition-all duration-200 ${
              active
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <Icon size={21} />
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;