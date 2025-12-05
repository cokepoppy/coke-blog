import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import BlogList from './components/BlogList';
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import type { Post } from './data/mockData';
import { endpoints } from './config/api';

// Keep INITIAL_POSTS as fallback/initial data
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    title: "构建可信赖的通用人工智能",
    excerpt: "探讨在追求通用人工智能（AGI）的过程中，如何将安全性、诚实性和对人类价值观的对齐置于核心位置。",
    category: "AI Safety",
    date: "2023年 10月 24日",
    readTime: "8 分钟阅读",
    author: "张三",
    coverColor: "#D6D1CB",
    content: (
      <>
        <p className="mb-6 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">
          在人工智能快速发展的今天，"对齐"（Alignment）不仅仅是一个技术术语，它是我们构建未来的基石。
        </p>
      </>
    )
  }
];

function App() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${endpoints.posts}?limit=20&sort=latest`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Map backend data to frontend Post interface
          const mappedPosts: Post[] = result.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            category: p.category?.name || 'Original', // Handle null category
            date: new Date(p.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            readTime: `${p.readTime || 1} 分钟阅读`,
            author: p.author?.displayName || p.author?.username || 'Unknown',
            coverColor: p.coverColor || '#D6D1CB',
            content: <div dangerouslySetInnerHTML={{ __html: p.contentHtml || '<p>' + p.content + '</p>' }} />
          }));
          setPosts(mappedPosts);
        }
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();

    // 监听页面可见性变化，返回页面时刷新列表
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F3F0] text-[#191919] font-sans selection:bg-[#D97757] selection:text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap');

        .font-serif {
          font-family: 'Crimson Pro', serif;
        }
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <Router>
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<BlogList posts={posts} />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
