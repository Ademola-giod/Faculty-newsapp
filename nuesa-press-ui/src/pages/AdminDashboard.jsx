import  { useState, useEffect } from 'react';
import axios from 'axios';
// import API from '../api/api';
import { useAuth0 } from '@auth0/auth0-react';
import { getTokenWithFallback } from '../utils/authHelpers';
import { LayoutDashboard, FileText, BarChart3, Users, LogOut, Plus, X, Menu } from 'lucide-react';
import { toast } from 'react-toastify';

// Modular components
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ManagePosts from '../components/dashboard/ManagePosts';
import AnalyticsView from '../components/dashboard/AnalyticsView';
import ArticleDrawer from '../components/dashboard/ArticleDrawer';
import StudentDirectory from '../components/dashboard/StudentDirectory';
import Home from './Home';

// import { DEFAULT_CATEGORIES } from '../utils/category'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


const createEmptyFormData = () => ({ title: '',
category: '', 
keywords: '', 
content: '' });


const getSavedDraft = () => {
  if (typeof window === 'undefined') return createEmptyFormData();

  try {
    const savedDraft = localStorage.getItem('nuesa_article_draft');
    if (!savedDraft) return createEmptyFormData();

    const parsed = JSON.parse(savedDraft);
    return { ...createEmptyFormData(), ...parsed };
  } catch (error) {
    console.error('Error reading saved draft:', error);
    return createEmptyFormData();
  }
};

const dataUrlToFile = (dataUrl, filename = 'draft-image.png') => {
  if (!dataUrl) return null;

  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

// console.log("ENV:", import.meta.env.VITE_BACKEND_URL);
// console.log("API_BASE_URL:", API_BASE_URL);

const AdminDashboard = ({ backendUser }) => {
  const { logout, getAccessTokenSilently, loginWithPopup, loginWithRedirect } = useAuth0();
  
  // --- 1. HOISTED STATE DECLARATIONS AT THE ABSOLUTE TOP ---
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  
  


  // File upload and image previews states
  const [selectedFile, setSelectedFile] = useState(() => {
    const savedDraft = getSavedDraft();
    if (savedDraft?.imageDataUrl) {
      return dataUrlToFile(savedDraft.imageDataUrl, savedDraft.imageName || 'draft-image.png');
    }
    return null;
  });
  const [previewUrl, setPreviewUrl] = useState(() => {
    const savedDraft = getSavedDraft();
    return savedDraft?.imageDataUrl || null;
  });
  const [draftImageDataUrl, setDraftImageDataUrl] = useState(() => {
    const savedDraft = getSavedDraft();
    return savedDraft?.imageDataUrl || null;
  });
  
  // Live database communication data states
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);  //checking ..
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);

  // category

  const [ categories, setCategories] = useState([])


  // Draft persistence initializer state
  const [formData, setFormData] = useState(() => {
    const savedDraft = getSavedDraft();
    return { ...createEmptyFormData(), ...savedDraft };
  });

  //
  const [editingPost, setEditingPost] = useState(null);

  // --- 2. RUN LIFECYCLE HOOKS SECURELY ---
  
  // Fetch data rows from Express MongoDB cluster API
  const fetchPosts = async ({ pageNumber = 1, append = false, search = '' } = {}) => {
    try {
      if (append) {
        setLoadingMorePosts(true);
      } else {
        setLoading(true);
      }

      const params = {
        page: pageNumber,
        limit: 20
      };

      if (search) {
        params.search = search;
      }

      const token = await getTokenWithFallback({
        getAccessTokenSilently,
        loginWithPopup,
        loginWithRedirect,
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access'
        }
      });

      const res = await axios.get(`${API_BASE_URL}/api/posts/admin`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = res.data || {};

      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts || []));
      setPage(data.page || pageNumber);
      setHasMorePosts(Boolean(data.hasMore));
    } catch (err) {
      console.error("Error fetching admin posts from backend:", err);
    } finally {
      setLoading(false);
      setLoadingMorePosts(false);
    }
  };


    const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);

      setCategories(res.data.map(category => category.name));
    } catch (err) {
      console.error(err);
    }
  };

    const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setDraftImageDataUrl(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setDraftImageDataUrl(typeof dataUrl === 'string' ? dataUrl : null);
    };
    reader.onerror = () => {
      setDraftImageDataUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const clearDraft = () => {
    if (window.confirm('Clear all text and start over?')) {
      setFormData(createEmptyFormData());
      setSelectedFile(null);
      setPreviewUrl(null);
      setDraftImageDataUrl(null);
      localStorage.removeItem('nuesa_article_draft');
    }
  };

  // handle category function

  // const handleAddCategory = () => {
  // const value = newCategory.trim();

  // if (!value) return;

  // // prevent duplicates
  // const exists = categories.some(
  //   c => c.toLowerCase() === value.toLowerCase()
  // );

  // if (exists) {
  //   alert('Category already exists');
  //   return;
  // }

  //   setCategories([...categories, value]);
  //   setNewCategory('');
  // };


  // --- 3. SECURE AUTHENTICATED PUBLISH DISPATCHER ---

  const handlePublish = async () => {

    setIsPublishing(true);n 

  const data = new FormData();

  data.append('title', formData.title);
  data.append('category', formData.category);
  data.append('content', formData.content);
  data.append('keywords', formData.keywords || '');

  // Only send image if admin selected a NEW image
  if (selectedFile) {
    data.append('image', selectedFile);
  }

  try {
    const token = await getTokenWithFallback({
      getAccessTokenSilently,
      loginWithPopup,
      loginWithRedirect,
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access'
      }
    });

    let res;

    // ==========================================
    // EDIT EXISTING POST
    // ==========================================
    if (editingPost?._id) {
      res = await axios.put(
        `${API_BASE_URL}/api/posts/${editingPost._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedPost = res.data?.post;

      if (updatedPost) {
        // Replace the OLD post with the UPDATED post
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === updatedPost._id
              ? updatedPost
              : post
          )
        );
      }

      toast.success('Article updated successfully!');

    } else {

      // CREATE NEW POST
      res = await axios.post(
        `${API_BASE_URL}/api/posts`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.status === 201) {
        toast.success('News is LIVE!');
      }
    }

    // RESET FORM

    setIsDrawerOpen(false);

    setFormData(createEmptyFormData());

    setEditingPost(null);

    setSelectedFile(null);

    setPreviewUrl(null);

    setDraftImageDataUrl(null);

    localStorage.removeItem('nuesa_article_draft');

    // Refresh the first page to keep pagination/search consistent
    await fetchPosts({
      pageNumber: 1,
      append: false,
      search: searchTerm
    });

  } catch (err) {
    console.error(
      'Post save/update error:',
      err.response?.data || err
    );

    toast.error(
      err.response?.data?.message ||
      'Something went wrong while saving the article.'
    );
  }
  };

  // const handlePublish = async () => {
  //   const data = new FormData();
  //   data.append('title', formData.title);
  //   data.append('category', formData.category);
  //   data.append('content', formData.content);
  //   data.append('keywords', formData.keywords);
  //   if (selectedFile) data.append('image', selectedFile);

  //   try {
  //     console.log("Step 1: About to request token...");
  //     const token = await getTokenWithFallback({
  //       getAccessTokenSilently,
  //       loginWithPopup,
  //       loginWithRedirect,
  //       authorizationParams: {
  //         audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  //         scope: 'openid profile email offline_access'
  //       }
  //     });

  //     console.log("Step 2: Token received:", token);

  //     console.log("step 3: sending to backend..")

      
  //     const res = await axios.post(`${API_BASE_URL}/api/posts`, data, {
  //       headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
  //     });
  //     if (res.status === 201) {
  //       alert("News is LIVE!");
  //       setIsDrawerOpen(false);
  //       setFormData(createEmptyFormData());
  //       setSelectedFile(null);
  //       setPreviewUrl(null);
  //       setDraftImageDataUrl(null);
  //       localStorage.removeItem('nuesa_article_draft');
  //       fetchPosts(); 
  //     }
  //   } catch (err) {
  //     console.error("Publishing token routing error breakdown:", err);
  //     alert("Verification issue. Please authenticate your security rules.");
  //   }
  // };


    const handleDelete = async (postId) => {
    if (!postId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this article? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const token = await getTokenWithFallback({
        getAccessTokenSilently,
        loginWithPopup,
        loginWithRedirect,
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access'
        }
      });

      await axios.delete(
        `${API_BASE_URL}/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Remove it immediately from the frontend
      setPosts(prevPosts =>
        prevPosts.filter(post => post._id !== postId)
      );

      toast.success('Article deleted successfully!');

    } catch (err) {
      console.error(
        'Delete post error:',
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        'Failed to delete article.'
      );
    }
  };


  //menu items for sidebar navigation
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { name: 'Manage Posts', icon: <FileText size={18}/> },
    { name: 'Analytics', icon: <BarChart3 size={18}/> },
    { name: 'Students', icon: <Users size={18}/> },
    { name: 'View Live Feed', icon: <FileText size={18}/> }
  ];





  useEffect(() => {
    fetchPosts({ pageNumber: 1, append: false, search: searchTerm });
  }, [searchTerm]);

  // Collapse the sidebar completely on desktop if 'View Live Feed' is chosen
  useEffect(() => {
    if (activeTab === 'View Live Feed') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [activeTab]);


    // fetch categories 
    useEffect(() => {
    fetchCategories();
  }, []);
    

  // useEffect(() => {
  // localStorage.setItem('nuesa_categories', JSON.stringify(categories));
  // }, [ categories]);


  // Synchronize draft memory buffer state on input change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const draftPayload = {
      ...formData,
      imageDataUrl: draftImageDataUrl,
      imageName: selectedFile?.name || null,
    };

    localStorage.setItem('nuesa_article_draft', JSON.stringify(draftPayload));
  }, [formData, draftImageDataUrl, selectedFile]);

  // Safely compute image preview URL once state mounts
 useEffect(() => {
  if (!selectedFile) {
    // If we're editing an existing post,
    // keep its existing image preview.
    if (editingPost?.image?.url) {
      setPreviewUrl(editingPost.image.url);
    } else {
      setPreviewUrl(null);
    }

    return;
  }

  const objectUrl = URL.createObjectURL(selectedFile);

  setPreviewUrl(objectUrl);

  return () => URL.revokeObjectURL(objectUrl);
}, [selectedFile, editingPost]);


  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full font-sans relative overflow-x-hidden">
      
      {/* Mobile Top Header Bar - Hides completely when on Live Feed tab */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40 ${activeTab === 'View Live Feed' ? 'hidden' : 'flex'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">N</div>
          <h1 className="text-lg font-bold text-slate-900">NUESA</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-50 rounded-lg text-slate-600">
          {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* Sliding Sidebar Navigation Control Drawer */}
      <aside className={`fixed top-0 left-0 z-80 h-screen bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 flex flex-col w-72 
        ${activeTab === 'View Live Feed' ? 'lg:-translate-x-full' : 'lg:translate-x-0'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center h-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">N</div>
            <h1 className="text-xl font-bold text-slate-900">NUESA<span className="text-blue-600"> Admin</span></h1>
          </div>
          <button className="p-1 rounded-lg hover:bg-slate-50" onClick={() => setIsMobileMenuOpen(false)}><X size={20}/></button>
        </div>
        
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button 
              key={item.name} 
              onClick={() => { setActiveTab(item.name); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === item.name ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {item.icon} <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-slate-100">
          <button onClick={() => logout()} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition font-bold px-4 w-full text-left">
            <LogOut size={18}/> <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace Content Core Frame View */}
      <main 
        className={`flex-1 min-h-screen transition-all duration-300 w-full max-w-full
          ${activeTab === 'View Live Feed' ? 'p-0 pt-0 lg:p-0 lg:pl-0' : 'p-6 lg:p-12 pt-24 lg:pt-12 lg:pl-80'}
        `}
      >
        {activeTab !== 'View Live Feed' && (
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{activeTab}</h2>
              <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest italic">Faculty of Education • UI</p>
            </div>

            <button 
            onClick={() => { 
              setEditingPost(null);
              setFormData(createEmptyFormData()); setIsDrawerOpen(true); }} className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all"><Plus size={18}/> New Article</button>
          </header>
        )}

        <div className="w-full min-h-screen">
            {activeTab === 'Dashboard' && <DashboardOverview />}
            {activeTab === 'Manage Posts' && (

              //manage posts component
              <ManagePosts
                posts={posts}
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                hasMore={hasMorePosts}
                loadMore={async () => {
                  if (!hasMorePosts || loadingMorePosts) return;
                  await fetchPosts({ pageNumber: page + 1, append: true, search: searchTerm });
                }}
                loadingMore={loadingMorePosts}

                // onEdit={(post) => { setFormData(post); setIsDrawerOpen(true); }}
                onEdit={(post) => {
                setEditingPost(post);

                setFormData({
                  title: post.title || '',
                  category: post.category || '',
                  keywords: Array.isArray(post.keywords)
                    ? post.keywords.join(', ')
                    : post.keywords || '',
                  content: post.content || '',
                });

                // Editing an existing post means we're NOT selecting
                // a new image yet.
                setSelectedFile(null);

                // Show the existing Cloudinary image in the drawer
                setPreviewUrl(post.image?.url || null);

                setDraftImageDataUrl(null);

                localStorage.removeItem('nuesa_article_draft');

                setIsDrawerOpen(true);
              }}

              //delete post handler
                onDelete={handleDelete}
              />
            )}



          {/* analytics view component */}
          
            {activeTab === 'Analytics' && <AnalyticsView />}
            {activeTab === 'Students' && <StudentDirectory />}

            {/* IMMERSIVE STREAM FLUID TEST FRAME */}
            {activeTab === 'View Live Feed' && (
              <div className="w-full min-h-screen bg-slate-50 animate-in fade-in duration-200">
                <Home 
                 backendUser={backendUser}
                isAdminPreview={true} onBackToDashboard={() => setActiveTab('Dashboard')} />
              </div>
            )}
          </div>
     </main>


     {/* // article drawer component */}

      <ArticleDrawer 
      isOpen={isDrawerOpen} 
      editingPost={editingPost}
      onClose={() => setIsDrawerOpen(false)} 
      formData={formData} 
      setFormData={setFormData} 
      onPublish={handlePublish} 
      isPublishing={isPublishing}
      previewUrl={previewUrl} 
      setSelectedFile={handleFileSelect} 
      onClearDraft={clearDraft} 

      categories={categories}
      
      />
    </div>
  );
};

export default AdminDashboard;