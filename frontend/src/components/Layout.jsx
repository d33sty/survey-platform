import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-semibold text-gray-900 text-lg tracking-tight">Survey</Link>
          <nav className="flex items-center gap-3">
            <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-900">Опросы</Link>
            <Link
              to="/polls/new"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Создать
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Выход
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
