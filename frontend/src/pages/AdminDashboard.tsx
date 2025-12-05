import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();

  // Double check protection, though route should be protected
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl font-bold text-stone-900 mb-8">
          管理后台
        </h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-sm shadow">
            <h3 className="text-stone-500 text-sm font-medium mb-2">总文章数</h3>
            <p className="text-3xl font-bold text-stone-900">5</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow">
            <h3 className="text-stone-500 text-sm font-medium mb-2">总浏览量</h3>
            <p className="text-3xl font-bold text-stone-900">1,234</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow">
            <h3 className="text-stone-500 text-sm font-medium mb-2">用户数</h3>
            <p className="text-3xl font-bold text-stone-900">2</p>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              文章管理
            </h3>
            <p className="text-stone-600">
              查看、编辑和管理所有文章（功能开发中）
            </p>
          </div>

          <div className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              评论管理
            </h3>
            <p className="text-stone-600">
              审核和管理用户评论（功能开发中）
            </p>
          </div>

          <div className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              分类管理
            </h3>
            <p className="text-stone-600">
              管理文章分类和标签（功能开发中）
            </p>
          </div>

          <div className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              网站设置
            </h3>
            <p className="text-stone-600">
              配置网站基本信息和参数（功能开发中）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
