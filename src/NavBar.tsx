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
  ListItemButton
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

export default function NavBar() {
  const location = useLocation();
  const [open, setOpen] = useState<boolean>(false);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const menuItems: { label: string; path: string }[] = [
    { label: "Trang Chủ", path: "/" },
    { label: "Về Chúng Tôi", path: "/about" }
  ];

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

            {/* Logo */}
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

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    fontWeight: 600,
                    color: isActive(item.path)
                      ? "primary.main"
                      : "black",
                    borderBottom: isActive(item.path)
                      ? "2px solid #1976d2"
                      : "none",
                    borderRadius: 0,
                    "&:hover": {
                      color: "grey.500",
                      bgcolor: "transparent"
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <Button
                variant="contained"
                component={Link}
                to="/login"
                sx={{
                  ml: 2,
                  borderRadius: "50px",
                  px: 3,
                  fontWeight: "bold"
                }}
              >
                Đăng Nhập
              </Button>
            </Box>

            {/* Mobile Icon */}
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
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

            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/login"
                onClick={() => setOpen(false)}
              >
                <ListItemText primary="Đăng Nhập" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}