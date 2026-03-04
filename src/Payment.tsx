import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, CreditCard, Banknote, Loader2 } from "lucide-react"; // Cài thêm lucide-react nếu chưa có

// ... (Giữ nguyên các interface Topping, OrderItem, Order của bạn) ...

interface Topping {
  toppingId: number;
  toppingName: string;
  price: number;
}

interface OrderItem {
  orderDetailId: number;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  toppings: Topping[];
  toppingTotal: number;
  lineTotal: number;
  voiceNote?: string;
}

interface Order {
  orderId: number;
  orderCode: string;
  tableName: string;
  staffName: string;
  items: OrderItem[];
  subTotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("Cash"); // Khớp với enum backend thường là Capitalize
  const [paying, setPaying] = useState(false);

  // --- FETCH ORDER ---
  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://localhost:7031/api/Orders/${id}`);
        if (!res.ok) throw new Error("Không tải được đơn hàng");
        const data = await res.json();
        setOrder(data);
        // Nếu backend trả về paymentMethod đã lưu, ưu tiên dùng nó
        if (data.paymentMethod) setSelectedMethod(data.paymentMethod);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // --- HANDLE PAY ---
  const handlePay = async () => {
    if (!id) return;
    setPaying(true);
    try {
      const res = await fetch(`https://localhost:7031/api/Payments/checkout/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: selectedMethod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Thanh toán lỗi");

      // Cập nhật trạng thái ngay tại trang này để hiển thị thành công
      setOrder(prev => prev ? { ...prev, paymentStatus: "Paid" } : null);
      alert("Thanh toán thành công! Cảm ơn quý khách.");

      // Sau 2 giây thì về trang chủ hoặc trang cảm ơn
      setTimeout(() => navigate("/menupage"), 2000);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  // --- RENDER HELPERS ---
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>;

  if (error) return (
    <div className="p-8 text-center">
      <h3 className="text-red-500 font-bold mb-4">{error}</h3>
      <button onClick={() => navigate("/menupage")} className="bg-gray-200 px-4 py-2 rounded">Về trang chủ</button>
    </div>
  );

  if (!order) return null;

  const isPaid = order.paymentStatus === "Paid" || order.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
          <button onClick={() => navigate("/menupage")} className="hover:bg-orange-700 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Xác nhận thanh toán</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* INFO SECTION */}
        <div className="p-6 border-b bg-orange-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Mã đơn:</span>
            <span className="font-mono font-bold text-gray-800">#{order.orderCode}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bàn:</span>
            <span className="font-bold text-gray-800">{order.tableName}</span>
          </div>
          {/* Trạng thái thanh toán */}
          <div className="mt-4 flex justify-center">
            <span className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isPaid ? <CheckCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
              {isPaid ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}
            </span>
          </div>
        </div>

        {/* ORDER ITEMS LIST */}
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {order.items.map((item) => (
            <div key={item.orderDetailId} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
              <div className="flex gap-3">
                <div className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded font-bold text-gray-600 text-sm">
                  {item.quantity}x
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{item.productName}</h4>
                  <p className="text-sm text-gray-500">{item.variantName}</p>
                  {item.toppings.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      + {item.toppings.map(t => t.toppingName).join(", ")}
                    </p>
                  )}
                  {item.voiceNote && <p className="text-xs italic text-gray-400 mt-1">"{item.voiceNote}"</p>}
                </div>
              </div>
              <div className="font-medium text-gray-800">
                {item.lineTotal.toLocaleString()}đ
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL SECTION */}
        <div className="p-6 bg-gray-50 border-t space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span>{order.subTotal?.toLocaleString() || 0}đ</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-orange-600 pt-2 border-t border-gray-200">
            <span>Tổng cộng</span>
            <span>{order.totalAmount.toLocaleString()}đ</span>
          </div>
        </div>

        {/* PAYMENT METHODS (Chỉ hiện khi chưa thanh toán) */}
        {!isPaid && (
          <div className="p-6 pt-2">
            <h3 className="font-bold text-gray-700 mb-3">Phương thức thanh toán</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedMethod("Cash")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${selectedMethod === "Cash" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 hover:bg-gray-50"}`}
              >
                <Banknote className="w-6 h-6" />
                <span className="font-medium">Tiền mặt</span>
              </button>
              <button
                onClick={() => setSelectedMethod("Bank")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${selectedMethod === "Bank" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 hover:bg-gray-50"}`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-medium">Chuyển khoản</span>
              </button>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:bg-gray-400 transition shadow-lg shadow-orange-200"
            >
              {paying ? "Đang xử lý..." : `Thanh toán ${order.totalAmount.toLocaleString()}đ`}
            </button>
          </div>
        )}

        {/* Nút quay lại gọi thêm (Dành cho mô hình ăn xong mới trả) */}
        {!isPaid && (
          <div className="px-6 pb-6 text-center">
            <button onClick={() => navigate("/menupage")} className="text-sm text-gray-500 hover:text-orange-600 underline">
              Quay lại gọi thêm món
            </button>
          </div>
        )}
      </div>
    </div>
  );
}