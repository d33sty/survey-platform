import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { client } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = ['Настройки', 'Ответы', 'Статистика'];

export default function PollDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [poll, setPoll] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPoll = useCallback(() =>
    client.get(`/polls/${id}`, token).then(setPoll).catch(e => setError(e.message))
  , [id, token]);

  useEffect(() => {
    fetchPoll().finally(() => setLoading(false));
  }, [fetchPoll]);

  if (loading) return <p className="text-gray-400 text-sm py-12 text-center">Загрузка...</p>;
  if (error) return <p className="text-red-600 text-sm py-8 text-center">{error}</p>;
  if (!poll) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Опросы</Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{poll.title}</h1>
        </div>
        <a
          href={`${import.meta.env.BASE_URL}p/${poll.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Открыть опрос ↗
        </a>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 0 && <SettingsTab poll={poll} token={token} onUpdate={setPoll} />}
      {activeTab === 1 && <ResponsesTab pollId={id} token={token} />}
      {activeTab === 2 && <StatsTab pollId={id} token={token} />}
    </div>
  );
}

function SettingsTab({ poll, token, onUpdate }) {
  const [form, setForm] = useState({ title: poll.title, description: poll.description || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}p/${poll.id}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await client.patch(`/polls/${poll.id}`, {
        title: form.title,
        description: form.description || null,
      }, token);
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    try {
      const updated = await client.patch(`/polls/${poll.id}`, { is_active: !poll.is_active }, token);
      onUpdate(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div>
          <label className={lbl}>Название</label>
          <input
            required
            className={inp}
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className={lbl}>Описание</label>
          <textarea
            rows={3}
            className={inp}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saved ? '✓ Сохранено' : saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Статус опроса</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {poll.is_active ? 'Опрос доступен для прохождения' : 'Опрос закрыт'}
          </p>
        </div>
        <button
          onClick={toggleActive}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            poll.is_active ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              poll.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm font-medium text-gray-900 mb-2">Ссылка на опрос</p>
        <div className="flex items-center gap-2">
          <input readOnly value={shareUrl} className={`${inp} text-xs text-gray-500 bg-gray-50`} />
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="shrink-0 text-sm text-blue-600 hover:text-blue-700 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Копировать
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm font-medium text-gray-900 mb-3">Вопросы ({poll.questions.length})</p>
        <div className="space-y-2">
          {poll.questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="text-gray-400 w-5 shrink-0">{i + 1}.</span>
              <span className="flex-1">{q.text}</span>
              <span className="text-xs text-gray-400 shrink-0">{typeLabel(q.type)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResponsesTab({ pollId, token }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/polls/${pollId}/responses`, token)
      .then(setResponses)
      .finally(() => setLoading(false));
  }, [pollId, token]);

  if (loading) return <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>;

  if (responses.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Ответов пока нет</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-4">Всего ответов: {responses.length}</p>
      {responses.map(r => (
        <Link
          key={r.id}
          to={`/polls/${pollId}/responses/${r.id}`}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-3 hover:border-gray-300 transition-colors"
        >
          <span className="text-sm text-gray-700">Ответ #{r.id}</span>
          <span className="text-xs text-gray-400">
            {new Date(r.submitted_at).toLocaleString('ru-RU')}
          </span>
        </Link>
      ))}
    </div>
  );
}

function StatsTab({ pollId, token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/polls/${pollId}/stats`, token)
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [pollId, token]);

  if (loading) return <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>;
  if (error) return <p className="text-red-600 text-sm text-center py-8">{error}</p>;
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Всего прохождений: <strong>{stats.total_responses}</strong></p>

      {stats.questions.map(q => (
        <div key={q.question_id} className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="font-medium text-gray-900 mb-1">{q.question_text}</p>
          <p className="text-xs text-gray-400 mb-4">
            {typeLabel(q.type)} · {q.response_count} ответ(а/ов)
          </p>

          {(q.type === 'number' || q.type === 'rating') && q.response_count > 0 && (
            <div className="flex gap-6">
              <Stat label="Мин" value={q.min_value} />
              <Stat label="Макс" value={q.max_value} />
              <Stat label="Среднее" value={q.avg_value?.toFixed(2)} />
            </div>
          )}

          {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options.length > 0 && (
            <div className="space-y-2">
              {q.options.map(opt => {
                const pct = q.response_count > 0 ? Math.round(opt.count / q.response_count * 100) : 0;
                return (
                  <div key={opt.option_id} className="flex items-center gap-3">
                    <span className="w-40 text-sm text-gray-700 truncate shrink-0">{opt.option_text}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                      {opt.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {q.type === 'text' && (
            <p className="text-sm text-gray-400 italic">Текстовые ответы доступны в разделе «Ответы»</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-800">{value ?? '—'}</p>
    </div>
  );
}

function typeLabel(type) {
  const map = {
    text: 'Текст',
    number: 'Число',
    rating: 'Рейтинг',
    single_choice: 'Один вариант',
    multiple_choice: 'Несколько вариантов',
  };
  return map[type] ?? type;
}

const lbl = 'block text-sm font-medium text-gray-700 mb-1';
const inp = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
