import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue | null>(null);
  const [dailyData, setDailyData] = useState<DailyRevenue | null>(null);
  const [loading, setLoading] = useState(false);

  const formatMoney = (value: number) =>
    value.toLocaleString("vi-VN") + " ₫";

  const fetchMonthly = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://localhost:7031/api/Payments/revenue/monthly",
        { params: { year, month } }
      );
      setMonthlyData(res.data);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 0) fetchMonthly();
    else fetchDaily();
  }, [tab, year, month, date]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.light}11, #f4f6fb)`,
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        {/* HEADER */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Thông tin doanh thu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo dõi hiệu quả kinh doanh theo tháng và theo ngày.
            </Typography>
          </Box>
          <Chip
            label={`Hôm nay: ${dayjs().format("DD/MM/YYYY")}`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        {/* TABS + FILTER */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 12px 40px rgba(15,23,42,0.12)",
            mb: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 3,
              pt: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Doanh thu theo tháng" />
              <Tab label="Doanh thu theo ngày" />
            </Tabs>
          </Box>

          <Box sx={{ px: 3, py: 3 }}>
            <Grid container spacing={2} alignItems="center">
              {tab === 0 ? (
                <>
                  <Grid item xs={6} sm={3} md={2.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Năm"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} md={2.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tháng"
                      type="number"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Ngày"
                    InputLabelProps={{ shrink: true }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Card>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* CONTENT */}
      {!loading && tab === 0 && monthlyData && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 2,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardContent>
                  <Typography color="text.secondary">
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary"
                  >
                    {formatMoney(monthlyData.totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 2,
                  borderLeft: `4px solid ${theme.palette.secondary.main}`,
                }}
              >
                <CardContent>
                  <Typography color="text.secondary">
                    Số đơn đã thanh toán
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="secondary"
                  >
                    {monthlyData.paidOrderCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 2,
              p: 3,
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: `${month}/${year}`,
                    revenue: monthlyData.totalRevenue,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#1976d2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {!loading && tab === 1 && dailyData && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 2,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardContent>
                  <Typography color="text.secondary">
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary"
                  >
                    {formatMoney(dailyData.totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 2,
                  borderLeft: `4px solid ${theme.palette.secondary.main}`,
                }}
              >
                <CardContent>
                  <Typography color="text.secondary">
                    Số đơn đã thanh toán
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="secondary"
                  >
                    {dailyData.paidOrderCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 2,
              p: 3,
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: dayjs(dailyData.date).format("DD/MM/YYYY"),
                    revenue: dailyData.totalRevenue,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2e7d32" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
      </Box>
    </Box>
  );
};

export default RevenueDashboard;