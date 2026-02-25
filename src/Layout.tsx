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
    
  ];

  
  const noFooterRoutes = [
    '/login',
   
  ];

  const hideNav = noNavRoutes.includes(location.pathname);
  const hideFooter = noFooterRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {!hideNav && <NavBar />}


      <Container component="main" sx={{ flexGrow: 1, py: hideNav ? 0 : 4 }}>
        {children}
      </Container>

   
      {!hideFooter && <Footer />}
      
    </Box>
  );
}