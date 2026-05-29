import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { client } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Enter() {
  const { userLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await client.post('/auth/user-login', { key });
      userLogin(data.access_token);
      navigate(from, { replace: true });
    } catch {
      setError('Неверный код доступа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <span className="font-semibold text-gray-900 text-lg tracking-tight">Survey</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Доступ к опросам</h1>
          <p className="text-sm text-gray-500 mb-6">Введите код доступа, чтобы продолжить.</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Код доступа</label>
              <input
                type="password"
                required
                autoFocus
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={key}
                onChange={e => setKey(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Проверяем...' : 'Войти'}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-500 text-center">
            <Link to="/login" className="text-gray-500 hover:text-gray-900">Войти как администратор</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
