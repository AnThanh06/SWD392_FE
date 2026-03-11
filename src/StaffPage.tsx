import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BellRing, 
  Clock, 
  CheckCircle, 
  Coffee, 
  AlertCircle 
} from 'lucide-react';

type ItemStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';

interface OrderItem {
  orderDetailId: number;
  productName: string;
  quantity: number;
  status: ItemStatus;
  note: string | null;
  toppings: string[];
}

interface Order {
  orderId: number;
  tableName: string;
  orderTime: string;
  items: OrderItem[];
}

const StaffPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "https://localhost:7031/api/Kitchen"; 

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const response = await axios.get<Order[]>(`${API_BASE_URL}/orders`);
      
      const readyOrders = response.data
        .map(order => ({
          ...order,
          items: order.items.filter(item => item.status === 'ready')
        }))
        
        .filter(order => order.items.length > 0);

      setOrders(readyOrders);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setError("Không thể kết nối đến Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); 
    return () => clearInterval(interval);
  }, []);

  // --- 3. Hàm xử lý Staff bưng ra bàn (Ready -> Served) ---
  const handleServeItem = async (itemId: number) => {
    try {
      // a. Cập nhật UI ngay lập tức (Optimistic UI) cho mượt
      setOrders(prevOrders => prevOrders.map(order => ({
        ...order,
        // Loại bỏ món này khỏi danh sách vì đã phục vụ xong
        items: order.items.filter(item => item.orderDetailId !== itemId)
      })).filter(order => order.items.length > 0)); // Ẩn luôn card nếu bàn đó không còn món ready nào

      // b. Gọi API để update DB
      await axios.put(`${API_BASE_URL}/update-status/${itemId}`, { 
        status: 'served' 
      });

    } catch (err) {
      alert("Lỗi cập nhật trạng thái! Vui lòng thử lại.");
      fetchOrders();  // Rollback UI nếu API lỗi
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-4 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border-b-4 border-indigo-500">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <BellRing className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Khu Vực Chạy Bàn (Pass Area)</h1>
            <p className="text-sm text-gray-500">Các món đã nấu xong, chờ bưng ra khách</p>
          </div>
        </div>
      </div>

      {/* --- ERROR STATE --- */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {orders.length === 0 && !loading && !error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-indigo-300">
            <Coffee className="h-20 w-20 mb-4 opacity-50" />
            <p className="text-2xl font-medium text-indigo-400">Chưa có món nào hoàn thành từ bếp</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-indigo-100 ring-1 ring-black/5">
              
              {/* Card Header: Tên bàn & Giờ */}
              <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
                <span className="font-black text-xl tracking-wide">{order.tableName}</span>
                <div className="flex items-center text-sm bg-indigo-500 px-2 py-1 rounded gap-1 font-medium shadow-inner">
                  <Clock className="h-4 w-4 text-indigo-100" />
                  {order.orderTime}
                </div>
              </div>

              {/* List Items */}
              <div className="p-3 flex-1 space-y-3 bg-slate-50">
                {order.items.map((item) => (
                  <div 
                    key={item.orderDetailId} 
                    className="p-3 rounded-lg shadow-sm bg-white border-l-4 border-l-green-500 border border-gray-100 hover:shadow-md transition-all"
                  >
                    {/* Tên món & Số lượng */}
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-extrabold text-2xl text-indigo-600 mr-3">
                                x{item.quantity}
                            </span>
                            <span className="font-bold text-lg text-gray-800">
                                {item.productName}
                            </span>
                        </div>
                    </div>

                    {/* Toppings (Nếu có) */}
                    {item.toppings && item.toppings.length > 0 && (
                        <div className="mt-2 pl-2 text-sm text-gray-600 border-l-2 border-dashed border-gray-300 ml-2">
                            {item.toppings.map((top, idx) => (
                                <div key={idx} className="flex items-center gap-1 font-medium">
                                    <span className="text-gray-400">-</span> {top}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ghi chú */}
                    {item.note && (
                      <div className="mt-2 text-sm text-orange-700 bg-orange-50 p-2 rounded border border-orange-200 font-medium">
                        <span className="font-bold">Lưu ý:</span> {item.note}
                      </div>
                    )}

                    {/* Nút Action */}
                    <div className="mt-4">
                        <button 
                          onClick={() => handleServeItem(item.orderDetailId)}
                          className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                        >
                          <CheckCircle className="h-5 w-5" /> ĐÃ BƯNG RA BÀN
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffPage;