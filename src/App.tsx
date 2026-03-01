import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import Layout from './Layout';



function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />

      </Routes>
    </Layout>

  );
}

export default App;