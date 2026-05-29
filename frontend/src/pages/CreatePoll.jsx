import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'rating', label: 'Рейтинг (1–5)' },
  { value: 'single_choice', label: 'Один вариант' },
  { value: 'multiple_choice', label: 'Несколько вариантов' },
];

const isChoiceType = type => type === 'single_choice' || type === 'multiple_choice';

let nextId = 1;
const uid = () => nextId++;

function emptyQuestion() {
  return { _id: uid(), text: '', type: 'text', required: true, options: [] };
}

function emptyOption() {
  return { _id: uid(), text: '' };
}

export default function CreatePoll() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateQuestion = (id, patch) =>
    setQuestions(qs => qs.map(q => (q._id === id ? { ...q, ...patch } : q)));

  const removeQuestion = (id) =>
    setQuestions(qs => qs.filter(q => q._id !== id));

  const addOption = (qId) =>
    setQuestions(qs =>
      qs.map(q => q._id === qId ? { ...q, options: [...q.options, emptyOption()] } : q)
    );

  const updateOption = (qId, optId, text) =>
    setQuestions(qs =>
      qs.map(q =>
        q._id === qId
          ? { ...q, options: q.options.map(o => o._id === optId ? { ...o, text } : o) }
          : q
      )
    );

  const removeOption = (qId, optId) =>
    setQuestions(qs =>
      qs.map(q =>
        q._id === qId ? { ...q, options: q.options.filter(o => o._id !== optId) } : q
      )
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const q of questions) {
      if (!q.text.trim()) { setError('Заполните текст всех вопросов'); return; }
      if (isChoiceType(q.type) && q.options.length < 2) {
        setError('Добавьте хотя бы 2 варианта ответа для вопросов с выбором'); return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        questions: questions.map((q, i) => ({
          text: q.text,
          type: q.type,
          order: i,
          required: q.required,
          options: q.options.map((opt, j) => ({ text: opt.text, order: j })),
        })),
      };
      const poll = await client.post('/polls', payload, token);
      navigate(`/polls/${poll.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Новый опрос</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div>
            <label className={labelCls}>Название опроса *</label>
            <input
              required
              className={inputCls}
              placeholder="Введите название"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Описание (необязательно)</label>
            <textarea
              rows={2}
              className={inputCls}
              placeholder="Краткое описание опроса"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q._id}
              q={q}
              idx={idx}
              total={questions.length}
              onChange={patch => updateQuestion(q._id, patch)}
              onRemove={() => removeQuestion(q._id)}
              onAddOption={() => addOption(q._id)}
              onUpdateOption={(optId, text) => updateOption(q._id, optId, text)}
              onRemoveOption={(optId) => removeOption(q._id, optId)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setQuestions(qs => [...qs, emptyQuestion()])}
          className="w-full border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 rounded-lg py-3 text-sm font-medium transition-colors"
        >
          + Добавить вопрос
        </button>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white text-sm px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Сохранение...' : 'Создать опрос'}
          </button>
        </div>
      </form>
    </div>
  );
}

function QuestionCard({ q, idx, total, onChange, onRemove, onAddOption, onUpdateOption, onRemoveOption }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xs font-semibold text-gray-400 mt-2.5 w-5 shrink-0">{idx + 1}</span>
        <div className="flex-1 space-y-3">
          <input
            required
            className={inputCls}
            placeholder="Текст вопроса"
            value={q.text}
            onChange={e => onChange({ text: e.target.value })}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={q.type}
              onChange={e => onChange({ type: e.target.value, options: [] })}
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={q.required}
                onChange={e => onChange({ required: e.target.checked })}
                className="rounded"
              />
              Обязательный
            </label>
          </div>

          {isChoiceType(q.type) && (
            <div className="space-y-2 pl-1">
              {q.options.map(opt => (
                <div key={opt._id} className="flex items-center gap-2">
                  <input
                    required
                    className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Вариант ответа"
                    value={opt.text}
                    onChange={e => onUpdateOption(opt._id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveOption(opt._id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={onAddOption}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                + Вариант
              </button>
            </div>
          )}
        </div>

        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-300 hover:text-red-400 text-xl leading-none mt-1 shrink-0"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
