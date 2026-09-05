
import React, { useMemo } from 'react';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Custom Clipboard Module
const Clipboard = Quill.import('modules/clipboard');
class PlainClipboard extends Clipboard {
  onPaste(range, context) {
    try {
      super.onPaste(range, context);
    } catch (err) {
      console.error('Quill paste error caught:', err);
    }
  }
}
Quill.register('modules/clipboard', PlainClipboard, true);

const ArticleDrawer = ({
  isOpen,
  editingPost,
  onClose,
  formData,
  setFormData,
  onPublish,
  isPublishing,
  previewUrl,
  setSelectedFile,
  onClearDraft,
  categories,
}) => {
  // Memoize modules inside the component to prevent toolbar tearing on paste/re-render
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleClearDraft = () => {
    if (onClearDraft) {
      onClearDraft();
      return;
    }

    if (window.confirm('Clear all text and start over?')) {
      const emptyForm = {
        title: '',
        category: '',
        keywords: '',
        content: '',
      };
      setFormData(emptyForm);
      localStorage.removeItem('nuesa_article_draft');
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <section className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {editingPost ? 'Edit Article' : 'New Article'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">Your progress is automatically saved locally.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Article Title</label>
            <input
              type="text"
              className="w-full text-2xl font-bold border-none focus:ring-0 p-0 placeholder:text-black-200 outline-none required"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. NUESA Tech Week"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <select
              className="bg-slate-50 border-none rounded-xl p-3 font-semibold text-sm"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              className="bg-slate-50 border-none rounded-xl p-3 font-semibold text-sm required"
              placeholder="Keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Feature Image</label>
            <label className="border-2 border-dashed border-slate-200 rounded-[2rem] block text-center cursor-pointer hover:border-blue-400 bg-slate-50/50 transition-all">
              <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
              {previewUrl ? (
                <img src={previewUrl} className="h-48 w-full object-cover rounded" alt="Preview" />
              ) : (
                <div className="space-y-3 p-6">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto text-blue-600">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-slate-500 font-bold text-[12px] uppercase tracking-wider">Select Header Image</p>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-2 pb-12">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Article Story</label>
            
            {/* Added CSS scoped styling container */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-100 [&_.ql-container]:border-none [&_.ql-container]:h-64">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                modules={quillModules}
              />
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-white flex gap-4">
          <button
            onClick={handleClearDraft}
            className="px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} /> Clear
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : editingPost ? (
              'Save Changes'
            ) : (
              'Publish Article'
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ArticleDrawer;