import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { token } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/polls', token)
      .then(setPolls)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот опрос и все ответы?')) return;
    try {
      await client.delete(`/polls/${id}`, token);
      setPolls(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Мои опросы</h1>
        <Link
          to="/polls/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Создать опрос
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-base">Опросов пока нет</p>
          <Link to="/polls/new" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            Создать первый опрос
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {polls.map(poll => (
            <div
              key={poll.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <div className="min-w-0">
                <Link
                  to={`/polls/${poll.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                >
                  {poll.title}
                </Link>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(poll.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      poll.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {poll.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4 shrink-0">
                <Link
                  to={`/polls/${poll.id}`}
                  className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  Открыть
                </Link>
                <button
                  onClick={() => handleDelete(poll.id)}
                  className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="text-gray-400 text-sm py-12 text-center">Загрузка...</div>;
}

function ErrorMsg({ msg }) {
  return <div className="text-red-600 text-sm py-8 text-center">{msg}</div>;
}
