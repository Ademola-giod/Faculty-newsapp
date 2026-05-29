import { Users, Lock, Sparkles } from 'lucide-react';

const StudentDirectory = () => {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-700">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
          <Users size={40} className="text-blue-200" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center">
          <Lock size={14} className="text-amber-500" />
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Management</h3>
      <p className="text-slate-500 max-w-sm mt-2 font-medium">
        We're building a hub to manage Faculty of Education students, track engagement, and handle moderations.
      </p>

      <div className="mt-8 flex gap-3">
        <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200">
          <Sparkles size={14} /> Coming in V2.0
        </span>
      </div>

      {/* Feature Teaser List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
        {['Verified Directory', 'User Analytics', 'Ban/Restrict Hub'].map((feature) => (
          <div key={feature} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm italic text-slate-400 text-xs font-bold">
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDirectory;