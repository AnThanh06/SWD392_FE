import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Visibility, Print } from "@mui/icons-material"; // Import thêm icon
import dayjs from "dayjs";

// --- Types ---
interface Order {
  orderId: number;
  orderCode: string;
  orderType: string;
  tableName: string | null;
  staffName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryStatus: string | null;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  totalItems: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Order[]>(
        "https://localhost:7031/api/Orders/GetAllOrders"
      );
      // Sắp xếp đơn mới nhất lên đầu
      const sortedData = res.data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
      setFilteredOrders(sortedData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Cải tiến: Tìm kiếm đa năng (Mã, Tên khách, Tên bàn) ---
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const result = orders.filter((order) =>
      (order.orderCode?.toLowerCase() || "").includes(lowerSearch) ||
      (order.customerName?.toLowerCase() || "").includes(lowerSearch) ||
      (order.tableName?.toLowerCase() || "").includes(lowerSearch)
    );
    setFilteredOrders(result);
  }, [search, orders]);

  const formatMoney = (value: number) =>
    value?.toLocaleString("vi-VN", { style: 'currency', currency: 'VND' });

  // --- Columns Definitions ---
  const columns: GridColDef<Order>[] = [
    { field: "orderCode", headerName: "Mã đơn", flex: 0.8, minWidth: 100 },

    // 1. Thêm cột Bàn
    {
      field: "tableName",
      headerName: "Bàn / Loại",
      flex: 1,
      renderCell: (params) => {
        const type = params.row.orderType;
        const tableName = params.value;
        if (type === 'takeaway') return <Chip label="Mang về" size="small" color="info" variant="outlined" />;
        return <Typography variant="body2" fontWeight="bold">{tableName || "Tại bàn"}</Typography>;
      }
    },

    {
      field: "totalAmount",
      headerName: "Tổng tiền",
      flex: 1,
      renderCell: (params) => (
        <Typography color="primary.main" fontWeight="600">
          {formatMoney(params.value)}
        </Typography>
      ),
    },
    { field: "totalItems", headerName: "SL Món", flex: 0.5, align: 'center', headerAlign: 'center' },

    {
      field: "paymentStatus",
      headerName: "Thanh toán",
      flex: 1,
      renderCell: (params) => {
        const status = params.value as string;
        let color: "success" | "warning" | "error" | "default" = "default";
        let label = status;

        if (status === "paid") { color = "success"; label = "Đã TT"; }
        else if (status === "pending") { color = "warning"; label = "Chờ TT"; }
        else if (status === "cancelled") { color = "error"; label = "Hủy"; }

        return <Chip label={label} color={color} size="small" />;
      },
    },

    {
        field: "staffName",
        headerName: "Nhân viên",
        flex: 1,
        valueGetter: (_, row) => row.staffName ?? "-",
    },

    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1.2,
      valueFormatter: (params) => dayjs(params.value).format("DD/MM/YYYY HH:mm"),
    },

    // 2. Thêm cột Hành động (Quan trọng nhất)
    // {
    //   field: "actions",
    //   headerName: "Hành động",
    //   flex: 0.8,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Box>
    //       <Tooltip title="Xem chi tiết">
    //         <IconButton 
    //           color="primary" 
    //           size="small"
    //           onClick={() => {
    //             // Logic mở Dialog chi tiết hoặc navigate
    //             console.log("View details ID:", params.row.orderId);
    //             // navigate(`/orders/${params.row.orderId}`);
    //           }}
    //         >
    //           <Visibility fontSize="small" />
    //         </IconButton>
    //       </Tooltip>
          
    //       <Tooltip title="In hóa đơn">
    //          <IconButton color="secondary" size="small">
    //             <Print fontSize="small" />
    //          </IconButton>
    //       </Tooltip>
    //     </Box>
    //   ),
    // },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: "#f4f6f9", p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3} color="text.primary">
        Quản lý đơn hàng
      </Typography>

      <Box sx={{ mb: 3, background: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
        <TextField
          label="Tìm kiếm (Mã đơn, Tên khách, Tên bàn)"
          variant="outlined"
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ví dụ: ORD001, Bàn 5..."
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, background: "white", borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>
          <DataGrid
            rows={filteredOrders}
            columns={columns}
            getRowId={(row) => row.orderId}
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
            sx={{
                '& .MuiDataGrid-columnHeader': {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 'bold',
                },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default OrdersPage;