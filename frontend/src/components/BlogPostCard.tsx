import { AdminOnly } from './AdminOnly';
import { ArrowRight, Edit2, Trash2 } from 'lucide-react';
import type { Post } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

interface BlogPostCardProps {
  post: Post;
  featured?: boolean;
}

const BlogPostCard = ({ post, featured = false }: BlogPostCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
      navigate(`/posts/${post.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // navigate(`/admin/posts/${post.id}/edit`);
    alert("编辑功能开发中");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这篇文章吗？')) {
      // await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      alert("删除功能开发中");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer flex flex-col ${featured ? 'md:grid md:grid-cols-2 md:gap-12 md:items-center' : ''}`}
    >
      {/* 封面图 */}
      <div
        className={`relative overflow-hidden rounded-sm mb-6 ${featured ? 'aspect-[16/9] md:h-full' : 'aspect-[4/3]'} transition-transform duration-700 ease-out group-hover:shadow-md`}
        style={{ backgroundColor: post.coverColor }}
      >
        <div className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"></div>
        
        {/* 管理员操作按钮 */}
        <AdminOnly>
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={handleEdit}
              className="bg-white/90 px-3 py-2 rounded-sm text-stone-700 hover:bg-white hover:text-stone-900 transition-colors shadow-sm"
              title="编辑文章"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="bg-white/90 px-3 py-2 rounded-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
              title="删除文章"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </AdminOnly>
      </div>

      <div className="flex flex-col h-full justify-center">
        {/* 分类和日期 */}
        <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase mb-3 font-sans">
          <span className="text-[#D97757]">{post.category}</span>
          <span className="w-1 h-1 rounded-full bg-stone-300"></span>
          <span className="text-stone-500 font-medium">{post.date}</span>
          
          <AdminOnly>
             <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">已发布</span>
          </AdminOnly>
        </div>

        <h3 className={`font-serif font-bold text-stone-900 leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-stone-400 ${featured ? 'text-3xl md:text-4xl mb-4' : 'text-xl mb-3'}`}>
          {post.title}
        </h3>

        <p className={`text-stone-600 font-serif leading-relaxed line-clamp-3 ${featured ? 'text-lg mb-6' : 'text-sm mb-4'}`}>
          {post.excerpt}
        </p>

        <div className="mt-auto pt-2 flex items-center text-sm font-bold text-stone-900 group-hover:translate-x-1 transition-transform duration-300">
          阅读全文 <ArrowRight size={16} className="ml-2" />
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
