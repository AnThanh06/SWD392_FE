import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import Layout from './Layout';
import Login from './Login';
import PaymentPage from './Payment';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </Layout>

  );
}

export default App;