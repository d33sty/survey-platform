import { useParams } from 'react-router-dom';

export default function PollSuccess() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Спасибо!</h1>
        <p className="text-sm text-gray-500">Ваш ответ успешно записан.</p>
        <a
          href={`${import.meta.env.BASE_URL}p/${id}`}
          className="mt-6 inline-block text-sm text-blue-600 hover:underline"
        >
          Пройти ещё раз
        </a>
      </div>
    </div>
  );
}
