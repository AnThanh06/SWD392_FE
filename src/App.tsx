import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import Layout from './Layout';
import Login from './Login';
import Payment from './Payment';
import SelectOrderPage from './SelectOrderPage';


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />

        {/* Trang chọn order */}
        <Route path="/payment" element={<SelectOrderPage />} />

        {/* Trang thanh toán chi tiết */}
        <Route path="/payment/:id" element={<Payment />} />
      </Routes>
    </Layout>
  );
}

export default App;