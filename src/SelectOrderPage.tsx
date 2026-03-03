import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Order {
  orderId: number;
  orderCode: string;
  tableName: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function SelectOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5121/api/Orders")
      .then(res => res.json())
      .then(data => {
        const unpaidOrders = data.filter(
          (o: Order) => o.paymentStatus === "unpaid"
        );
        setOrders(unpaidOrders);
      });
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Chọn đơn hàng để thanh toán</h2>

      {orders.length === 0 && <p>Không có đơn chưa thanh toán</p>}

      {orders.map(order => (
        <div
          key={order.orderId}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
          onClick={() => navigate(`/payment/${order.orderId}`)}
        >
          <h4>Đơn #{order.orderCode}</h4>
          <p>Bàn: {order.tableName}</p>
          <p>Tổng tiền: {order.totalAmount.toLocaleString()} đ</p>
        </div>
      ))}
    </div>
  );
}