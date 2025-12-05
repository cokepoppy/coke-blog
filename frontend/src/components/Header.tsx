import { useAuth } from '../contexts/AuthContext';
import { AdminOnly } from './AdminOnly';
import { PenLine, ChevronDown, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F4F3F0]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="cursor-pointer group flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            可小乐的Blog.
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm font-medium text-stone-600">
          <Link to="/" className="hover:text-stone-900 transition-colors">
            首页
          </Link>
          <Link to="#" className="hover:text-stone-900 transition-colors">
            专栏
          </Link>
          <Link to="#" className="hover:text-stone-900 transition-colors">
            关于
          </Link>

          {/* 管理员专属链接 */}
          <AdminOnly>
            <Link to="/admin" className="hover:text-stone-900 transition-colors text-[#D97757]">
              后台管理
            </Link>
          </AdminOnly>

          {/* 用户菜单 */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <AdminOnly>
                <Link
                  to="/create"
                  className="flex items-center gap-2 bg-stone-900 text-[#F4F3F0] px-5 py-2.5 rounded-sm hover:bg-stone-700 transition-all"
                >
                  <PenLine size={16} />
                  <span>开始创作</span>
                </Link>
              </AdminOnly>

              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-stone-900">
                  <span>{user?.display_name || user?.username}</span>
                  <ChevronDown size={16} />
                </button>

                {/* 下拉菜单 */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-stone-100">
                  <div className="py-2 border-b border-stone-100">
                     <div className="px-4 py-2 text-xs text-stone-400 uppercase tracking-wider">
                       {user?.role}
                     </div>
                  </div>
                  <Link to="#" className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-600 hover:text-stone-900">
                    <User size={16} />
                    个人资料
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    <LogOut size={16} />
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-stone-900 text-[#F4F3F0] px-5 py-2.5 rounded-sm hover:bg-stone-700 transition-all"
            >
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
