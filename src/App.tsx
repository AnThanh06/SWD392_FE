import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import Layout from './Layout';
import AdminDashboard from './AdminDashboard';
import RevenueDashboard from './RevenueDashboard';
import OrdersPage from './OrdersPage';
import TablePage from './TablePage';
import Login from './Login';
import Payment from './Payment';
import SelectOrderPage from './SelectOrderPage';
import MenuPage from './MenuPage';



function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menupage" element={<MenuPage />} />

        <Route path="/admin" element={<AdminDashboard />}>
          
          <Route index element={<RevenueDashboard />} />
          <Route path="dashboard" element={<RevenueDashboard />} />
          
          <Route path="orderspage" element={< OrdersPage />} />
          <Route path="tablepage" element={< TablePage />} />
          
          <Route path="revenuedashboard" element={<RevenueDashboard />} />
        </Route>
        <Route path="/payment" element={<SelectOrderPage />} />

       
        <Route path="/payment/:id" element={<Payment />} />
        
        
      </Routes>
    </Layout>
  );
}

export default App;