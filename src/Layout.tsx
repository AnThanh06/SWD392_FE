import React from 'react';
import { Box, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const noNavRoutes = [
    '/login',
    '/admin/dashboard',
    '/admin/revenuedashboard',
    '/admin/orderspage',
    '/admin/tablepage',
    '/admin',
    '/admin/categorypage',
    '/admin/productpage',
    '/kitchenpage',
  ];

  const noFooterRoutes = [
    '/login',
    '/admin/dashboard',
    '/admin/revenuedashboard',
    '/admin/orderspage',
    '/admin/tablepage',
    '/admin',

    '/admin/categorypage',
    '/admin/productpage',
    '/kitchenpage'
  ];

  const noContainerRoutes = ['/', '/menupage', '/payment'];

  const hideNav = noNavRoutes.includes(location.pathname);
  const hideFooter = noFooterRoutes.includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const skipContainer = noContainerRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNav && <NavBar />}

      {isAdminRoute ? (
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      ) : skipContainer ? (
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      ) : (
        <Container
          component="main"
          sx={{ flexGrow: 1, py: hideNav ? 0 : 4 }}
        >
          {children}
        </Container>
      )}

      {!hideFooter && <Footer />}
    </Box>
  );
}