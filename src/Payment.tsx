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
  const [showQR, setShowQR] = useState(false);

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

    // Nếu là ngân hàng mà chưa hiện QR thì hiện QR trước
    if (selectedMethod === "Bank" && !showQR) {
      setShowQR(true);
      return;
    }

    setPaying(true);
    try {
      const res = await fetch(`https://localhost:7031/api/Payments/checkout/${id}`, {
        // ... (keep rest unchanged)
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
        {/* Nút quay lại gọi thêm (Dành cho mô hình ăn xong mới trả) */}
        {!isPaid && (
          <div className="px-6 pb-6 text-center">
            {/* Truyền thêm orderId lên URL để trang Menu biết là đang thêm món */}
            <button 
              onClick={() => navigate(`/menupage?orderId=${id}`)} 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-orange-100 hover:text-orange-600 transition duration-200"
            >
              + Trở về Menu để gọi thêm món
            </button>
          </div>
        )}
      </div>

      {/* QR MODAL */}
      {showQR && order && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Quét mã VietQR</h3>
              <button
                onClick={() => setShowQR(false)}
                className="hover:bg-orange-700 p-1 rounded-full transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 mb-6">
                {/* Ảnh QR của khách hàng */}
                <img
                  src="/src/assets/payments/vietcombank_qr.jpg"
                  alt="Vietcombank QR"
                  className="w-64 h-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    // Fallback nếu chưa có ảnh
                    (e.target as HTMLImageElement).src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" +
                      encodeURIComponent(`STK: 1033995988, Chu TK: NGUYEN QUANG LAM, Noi dung: ${order.orderCode}, So tien: ${order.totalAmount}`);
                  }}
                />
              </div>

              <div className="w-full space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <span className="font-bold text-gray-800 uppercase">NGUYEN QUANG LAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tài khoản:</span>
                  <span className="font-bold text-gray-800">1033995988</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-orange-600 animate-pulse">{order.totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nội dung:</span>
                  <span className="font-bold text-blue-600">{order.orderCode}</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition shadow-lg shadow-orange-100"
              >
                {paying ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                XÁC NHẬN ĐÃ CHUYỂN
              </button>

              <button
                onClick={() => setShowQR(false)}
                className="mt-4 text-gray-400 text-sm hover:text-gray-600"
              >
                Quay lại
              </button>



            </div>
          </div>
        </div>
      )}
    </div>
  );
}