import { Layers, Bookmark } from 'lucide-react';

export const EmptyFeedState = ({ title, message }) => (
  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
    <Layers size={20} className="text-slate-300 mx-auto mb-3" />
    <h3 className="font-black text-base mb-1">{title}</h3>
    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

export const EmptySavedState = () => (
  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
    <Bookmark size={28} className="text-slate-300 mx-auto mb-3" />
    <p className="text-sm text-slate-500">No saved posts yet.</p>
  </div>
);
