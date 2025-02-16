import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  return (
    <Router>
      <CssBaseline /> {/* Adds baseline CSS reset */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;