import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MeetingRoom,
  Restaurant,
  AccessTime,
  ReceiptLong,
  Person,
  AttachMoney,
  Refresh
} from "@mui/icons-material"; // Vẫn dùng icon của MUI vì nó đẹp và tiện
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

// Cấu hình dayjs
dayjs.extend(relativeTime);
dayjs.locale("vi");

// --- INTERFACES ---
interface CurrentOrder {
  orderId: number;
  orderCode: string;
  orderType: string;
  tableName: string;
  staffName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryStatus: string | null;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  totalItems: number;
}

interface TableData {
  id: number;
  name: string;
  status: string; // "available" | "occupied" | "reserved"
  currentOrder: CurrentOrder | null;
}

const TablePage = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://localhost:7031/api/Tables/GetAllTable";

  const fetchTables = async () => {
    try {
      const response = await axios.get<TableData[]>(API_URL);
      setTables(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách bàn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 15000); // Refresh mỗi 15s
    return () => clearInterval(interval);
  }, []);

  // --- UTILS ---
  const getTimeInfo = (startTime: string) => {
    const start = dayjs(startTime);
    const diff = dayjs().diff(start, "minute");
    return `${start.format("HH:mm")} (${diff}p)`;
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const handleTableClick = (table: TableData) => {
    if (table.currentOrder) {
      console.log(`Mở chi tiết đơn hàng ID: ${table.currentOrder.orderId}`);
      // navigate(`/orders/${table.currentOrder.orderId}`);
    } else {
      console.log(`Tạo đơn mới cho bàn: ${table.id}`);
      // navigate(`/create-order?tableId=${table.id}`);
    }
  };

  // --- TAILWIND STYLING CONFIG ---
  // Hàm này trả về bộ class CSS dựa trên trạng thái
  const getStyleConfig = (table: TableData) => {
    const hasOrder = !!table.currentOrder;

    // 1. Đang có khách (Ưu tiên cao nhất)
    if (hasOrder) {
      return {
        card: "bg-orange-50 border-orange-200 hover:shadow-orange-100",
        text: "text-orange-700",
        subText: "text-orange-600/80",
        iconColor: "text-orange-500",
        statusLabel: "Đang phục vụ",
        Badge: <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">Đang ăn</span>
      };
    }

    // 2. Các trạng thái khác
    switch (table.status) {
      case "available":
        return {
          card: "bg-green-50 border-green-200 hover:shadow-green-100",
          text: "text-green-700",
          subText: "text-green-600/80",
          iconColor: "text-green-500",
          statusLabel: "Bàn trống",
          Badge: <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">Trống</span>
        };
      case "reserved":
        return {
          card: "bg-blue-50 border-blue-200 hover:shadow-blue-100",
          text: "text-blue-700",
          subText: "text-blue-600/80",
          iconColor: "text-blue-500",
          statusLabel: "Đặt trước",
          Badge: <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">Đặt trước</span>
        };
      default:
        return {
          card: "bg-gray-50 border-gray-200 hover:shadow-gray-100",
          text: "text-gray-700",
          subText: "text-gray-500",
          iconColor: "text-gray-400",
          statusLabel: "Khác",
          Badge: <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">N/A</span>
        };
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Sơ Đồ Bàn Ăn
          </h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý trạng thái bàn theo thời gian thực</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
           <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> Trống
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-md text-sm font-medium border border-orange-100">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div> Có khách
           </div>
           <button onClick={fetchTables} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
             <Refresh className="text-xl" />
           </button>
        </div>
      </div>

      {/* --- GRID TABLES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const config = getStyleConfig(table);
          const order = table.currentOrder;

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`
                relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
                hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[160px]
                ${config.card} bg-white
              `}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`text-lg font-bold ${config.text}`}>{table.name}</h3>
                    {/* Badge trạng thái */}
                    <div className="mt-1">{config.Badge}</div>
                </div>
                
                <div className={`${config.iconColor} opacity-80`}>
                    {order ? <Restaurant fontSize="large" /> : <MeetingRoom fontSize="large" />}
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-auto">
                {order ? (
                  <div className="space-y-2 pt-3 border-t border-dashed border-gray-300/50">
                    
                    {/* Tiền */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium uppercase">Tạm tính</span>
                        <div className="flex items-center gap-1 text-orange-600 font-bold text-base">
                            <AttachMoney sx={{ fontSize: 16 }} />
                            {formatMoney(order.totalAmount)}
                        </div>
                    </div>

                    {/* Thông tin phụ: Món & Giờ */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1 bg-white/50 p-1 rounded">
                            <ReceiptLong sx={{ fontSize: 14 }} />
                            <span>{order.totalItems} món</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/50 p-1 rounded">
                            <AccessTime sx={{ fontSize: 14 }} />
                            <span className="truncate">{getTimeInfo(order.createdAt)}</span>
                        </div>
                    </div>

                    {/* Nhân viên */}
                    {order.staffName && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <Person sx={{ fontSize: 12 }} />
                            <span className="truncate max-w-[100px]">{order.staffName}</span>
                        </div>
                    )}
                  </div>
                ) : (
                  // Bàn trống
                  <div className="pt-4 flex flex-col items-center justify-center text-center opacity-60">
                    <p className={`text-xs font-medium ${config.subText}`}>Sẵn sàng đón khách</p>
                    <span className="text-[10px] text-gray-400 mt-1">Nhấn để tạo đơn</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TablePage;