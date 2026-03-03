import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  // ================= FETCH ORDER =================
  useEffect(() => {
    if (!id) {
      setError("Không có OrderId");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `http://localhost:5121/api/Orders/${id}`
        );

        if (!res.ok) {
          throw new Error("Không tìm thấy đơn hàng");
        }

        const data = await res.json();
        setOrder(data);

        // set mặc định theo order hiện tại
        if (data.paymentMethod) {
          setSelectedMethod(data.paymentMethod);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // ================= HANDLE PAY =================
  const handlePay = async () => {
  if (!id) return;

  setPaying(true);

  try {
    const res = await fetch(
      `http://localhost:5121/api/Payments/checkout/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentMethod: selectedMethod
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Thanh toán thất bại");
    }

    alert("Thanh toán thành công");

    // 🔥 CHUYỂN TRANG SAU KHI THANH TOÁN
    navigate("/payment");

  } catch (err: any) {
    alert(err.message);
  } finally {
    setPaying(false);
  }
};

  // ================= RENDER =================

  if (loading)
    return (
      <div style={{ padding: "30px" }}>
        <h3>Đang tải đơn hàng...</h3>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "30px", color: "red" }}>
        <h3>Lỗi: {error}</h3>
        <button onClick={() => navigate("/payment")}>
          Quay lại
        </button>
      </div>
    );

  if (!order)
    return (
      <div style={{ padding: "30px" }}>
        <h3>Không có dữ liệu đơn hàng</h3>
      </div>
    );

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
      <h2>Thanh toán - {order.orderCode}</h2>
      <p><b>Bàn:</b> {order.tableName}</p>
      <p><b>Nhân viên:</b> {order.staffName}</p>

      <hr />

      {order.items.map(item => (
        <div
          key={item.orderDetailId}
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px"
          }}
        >
          <strong>
            {item.productName} ({item.variantName})
          </strong>

          <p>Số lượng: {item.quantity}</p>
          <p>Giá: {item.unitPrice.toLocaleString()} đ</p>

          {item.toppings.length > 0 && (
            <div>
              <p><b>Topping:</b></p>
              <ul>
                {item.toppings.map(t => (
                  <li key={t.toppingId}>
                    {t.toppingName} (+{t.price.toLocaleString()} đ)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.voiceNote && (
            <p><b>Ghi chú:</b> {item.voiceNote}</p>
          )}

          <p>
            <b>Thành tiền: {item.lineTotal.toLocaleString()} đ</b>
          </p>
        </div>
      ))}

      <hr />

      <h3>Tổng tiền: {order.totalAmount.toLocaleString()} đ</h3>

      <p>
        Trạng thái:{" "}
        <span
          style={{
            color: order.paymentStatus === "paid" ? "green" : "red",
            fontWeight: "bold"
          }}
        >
          {order.paymentStatus}
        </span>
      </p>

      {/* ===== CHỌN PHƯƠNG THỨC ===== */}
      {order.paymentStatus !== "paid" && (
        <>
          <div style={{ marginTop: "20px" }}>
            <h4>Chọn phương thức thanh toán</h4>

            <label style={{ marginRight: "20px" }}>
              <input
                type="radio"
                value="cash"
                checked={selectedMethod === "cash"}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              {" "}Tiền mặt
            </label>

            <label>
              <input
                type="radio"
                value="bank"
                checked={selectedMethod === "bank"}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              {" "}Chuyển khoản
            </label>
          </div>

          <button
            onClick={handlePay}
            disabled={paying}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: paying ? "gray" : "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: paying ? "not-allowed" : "pointer"
            }}
          >
            {paying ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </>
      )}
    </div>
  );
}