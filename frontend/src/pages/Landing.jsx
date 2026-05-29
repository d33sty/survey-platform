import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { client } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { userToken, token, isUser, userLogout } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/polls/active', userToken || token)
      .then(data => setPolls(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userToken, token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-lg tracking-tight">Survey</span>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Войти как администратор
            </Link>
            {isUser && (
              <button
                onClick={() => { userLogout(); navigate('/enter'); }}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                Выход
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Доступные опросы</h1>

        {loading && (
          <p className="text-gray-400 text-sm">Загрузка...</p>
        )}

        {!loading && polls.length === 0 && (
          <p className="text-gray-400 text-sm">Пока нет активных опросов.</p>
        )}

        {!loading && polls.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map(poll => (
              <Link
                key={poll.id}
                to={`/p/${poll.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <h2 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {poll.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
