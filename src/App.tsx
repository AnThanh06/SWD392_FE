import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import Layout from './Layout';
import Login from './Login';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Layout>

  );
}

export default App;