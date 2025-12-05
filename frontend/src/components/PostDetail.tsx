import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Share2, Twitter, Linkedin, Mail, Loader2 } from 'lucide-react';
import type { Post } from '../data/mockData';
import { useNavigate, useParams } from 'react-router-dom';
import { endpoints } from '../config/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(endpoints.post(id));
        
        if (!response.ok) {
          throw new Error('文章不存在或无法加载');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const p = result.data;
          const mappedPost: Post = {
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || '',
            category: p.category?.name || 'Original',
            date: new Date(p.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            readTime: `${p.readTime || 1} 分钟阅读`,
            author: p.author?.displayName || p.author?.username || 'Unknown',
            coverColor: p.coverColor || '#D6D1CB',
            // Use contentHtml if available, otherwise wrap raw markdown in a simple container
            // In a real app, use a Markdown renderer here
            content: <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: p.contentHtml || p.content }} />
          };
          setPost(mappedPost);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={32} />
        <p className="text-stone-500 font-serif">正在加载文章...</p>
      </div>
    );
  }

  if (error || !post) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-stone-500">
          <p className="mb-6 text-xl font-serif">{error || '文章未找到'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-stone-300 rounded-full hover:bg-stone-100 transition-colors"
          >
            返回首页
          </button>
        </div>
      );
  }

  return (
    <article>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          返回列表
        </button>

        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 text-xs font-bold tracking-widest text-[#D97757] uppercase mb-3 font-sans">
            <span>{post.category}</span>
            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
            <span>{post.date}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-8">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-stone-500 text-sm font-sans">
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-900">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16">
        <div
          className="aspect-[21/9] overflow-hidden rounded-sm"
          style={{ backgroundColor: post.coverColor }}
        />
        <div className="text-center mt-2 text-xs text-stone-400 italic">
          Featured Color Theme
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 mb-20">
   

        <div className="prose prose-stone prose-lg md:prose-xl prose-headings:font-serif prose-headings:font-bold prose-headings:leading-tight prose-headings:mt-10 prose-headings:mb-3 prose-p:text-stone-700 prose-p:font-serif prose-p:leading-loose prose-p:mb-3 prose-li:leading-loose prose-li:mb-2 prose-blockquote:leading-loose prose-blockquote:my-8 [&_p]:tracking-wide"> 
          {post.content} 
        </div>


        <div className="mt-16 pt-8 border-t border-stone-200 flex items-center justify-between">
          <span className="font-sans text-sm font-bold text-stone-900">分享文章</span>
          <div className="flex gap-4">
             <button className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-600"><Twitter size={18} /></button>
             <button className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-600"><Linkedin size={18} /></button>
             <button className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-600"><Mail size={18} /></button>
             <button className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-600"><Share2 size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostDetail;
