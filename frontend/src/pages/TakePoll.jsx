import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { client } from '../api/client.js';

export default function TakePoll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/polls/${id}/public`)
      .then(p => {
        setPoll(p);
        const init = {};
        p.questions.forEach(q => {
          init[q.id] = { question_id: q.id, text_value: null, number_value: null, selected_option_ids: [] };
        });
        setAnswers(init);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const setAnswer = (qId, patch) =>
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], ...patch } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const q of poll.questions) {
      if (!q.required) continue;
      const a = answers[q.id];
      const empty =
        (q.type === 'text' && !a.text_value?.trim()) ||
        (['number', 'rating'].includes(q.type) && a.number_value === null) ||
        (['single_choice', 'multiple_choice'].includes(q.type) && a.selected_option_ids.length === 0);
      if (empty) {
        setError(`Ответьте на обязательный вопрос: "${q.text}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await client.post(`/polls/${id}/responses`, { answers: Object.values(answers) });
      navigate(`/p/${id}/success`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Загрузка...</p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{poll.title}</h1>
          {poll.description && (
            <p className="mt-2 text-gray-600 text-sm">{poll.description}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {poll.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-sm font-medium text-gray-900 mb-3">
                {idx + 1}. {q.text}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </p>
              <QuestionInput
                question={q}
                answer={answers[q.id]}
                onChange={patch => setAnswer(q.id, patch)}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Отправка...' : 'Отправить ответы'}
          </button>
        </form>
      </div>
    </div>
  );
}

function QuestionInput({ question: q, answer: a, onChange }) {
  if (q.type === 'text') {
    return (
      <textarea
        rows={3}
        className={inp}
        placeholder="Введите ответ"
        value={a.text_value ?? ''}
        onChange={e => onChange({ text_value: e.target.value || null })}
      />
    );
  }

  if (q.type === 'number') {
    return (
      <input
        type="number"
        step="any"
        className={inp}
        placeholder="Введите число"
        value={a.number_value ?? ''}
        onChange={e => onChange({ number_value: e.target.value ? Number(e.target.value) : null })}
      />
    );
  }

  if (q.type === 'rating') {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ number_value: n })}
            className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
              a.number_value === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === 'single_choice') {
    return (
      <div className="space-y-2">
        {q.options.map(opt => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={`q-${q.id}`}
              checked={a.selected_option_ids.includes(opt.id)}
              onChange={() => onChange({ selected_option_ids: [opt.id] })}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">{opt.text}</span>
          </label>
        ))}
      </div>
    );
  }

  if (q.type === 'multiple_choice') {
    const toggle = (optId) => {
      const ids = a.selected_option_ids.includes(optId)
        ? a.selected_option_ids.filter(x => x !== optId)
        : [...a.selected_option_ids, optId];
      onChange({ selected_option_ids: ids });
    };
    return (
      <div className="space-y-2">
        {q.options.map(opt => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={a.selected_option_ids.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">{opt.text}</span>
          </label>
        ))}
      </div>
    );
  }

  return null;
}

const inp = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
