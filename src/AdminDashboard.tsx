import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, IconButton, List,
    ListItemButton, ListItemIcon, ListItemText, CssBaseline, 
    Divider, useTheme, Avatar, 
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';

import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280; 

const AdminDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const menuItems = [
        { label: 'Thông tin Doanh thu', icon: <DashboardIcon />, path: '/admin/revenuedashboard' },
        { label: 'Đơn hàng', icon: <DashboardIcon />, path: '/admin/orderspage' },
        { label: 'Trạng thái bàn', icon: <DashboardIcon />, path: '/admin/tablepage' },
        
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo / Brand Area */}
            <Toolbar sx={{ px: 3, py: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.primary.main, letterSpacing: 1 }}>
                    MY ADMIN
                </Typography>
            </Toolbar>

            <List sx={{ px: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton 
                            key={item.path} 
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: '12px',
                                mb: 1,
                                py: 1.2,
                                backgroundColor: isActive ? 'primary.light' : 'transparent',
                                color: isActive ? 'primary.main' : 'text.secondary',
                                '&:hover': {
                                    backgroundColor: isActive ? 'primary.light' : 'rgba(0,0,0,0.04)',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isActive ? 'primary.main' : 'inherit',
                                    minWidth: 45
                                }
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText 
                                primary={item.label} 
                                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 500 }} 
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider sx={{ mx: 2, opacity: 0.5 }} />
            
            <Box sx={{ p: 2 }}>
                <ListItemButton 
                    onClick={() => navigate('/login')}
                    sx={{ borderRadius: '12px', color: 'error.main' }}
                >
                    <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                    <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
            <CssBaseline />
            
            {/* Header sạch sẽ hơn */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: 'text.primary',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        Trang quản trị / {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
                            Admin User
                        </Typography>
                        <Avatar sx={{ width: 35, height: 35, bgcolor: 'primary.main', fontSize: '1rem' }}>A</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Content Area full-width */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar /> {/* Spacer dưới AppBar */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminDashboard;