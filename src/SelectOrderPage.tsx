import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 1. Cập nhật Interface thêm các trường cần thiết
interface Order {
  orderId: number;
  orderCode: string;
  orderType: string;
  tableName: string | null;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  totalItems: number;
}

export default function SelectOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Chuyển sang dùng axios cho đồng bộ với dự án
    axios.get<Order[]>("https://localhost:7031/api/Orders/GetAllOrders")
      .then(response => {
        // Lọc ngay các đơn CHƯA THANH TOÁN
        const unpaidOrders = response.data.filter(
          (o) => o.paymentStatus === "unpaid"
        );
        setOrders(unpaidOrders);
      })
      .catch(error => console.error("Lỗi khi lấy dữ liệu:", error))
      .finally(() => setLoading(false));
  }, []);

  // Hàm tiện ích format dữ liệu
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách đơn...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn đơn hàng để thanh toán</h2>

      {orders.length === 0 && (
        <div className="text-center p-10 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg">Hiện không có đơn nào cần thanh toán 🎉</p>
        </div>
      )}

      {/* Hiển thị dạng lưới (Grid) các Card đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <div
            key={order.orderId}
            onClick={() => navigate(`/payment/${order.orderId}`)}
            className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-400 transition duration-200 relative"
          >
            {/* Badge Chưa thanh toán */}
            <span className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              Chưa thanh toán
            </span>

            <div className="mb-3">
              <h4 className="text-lg font-bold text-blue-600">{order.orderCode}</h4>
              <p className="text-sm text-gray-500">
                Tạo lúc: <span className="font-medium text-gray-700">{formatTime(order.createdAt)}</span>
              </p>
            </div>

            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="bg-gray-100 px-3 py-1 rounded-md text-gray-700 font-medium">
                {order.orderType === "dine_in" ? `🍽️ ${order.tableName}` : "🛍️ Mang đi"}
              </span>
              <span className="text-gray-600">
                {order.totalItems} món
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
              <span className="text-gray-500 text-sm">Tổng tiền:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}