import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  TableRestaurant,
  ReceiptLong,
  Close as CloseIcon
} from "@mui/icons-material";

import Category from "@mui/icons-material/Category";
import Inventory2 from "@mui/icons-material/Inventory2";
import People from "@mui/icons-material/People";
import Restaurant from "@mui/icons-material/Restaurant";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Danh sách menu
  const menuItems = [
    { label: "Thông tin Doanh thu", icon: <DashboardIcon />, path: "/admin/revenuedashboard" },
    { label: "Quản lý Đơn hàng", icon: <ReceiptLong />, path: "/admin/orderspage" },
    { label: "Sơ đồ bàn", icon: <TableRestaurant />, path: "/admin/tablepage" },
    { label: "Category", icon: <Category />, path: "/admin/categorypage" },
    { label: "Sản Phẩm", icon: <Inventory2 />, path: "/admin/productpage" },
    { label: "Nhân Viên", icon: <People />, path: "/admin/staffs" },
    { label: "Nhà Bếp", icon: <Restaurant />, path: "/admin/kitchens" },
  ];

  const handleLogout = () =>{
    localStorage.removeItem("token")
    navigate ("/login")
  }

  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-100">
        <span className="text-2xl font-extrabold text-blue-600 tracking-wider">
          ADMIN
        </span>
      </div>

      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false); // Đóng menu nếu đang ở mobile
              }}
              className={`
                w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                ${isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <span className={`mr-3 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                {/* Clone icon để gán class size nếu cần, hoặc để nguyên */}
                {React.cloneElement(item.icon as React.ReactElement, { fontSize: "small" })}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout} // Gọi hàm handleLogout ở đây
          className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogoutIcon fontSize="small" className="mr-3" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <SidebarContent />
      </div>

      {/* ================= SIDEBAR (MOBILE) ================= */}
      {/* Backdrop mờ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Drawer trượt ra */}
      <div
        className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="relative h-full">
          {/* Nút đóng menu trên mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
          <SidebarContent />
        </div>
      </div>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex flex-col flex-1 md:pl-64 transition-all duration-300">

        {/* --- TOP HEADER --- */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">
            {/* Toggle Button (Mobile Only) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 text-gray-500 rounded-md md:hidden hover:bg-gray-100 focus:outline-none"
            >
              <MenuIcon />
            </button>

            {/* Breadcrumb / Title */}
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
              {menuItems.find((i) => i.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          {/* User Profile Area */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-700">Admin User</span>
              <span className="text-xs text-gray-500">Quản trị viên</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              A
            </div>
          </div>
        </header>

        {/* --- PAGE CONTENT (Outlet) --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;