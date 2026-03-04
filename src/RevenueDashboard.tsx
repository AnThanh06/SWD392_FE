import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

// --- INTERFACES ---
interface MonthlyRevenue {
  year: number;
  month: number;
  totalRevenue: number;
  paidOrderCount: number;
}

interface DailyRevenue {
  date: string;
  totalRevenue: number;
  paidOrderCount: number;
}

const RevenueDashboard: React.FC = () => {
  const [tab, setTab] = useState(0); // 0: Monthly, 1: Daily
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue | null>(null);
  const [dailyData, setDailyData] = useState<DailyRevenue | null>(null);
  const [loading, setLoading] = useState(false);

  // Format tiền tệ Việt Nam
  const formatMoney = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // --- API CALLS ---
  const fetchMonthly = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://localhost:7031/api/Payments/revenue/monthly",
        { params: { year, month } }
      );
      setMonthlyData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://localhost:7031/api/Payments/revenue/daily",
        { params: { date } }
      );
      setDailyData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 0) fetchMonthly();
    else fetchDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, year, month, date]);

  // --- RENDER HELPERS ---
  
  // Custom Tab Button
  const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 text-sm font-semibold transition-colors duration-200 border-b-2
        ${isActive 
          ? "border-blue-600 text-blue-600" 
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }
      `}
    >
      {label}
    </button>
  );

  // Custom Input Field
  const InputField = ({ label, type, value, onChange }: any) => (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );

  // Summary Card Component
  const SummaryCard = ({ title, value, colorClass, borderColor }: any) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Báo Cáo Doanh Thu
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Theo dõi hiệu quả kinh doanh chi tiết theo thời gian thực
            </p>
          </div>
          <div className="bg-white border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
            Hôm nay: {dayjs().format("DD/MM/YYYY")}
          </div>
        </div>

        {/* --- CONTROLS SECTION --- */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 mb-8 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-2 bg-gray-50/30">
            <TabButton label="Theo Tháng" isActive={tab === 0} onClick={() => setTab(0)} />
            <TabButton label="Theo Ngày" isActive={tab === 1} onClick={() => setTab(1)} />
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end max-w-2xl">
              {tab === 0 ? (
                <>
                  <InputField 
                    label="Năm" 
                    type="number" 
                    value={year} 
                    onChange={(e: any) => setYear(Number(e.target.value))} 
                  />
                  <InputField 
                    label="Tháng" 
                    type="number" 
                    value={month} 
                    onChange={(e: any) => setMonth(Number(e.target.value))} 
                  />
                </>
              ) : (
                <InputField 
                  label="Chọn Ngày" 
                  type="date" 
                  value={date} 
                  onChange={(e: any) => setDate(e.target.value)} 
                />
              )}
            </div>
          </div>
        </div>

        {/* --- LOADING STATE --- */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* --- CONTENT SECTION --- */}
        {!loading && (
          <>
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SummaryCard 
                title="Tổng Doanh Thu" 
                value={tab === 0 ? formatMoney(monthlyData?.totalRevenue || 0) : formatMoney(dailyData?.totalRevenue || 0)} 
                colorClass="text-blue-600"
                borderColor="border-blue-500"
              />
              <SummaryCard 
                title="Đơn Đã Thanh Toán" 
                value={tab === 0 ? monthlyData?.paidOrderCount : dailyData?.paidOrderCount} 
                colorClass="text-emerald-600"
                borderColor="border-emerald-500"
              />
            </div>

            {/* 2. Chart Section */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ tăng trưởng</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: tab === 0 ? `Tháng ${month}/${year}` : dayjs(dailyData?.date).format("DD/MM/YYYY"),
                        revenue: tab === 0 ? (monthlyData?.totalRevenue || 0) : (dailyData?.totalRevenue || 0),
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: number) => [formatMoney(value), "Doanh thu"]}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill={tab === 0 ? "#2563eb" : "#059669"} // Blue for Month, Green for Day
                      barSize={60}
                      radius={[6, 6, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;