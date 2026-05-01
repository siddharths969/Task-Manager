// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login   from './pages/Login';
import Signup  from './pages/Signup';
import Dashboard      from './pages/Dashboard';
import Projects       from './pages/Projects';
import ProjectDetail  from './pages/ProjectDetail';

const Guard = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Guard><Dashboard /></Guard>} />
        <Route path="/projects" element={<Guard><Projects /></Guard>} />
        <Route path="/projects/:id" element={<Guard><ProjectDetail /></Guard>} />
      </Routes>
    </BrowserRouter>
  );
}