import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { client } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ResponseDetail() {
  const { id: pollId, rid } = useParams();
  const { token } = useAuth();
  const [poll, setPoll] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      client.get(`/polls/${pollId}`, token),
      client.get(`/polls/${pollId}/responses/${rid}`, token),
    ])
      .then(([p, r]) => { setPoll(p); setResponse(r); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [pollId, rid, token]);

  if (loading) return <p className="text-gray-400 text-sm py-12 text-center">Загрузка...</p>;
  if (error) return <p className="text-red-600 text-sm py-8 text-center">{error}</p>;
  if (!poll || !response) return null;

  const questionMap = Object.fromEntries(poll.questions.map(q => [q.id, q]));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link to={`/polls/${pollId}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← {poll.title}
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Ответ #{response.id}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(response.submitted_at).toLocaleString('ru-RU')}
        </p>
      </div>

      <div className="space-y-3">
        {response.answers.map(answer => {
          const question = questionMap[answer.question_id];
          return (
            <div key={answer.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {question?.text ?? `Вопрос #${answer.question_id}`}
              </p>
              <AnswerValue answer={answer} type={question?.type} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnswerValue({ answer, type }) {
  if (type === 'text' || type === 'number' || type === 'rating') {
    const val = answer.text_value ?? answer.number_value;
    return (
      <p className="text-sm text-gray-700">
        {val !== null && val !== undefined ? String(val) : <span className="text-gray-400 italic">Нет ответа</span>}
      </p>
    );
  }

  if (type === 'single_choice' || type === 'multiple_choice') {
    if (!answer.selected_options.length) {
      return <p className="text-sm text-gray-400 italic">Нет ответа</p>;
    }
    return (
      <ul className="space-y-1">
        {answer.selected_options.map(opt => (
          <li key={opt.id} className="text-sm text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            {opt.text}
          </li>
        ))}
      </ul>
    );
  }

  return <p className="text-sm text-gray-400 italic">—</p>;
}
