import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// 1. Khai báo Interface Order chuẩn chỉ
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
  paymentStatus: string; // 'paid' | 'unpaid'
  createdAt: string;
  totalItems: number;
}

const OrdersPage: React.FC = () => {
  // 2. Ép kiểu cho các state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Có thể ép kiểu response data trả về từ axios
        const response = await axios.get<Order[]>('https://localhost:7031/api/Orders/GetAllOrders');
        setOrders(response.data);
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase());
      const orderDate = order.createdAt.split('T')[0];
      const matchDate = filterDate ? orderDate === filterDate : true;

      return matchSearch && matchDate;
    });
  }, [orders, searchTerm, filterDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const formatCurrency = (amount: number): string => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string): string => 
    new Date(dateString).toLocaleString('vi-VN');

  const getStatusStyle = (status: string): string => {
    if (status?.toLowerCase() === 'paid') return 'bg-green-100 text-green-700 border-green-300';
    if (status?.toLowerCase() === 'unpaid') return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold text-lg">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Đơn hàng</h2>

      {/* Thanh công cụ */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 gap-4">
        <div className="w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Tìm theo mã đơn (vd: ORD-...)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            // Khai báo type cho event (e)
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/4">
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-600"
            value={filterDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
              <th className="px-6 py-4 font-semibold">Mã Đơn</th>
              <th className="px-6 py-4 font-semibold">Loại / Bàn</th>
              <th className="px-6 py-4 font-semibold">Khách Hàng</th>
              <th className="px-6 py-4 font-semibold text-center">SL Món</th>
              <th className="px-6 py-4 font-semibold">Tổng Tiền</th>
              <th className="px-6 py-4 font-semibold text-center">Trạng Thái</th>
              <th className="px-6 py-4 font-semibold">Thời Gian Tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy đơn hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              currentItems.map((order: Order) => (
                <tr key={order.orderId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-blue-600">{order.orderCode}</td>
                  <td className="px-6 py-4">
                    <span className="block text-sm">
                      {order.orderType === 'dine_in' ? '🍽️ Tại quán' : '🛍️ Mang đi'}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{order.tableName || ''}</span>
                  </td>
                  <td className="px-6 py-4">
                    {order.customerName ? (
                      <div>
                        <span className="block font-medium">{order.customerName}</span>
                        <span className="text-sm text-gray-500">{order.customerPhone}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Khách vãng lai</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">{order.totalItems}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border inline-block min-w-[100px] text-center ${getStatusStyle(order.paymentStatus)}`}>
                      {order.paymentStatus?.toLowerCase() === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
          <span className="text-sm text-gray-600">
            Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> đến <strong>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> trong tổng số <strong>{filteredOrders.length}</strong> đơn hàng
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Trang trước
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;