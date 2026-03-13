import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  {
    id: 1,
    name: "Bò Lúc Lắc",
    description: "Thịt bò xào, tiêu đen, rau thơm",
    price: "95.000đ",
    image: "https://themewagon.github.io/yummy-red/assets/img/menu/menu-item-1.png"
  },
  {
    id: 2,
    name: "Gỏi Cuốn Tôm",
    description: "Tôm tươi, bún, rau sống, nước chấm",
    price: "75.000đ",
    image: "https://themewagon.github.io/yummy-red/assets/img/menu/menu-item-2.png"
  },
  {
    id: 3,
    name: "Gỏi Xoài",
    description: "Xoài chua, tôm khô, rau thơm",
    price: "65.000đ",
    image: "https://themewagon.github.io/yummy-red/assets/img/menu/menu-item-3.png"
  },
  {
    id: 4,
    name: "Salad Nấm",
    description: "Nấm tươi, rau xanh, giấm dầu mè",
    price: "70.000đ",
    image: "https://themewagon.github.io/yummy-red/assets/img/menu/menu-item-4.png"
  },
  {
    id: 5,
    name: "Bít Tết Sốt Tiêu",
    description: "Thịt bò Mỹ, sốt tiêu đen, khoai tây",
    price: "145.000đ",
    image: "https://themewagon.github.io/yummy-red/assets/img/menu/menu-item-5.png"
  },
  {
    id: 6,
    name: "Cơm Gà Hải Sản",
    description: "Hải sản tươi, cơm thơm, rau mùa",
    price: "120.000đ",
    image: "https://themewagon.github.io/yummy-red/assets/img/menu/menu-item-6.png"
  }
];


// Simple intersection observer hook for scroll animations
const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.2,
        ...options
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
};

const MenuCard = ({ item, index }: { item: typeof MENU_ITEMS[0]; index: number }) => {
  const { ref, isVisible } = useInView();
  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `all 0.7s ease-out ${index * 0.1}s`,
        textAlign: "center",
        cursor: "pointer",
        "&:hover .plate-img": {
          transform: "scale(1.07) translateY(-6px)"
        }
      }}
    >
      {/* Circular plate image */}
      <Box
        sx={{
          width: { xs: 180, md: 220 },
          height: { xs: 180, md: 220 },
          mx: "auto",
          mb: 2.5,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.13)"
        }}
      >
        <Box
          component="img"
          className="plate-img"
          src={item.image}
          alt={item.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease"
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 0.5, color: "#2d2d2d" }}
      >
        {item.name}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "#888", mb: 1, fontStyle: "italic" }}
      >
        {item.description}
      </Typography>

      <Typography
        sx={{
          color: "#ce1212",
          fontWeight: 700,
          fontSize: 18
        }}
      >
        {item.price}
      </Typography>
    </Box>
  );
};

export default function HomePage() {
  const navigate = useNavigate();

  const heroRef = useInView();
  const aboutImageRef = useInView();
  const aboutContentRef = useInView();

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh"
      }}
    >
      {/* Hero section */}
      <Box
        ref={heroRef.ref}
        sx={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          color: "#fff"
        }}
      >
        {/* Fullscreen background image */}
        <Box
          component="img"
          src="/about.jpg"
          alt="Hero background"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0
          }}
        />
        {/* Dark gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(15,0,5,0.82) 0%, rgba(59,0,15,0.75) 55%, rgba(180,30,40,0.55) 100%)",
            zIndex: 1
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, py: { xs: 10, md: 14 } }}>
          <Box
            sx={{
              maxWidth: 640
            }}
          >
            <Box
              sx={{
                opacity: heroRef.isVisible ? 1 : 0,
                transform: heroRef.isVisible
                  ? "translateY(0)"
                  : "translateY(40px)",
                transition: "all 0.9s ease-out"
              }}
            >
              <Typography
                variant="overline"
                sx={{ letterSpacing: 4, mb: 1, display: "block", opacity: 0.9 }}
              >
                WELCOME TO
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 2
                }}
              >
                Hương vị hiện đại,
                <br />
                đậm chất Việt.
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  maxWidth: 480,
                  opacity: 0.9,
                  mb: 4
                }}
              >
                Thưởng thức những món ăn tinh tế, nguyên liệu tươi mới mỗi ngày
                trong không gian ấm cúng và hiện đại.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 999,
                    boxShadow:
                      "0 12px 30px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.2)"
                  }}
                  onClick={() => navigate("/menupage")}
                >
                  ĐẶT MÓN NGAY
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 999,
                    borderColor: "rgba(255,255,255,0.6)",
                    color: "#fff",
                    "&:hover": {
                      borderColor: "#fff",
                      backgroundColor: "rgba(255,255,255,0.06)"
                    }
                  }}
                  onClick={() => {
                    const element = document.getElementById("signature-menu");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  XEM THỰC ĐƠN
                </Button>
              </Box>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* About section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#faf7f5" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
              gap: 6,
              alignItems: "center"
            }}
          >
            <Box
              ref={aboutImageRef.ref}
              sx={{
                opacity: aboutImageRef.isVisible ? 1 : 0,
                transform: aboutImageRef.isVisible
                  ? "translateX(0)"
                  : "translateX(-40px)",
                transition: "all 0.8s ease-out"
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.18)"
                }}
              >
                <Box
                  component="img"
                  src="/about.jpg"
                  alt="Restaurant interior"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </Box>

            <Box
              ref={aboutContentRef.ref}
              sx={{
                opacity: aboutContentRef.isVisible ? 1 : 0,
                transform: aboutContentRef.isVisible
                  ? "translateX(0)"
                  : "translateX(40px)",
                transition: "all 0.8s ease-out 0.15s"
              }}
            >
              <Typography
                variant="overline"
                sx={{ letterSpacing: 3, color: "primary.main" }}
              >
                VỀ CHÚNG TÔI
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}
              >
                Nhà hàng hiện đại với hương vị quen thuộc.
              </Typography>
              <Typography sx={{ mb: 2, color: "text.secondary" }}>
                Chúng tôi kết hợp phong cách ẩm thực hiện đại với nguyên liệu
                địa phương tươi ngon, mang đến trải nghiệm vừa lạ vừa quen cho
                mỗi thực khách.
              </Typography>
              <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Đội ngũ đầu bếp giàu kinh nghiệm cùng không gian ấm cúng là nơi
                lý tưởng cho những buổi hẹn hò, gặp gỡ gia đình hay đối tác.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  mb: 3
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Nguyên liệu tươi mỗi ngày</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Được chọn lọc kỹ lưỡng từ nhà cung cấp uy tín.
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight={600}>Không gian ấm cúng</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thiết kế tối giản, sang trọng, phù hợp nhiều dịp.
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/orders")}
              >
                XEM LỊCH SỬ ĐẶT MÓN
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Signature menu / featured products */}
      <Box id="signature-menu" sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              mb: 4,
              gap: 1
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", letterSpacing: 3 }}
              >
                Our Menu
              </Typography>
              {/* <Typography
                variant="h5"
                sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}
              >
                Những món được yêu thích nhất tuần
              </Typography> */}
            </Box>

            <Button
              variant="text"
              onClick={() => navigate("/menupage")}
              sx={{ mt: { xs: 1, sm: 0 } }}
            >
              Xem toàn bộ thực đơn
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(3, 1fr)"
              },
              gap: { xs: 4, md: 6 },
              mt: 2
            }}
          >
            {MENU_ITEMS.map((item, index) => (
              <MenuCard key={item.id} item={item} index={index} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}