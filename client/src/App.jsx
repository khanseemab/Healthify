import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AIAgent from './pages/AIAgent';
import Reminders from './pages/Reminders';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ai-agent" element={<AIAgent />} />
      <Route path="/reminders" element={<Reminders />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
