import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F0] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-sm shadow-lg p-8">
        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-6 text-center">
          登录到 可小乐的Blog.
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-stone-700 font-medium mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-900"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-stone-700 font-medium mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 text-white py-3 rounded-sm font-medium hover:bg-stone-700 transition-all disabled:opacity-50"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500 space-y-1">
          <p className="font-medium">测试账号:</p>
          <p>管理员: admin@myblog.com / admin123</p>
          <p>浏览者: visitor@myblog.com / visitor123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
