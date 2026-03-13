import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useState, useEffect } from "react";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [open, setOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); 
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [location]);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const menuItems: { label: string; path: string }[] = [
    { label: "Trang Chủ", path: "/" },
    { label: "Thực đơn", path: "/menupage" },
    { label: "Thanh Toán", path: "/payment" },
  ];

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    handleCloseUserMenu();
    navigate("/"); 
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "white",
          color: "black",
          boxShadow: "none",
          borderBottom: "1px solid #eaeaea"
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
                textDecoration: "none",
                color: "inherit",
                fontWeight: 900,
                letterSpacing: "1px"
              }}
            >
              Restaurant
            </Typography>

            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    fontWeight: 600,
                    color: isActive(item.path) ? "#ce1212" : "#333",
                    borderBottom: isActive(item.path) ? "2px solid #ce1212" : "2px solid transparent",
                    borderRadius: 0,
                    "&:hover": {
                      color: "#ce1212",
                      bgcolor: "transparent"
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {isLoggedIn ? (
                <Box sx={{ ml: 2 }}>
                  <Tooltip title="Tài khoản của bạn">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt="User Avatar" 
                        sx={{ bgcolor: "#ce1212" }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    keepMounted
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {/* THÊM LINK VÀO ĐÂY CHO MÁY TÍNH */}
                    <MenuItem 
                      component={Link} 
                      to="/staffpage" 
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">Trang Nhân Viên</Typography>
                    </MenuItem>
                    
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, fontSize: "small", color: "error.main" }} />
                      <Typography textAlign="center" color="error">Đăng xuất</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  to="/login"
                  sx={{
                    ml: 2,
                    borderRadius: "50px",
                    px: 3,
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #ce1212, #8b000a)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #b00000, #6b0007)",
                    }
                  }}
                >
                  Đăng Nhập
                </Button>
              )}
            </Box>

            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {isLoggedIn ? (
              <>
                {/* THÊM LINK VÀO ĐÂY CHO ĐIỆN THOẠI */}
                <ListItem disablePadding>
                  <ListItemButton 
                    component={Link} 
                    to="/staffpage" 
                    onClick={() => setOpen(false)}
                  >
                    <ListItemText primary="Trang Nhân Viên" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <ListItemText primary="Đăng xuất" sx={{ color: "error.main" }} />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/login"
                  onClick={() => setOpen(false)}
                >
                  <ListItemText primary="Đăng Nhập" sx={{ color: "#ce1212", fontWeight: "bold" }} />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}