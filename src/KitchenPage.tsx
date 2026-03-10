import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RefreshCw, 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle, 
  Utensils, 
  AlertCircle 
} from 'lucide-react';

// --- 1. Định nghĩa kiểu dữ liệu (Khớp với JSON backend trả về) ---
type ItemStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';

interface KitchenItem {
  orderDetailId: number;
  productName: string;
  quantity: number;
  status: ItemStatus;
  note: string | null;
  toppings: string[]; // Mảng tên topping
}

interface KitchenOrder {
  orderId: number;
  tableName: string;
  orderTime: string;
  items: KitchenItem[];
}

const KitchenPage = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cấu hình URL API
  const API_BASE_URL = "https://localhost:7031/api/Kitchen";

  // --- 2. Hàm gọi API lấy danh sách ---
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<KitchenOrder[]>(`${API_BASE_URL}/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setError("Không thể kết nối đến Server Bếp.");
    } finally {
      setLoading(false);
    }
  };

  // Tự động refresh mỗi 15 giây
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); 
    return () => clearInterval(interval);
  }, []);

  // --- 3. Hàm xử lý chuyển trạng thái ---
  const handleUpdateStatus = async (itemId: number, newStatus: ItemStatus) => {
    try {
      setOrders(prevOrders => prevOrders.map(order => ({
        ...order,
        items: order.items.map(item => {
            if (item.orderDetailId === itemId) {
                return { ...item, status: newStatus };
            }
            return item;
        }).filter(item => item.status !== 'served') 
      })).filter(order => order.items.length > 0)); 

      // b. Gọi API thực sự
      await axios.put(`${API_BASE_URL}/update-status/${itemId}`, { 
        status: newStatus 
      });


    } catch (err) {
      alert("Lỗi cập nhật trạng thái! Vui lòng thử lại.");
      fetchOrders(); 
    }
  };

  // Helper: Màu sắc theo trạng thái
  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'pending': return 'border-l-4 border-l-gray-400 bg-gray-50';
      case 'cooking': return 'border-l-4 border-l-blue-500 bg-blue-50';
      case 'ready': return 'border-l-4 border-l-green-500 bg-green-50';
      default: return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <ChefHat className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Màn Hình Bếp</h1>
            <p className="text-sm text-gray-500">Quản lý món ăn theo thời gian thực</p>
          </div>
        </div>
        
        {/* <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md active:scale-95"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button> */}
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
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Utensils className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-xl font-medium">Hiện tại bếp đang rảnh rỗi</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-200">
              
              {/* Card Header: Tên bàn & Giờ */}
              <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                <span className="font-bold text-lg">{order.tableName}</span>
                <div className="flex items-center text-sm bg-gray-700 px-2 py-1 rounded gap-1">
                  <Clock className="h-4 w-4 text-orange-400" />
                  {order.orderTime}
                </div>
              </div>

              {/* List Items */}
              <div className="p-3 flex-1 space-y-3 bg-gray-50/50">
                {order.items.map((item) => (
                  <div 
                    key={item.orderDetailId} 
                    className={`p-3 rounded-lg shadow-sm bg-white border border-gray-200 ${getStatusColor(item.status)} transition-all duration-200`}
                  >
                    {/* Tên món & Số lượng */}
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-extrabold text-xl text-gray-800 mr-2">
                                {item.quantity}
                            </span>
                            <span className="font-semibold text-lg text-gray-700">
                                {item.productName}
                            </span>
                        </div>
                        {/* Badge trạng thái nhỏ */}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border 
                            ${item.status === 'pending' ? 'bg-gray-100 text-gray-500 border-gray-300' : 
                              item.status === 'cooking' ? 'bg-blue-100 text-blue-600 border-blue-200' : 
                              'bg-green-100 text-green-600 border-green-200'}`}>
                            {item.status === 'pending' ? 'Chờ' : item.status === 'cooking' ? 'Đang nấu' : 'Xong'}
                        </span>
                    </div>

                    {/* Toppings (Nếu có) */}
                    {item.toppings && item.toppings.length > 0 && (
                        <div className="mt-1 pl-6 text-sm text-gray-600">
                            {item.toppings.map((top, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                    <span className="text-xs text-gray-400">+</span> {top}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ghi chú (Nếu có) */}
                    {item.note && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-1.5 rounded border border-red-100 italic">
                        " {item.note} "
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 grid grid-cols-1 gap-2">
                        {item.status === 'pending' && (
                           <button 
                             onClick={() => handleUpdateStatus(item.orderDetailId, 'cooking')}
                             className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                           >
                             <Flame className="h-4 w-4" /> BẮT ĐẦU NẤU
                           </button>
                        )}
                        
                        {item.status === 'cooking' && (
                           <button 
                             onClick={() => handleUpdateStatus(item.orderDetailId, 'ready')}
                             className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                           >
                             <CheckCircle className="h-4 w-4" /> BÁO XONG
                           </button>
                        )}

                        {item.status === 'ready' && (
                           <button 
                             onClick={() => handleUpdateStatus(item.orderDetailId, 'served')}
                             className="w-full bg-gray-200 hover:bg-gray-300 text-gray-600 py-2 rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                           >
                             Đã phục vụ (Ẩn)
                           </button>
                        )}
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

export default KitchenPage;