import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';

import RestaurantIcon from '@mui/icons-material/Restaurant'; 

export default function NavBar() {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'white',   
        color: 'black',     
        boxShadow: 'none',  
        borderBottom: '1px solid #eaeaea' 
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          
          
          <RestaurantIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h5" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit', 
              fontWeight: '900',
              letterSpacing: '1px' 
            }}
          >
            Restaurant
          </Typography>

          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              sx={{ fontWeight: 600, '&:hover': { color: 'grey.500', bgcolor: 'transparent' } }}
            >
              Trang Chủ
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/about"
              sx={{ fontWeight: 600, '&:hover': { color: 'grey.500', bgcolor: 'transparent' } }}
            >
              Về Chúng Tôi
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/login" 
              sx={{ 
                ml: 2, 
                borderRadius: '50px', 
                px: 3, 
                fontWeight: 'bold' 
              }}
            >
              Đăng Nhập
            </Button>
          </Box>
          
        </Toolbar>
      </Container>
    </AppBar>
  );
}