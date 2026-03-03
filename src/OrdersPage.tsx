import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type {
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import dayjs from "dayjs";

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
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const result = orders.filter((order) =>
      order.orderCode.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredOrders(result);
  }, [search, orders]);

  const formatMoney = (value: number) =>
    value?.toLocaleString("vi-VN") + " ₫";

  const columns: GridColDef<Order>[] = [
    {
      field: "orderCode",
      headerName: "Order Code",
      flex: 1,
    },

    {
      field: "orderType",
      headerName: "Type",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Order>) => {
        const value = (params.value as string) ?? "";
        return (
          <Chip
            label={value}
            color={value === "takeaway" ? "info" : "success"}
            size="small"
          />
        );
      },
    },

    {
      field: "totalAmount",
      headerName: "Total",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Order>) =>
        formatMoney((params.value as number) ?? 0),
    },

    {
      field: "totalItems",
      headerName: "Items",
      flex: 0.7,
    },

    {
      field: "paymentStatus",
      headerName: "Payment",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Order>) => {
        const value = (params.value as string) ?? "";
        return (
          <Chip
            label={value}
            color={value === "paid" ? "success" : "warning"}
            size="small"
          />
        );
      },
    },

    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<Order>) =>
        dayjs(params.value as string).format("DD/MM/YYYY HH:mm"),
    },

    {
      field: "customerName",
      headerName: "Customer",
      flex: 1,
      valueGetter: (_, row) => row.customerName ?? "-",
    },

    {
      field: "staffName",
      headerName: "Staff",
      flex: 1,
      valueGetter: (_, row) => row.staffName ?? "-",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f4f6f9",
        p: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Quản lý đơn hàng
      </Typography>

      <TextField
        label="Search by Order Code"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            height: 600,
            background: "white",
            borderRadius: 4,
            boxShadow: 3,
          }}
        >
          <DataGrid
            rows={filteredOrders}
            columns={columns}
            getRowId={(row) => row.orderId}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      )}
    </Box>
  );
};

export default OrdersPage;