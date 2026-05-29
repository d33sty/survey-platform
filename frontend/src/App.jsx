import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import PollDetail from './pages/PollDetail.jsx';
import ResponseDetail from './pages/ResponseDetail.jsx';
import TakePoll from './pages/TakePoll.jsx';
import PollSuccess from './pages/PollSuccess.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/p/:id" element={<TakePoll />} />
      <Route path="/p/:id/success" element={<PollSuccess />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/polls/new" element={<CreatePoll />} />
          <Route path="/polls/:id" element={<PollDetail />} />
          <Route path="/polls/:id/responses/:rid" element={<ResponseDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
