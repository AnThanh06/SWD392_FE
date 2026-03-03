import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import Layout from './Layout';
import AdminDashboard from './AdminDashboard';
import RevenueDashboard from './RevenueDashboard';
import OrdersPage from './OrdersPage';
import TablePage from './TablePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/admin" element={<AdminDashboard />}>
          
          <Route index element={<RevenueDashboard />} />
          <Route path="dashboard" element={<RevenueDashboard />} />
          
          <Route path="orderspage" element={< OrdersPage />} />
          <Route path="tablepage" element={< TablePage />} />
          
          <Route path="revenuedashboard" element={<RevenueDashboard />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;