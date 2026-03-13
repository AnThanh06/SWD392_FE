import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle, 
  Utensils, 
  AlertCircle,
  History, 
  X,
  PlayCircle
} from 'lucide-react';

// --- 1. Định nghĩa kiểu dữ liệu ---
type ItemStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';

interface KitchenItem {
  orderDetailId: number;
  productName: string;
  quantity: number;
  status: ItemStatus;
  note: string | null;
  toppings: string[];
}

interface KitchenOrder {
  orderId: number;
  tableName: string;
  orderTime: string;
  items: KitchenItem[];
}

interface HistoryItem extends KitchenItem {
  orderId: number;
  tableName: string;
  orderTime: string;
}

const KitchenPage = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const API_BASE_URL = "https://localhost:7031/api/Kitchen";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  // --- 2. API Lấy đơn hàng ---
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

  // --- 3. API Lấy Lịch sử ---
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get<KitchenOrder[]>(`${API_BASE_URL}/all-orders`);
      
      const servedList: HistoryItem[] = [];
      response.data.forEach(order => {
        order.items.forEach(item => {
          if (item.status === 'served') {
            servedList.push({
              ...item,
              orderId: order.orderId,
              tableName: order.tableName,
              orderTime: order.orderTime
            });
          }
        });
      });

      setHistoryItems(servedList);
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
      alert("Không thể tải lịch sử món ăn.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory]);

  // --- 4. Cập nhật trạng thái ---
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

      await axios.put(`${API_BASE_URL}/update-status/${itemId}`, { 
        status: newStatus 
      });

    } catch (err) {
      alert("Lỗi cập nhật trạng thái! Vui lòng thử lại.");
      fetchOrders();  
    }
  };

  // Style quy định cho từng trạng thái
  const getStatusStyles = (status: ItemStatus) => {
    switch (status) {
      case 'pending': 
        return {
          card: 'border-l-4 border-l-amber-400 bg-amber-50/30 hover:bg-amber-50/60',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          badgeText: 'Chờ nấu'
        };
      case 'cooking': 
        return {
          card: 'border-l-4 border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/60',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          badgeText: 'Đang nấu'
        };
      case 'ready': 
        return {
          card: 'border-l-4 border-l-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          badgeText: 'Đã xong'
        };
      default: 
        return { card: 'bg-white', badge: 'bg-gray-100', badgeText: '' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative pb-10">
      
      {/* --- HEADER (Dính trên cùng - Sticky) --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-4 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-2.5 rounded-xl shadow-inner cursor-pointer hover:scale-105 transition-transform">
            <ChefHat className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Màn Hình Bếp</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Đồng bộ dữ liệu thời gian thực</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <History className="h-4 w-4 text-slate-500" />
            <span className="hidden md:inline">Lịch món đã phục vụ</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="px-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {orders.length === 0 && !loading && !error ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400">
              <div className="bg-slate-100 p-6 rounded-full mb-5">
                <Utensils className="h-16 w-16 text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-500 tracking-tight">Bếp đang rảnh rỗi</p>
              <p className="text-slate-400 mt-2">Chưa có đơn hàng nào cần xử lý lúc này.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                
                {/* Card Header */}
                <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center border-b border-slate-700">
                  <span className="font-bold text-lg tracking-wide">{order.tableName}</span>
                  <div className="flex items-center text-xs font-medium bg-slate-700/50 px-2.5 py-1 rounded-md gap-1.5 border border-slate-600 backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-orange-400" />
                    {order.orderTime}
                  </div>
                </div>

                {/* Card Body (Món ăn) */}
                <div className="p-4 flex-1 space-y-4 bg-slate-50/50">
                  {order.items.map((item) => {
                    const styles = getStatusStyles(item.status);
                    return (
                      <div key={item.orderDetailId} className={`p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 ${styles.card}`}>
                        
                        {/* Tên & Trạng thái */}
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-black text-xl text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded-md">
                                    {item.quantity}
                                  </span>
                                  <span className="font-bold text-lg text-slate-700 leading-tight">
                                    {item.productName}
                                  </span>
                                </div>
                            </div>
                            <span className={`text-[11px] uppercase font-bold px-2.5 py-1 rounded-md border tracking-wider whitespace-nowrap flex-shrink-0 ${styles.badge}`}>
                                {styles.badgeText}
                            </span>
                        </div>

                        {/* Toppings */}
                        {item.toppings && item.toppings.length > 0 && (
                            <div className="mt-2.5 pl-10 text-sm text-slate-500 font-medium">
                                {item.toppings.map((top, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div> 
                                        {top}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Ghi chú */}
                        {item.note && (
                          <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 font-medium flex gap-2">
                            <span className="font-bold">Ghi chú:</span> {item.note}
                          </div>
                        )}

                        {/* Nút hành động */}
                        <div className="mt-4">
                            {item.status === 'pending' && (
                               <button 
                                 onClick={() => handleUpdateStatus(item.orderDetailId, 'cooking')}
                                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                               >
                                 <PlayCircle className="h-4 w-4" /> BẮT ĐẦU NẤU
                               </button>
                            )}
                            
                            {item.status === 'cooking' && (
                               <button 
                                 onClick={() => handleUpdateStatus(item.orderDetailId, 'ready')}
                                 className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                               >
                                 <CheckCircle className="h-4 w-4" /> BÁO XONG
                               </button>
                            )}

                            {item.status === 'ready' && (
                               <button 
                                 onClick={() => handleUpdateStatus(item.orderDetailId, 'served')}
                                 className="w-full bg-slate-200 hover:bg-slate-300 text-slate-600 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                               >
                                 Đã phục vụ (Ẩn)
                               </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL LỊCH SỬ --- */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <History className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Lịch sử món đã bưng</h2>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                  <span className="text-slate-500 font-medium">Đang tải lịch sử...</span>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="text-center py-20">
                  <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Chưa có món nào hoàn thành trong ca này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                      <div className="flex gap-5 items-center">
                        <div className="bg-slate-800 text-white font-black px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-sm">
                          {item.tableName}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-base">{item.quantity}</span> 
                            {item.productName}
                          </p>
                          {item.toppings.length > 0 && (
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              + {item.toppings.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.orderTime}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Đã phục vụ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button 
                onClick={() => setShowHistory(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KitchenPage;