import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const SetNameModal = ({ open, onSubmit, submitting }) => {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[300] bg-blue-950/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-blue-800 px-6 py-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-3">
            <Sparkles size={24} className="text-white" />
          </div>
          <h2 className="text-white font-black text-lg">
            What should we call you?
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            This is the name readers will see on your posts and comments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={`
                w-full
                bg-white
                border
                rounded-2xl
                px-4
                py-3
                text-sm
                font-medium
                text-slate-800
                outline-none
                transition
                focus:ring-4
                focus:ring-blue-500/10
                ${touched && !name.trim() ? 'border-red-300' : 'border-slate-200 focus:border-blue-400'}
              `}
            />
            {touched && !name.trim() && (
              <p className="text-red-700 text-xs mt-1.5 font-medium">
                Please enter a name.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="
              w-full
              bg-blue-600
              text-white
              font-bold
              text-sm
              rounded-full
              py-3
              transition
              hover:bg-blue-700
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SetNameModal;