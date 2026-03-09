import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box
} from "@mui/material";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ProductVariant {
  id: number;
  sizeName: string;
  price: number;
}

interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  variants: ProductVariant[];
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://localhost:7031/api/products")
      .then((res) => {
        const activeProducts = res.data.filter((p: Product) => p.isActive);
        setProducts(activeProducts);
      })
      .catch(console.log);
  }, []);

  const getPrice = (variants?: ProductVariant[]) => {
    if (!variants?.length) return null;
    return Math.min(...variants.map((v) => v.price));
  };

  const getImage = (imageUrl: string) => {
    if (!imageUrl) return "https://via.placeholder.com/300";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `https://localhost:7031/images/${imageUrl}`;
  };

  const handleAddToCart = (item: Product, price: number | null) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Lấy variant đầu tiên làm mặc định (giống bên MenuPage)
    const defaultVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null;

    if (!defaultVariant) {
      alert("Món này tạm hết hoặc chưa cập nhật giá.");
      return;
    }

    const newItem = {
      tempId: `${item.id}-${defaultVariant.id}-${Date.now()}`,
      product: {
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        categoryId: item.categoryId,
        categoryName: "", // Optional hoặc tìm trong list nếu cần, nhưng MenuPage chủ yếu dùng ID
        variants: item.variants
      },
      selectedVariant: defaultVariant,
      selectedToppings: [],
      quantity: 1,
      totalPrice: defaultVariant.price
    };

    cart.push(newItem);

    localStorage.setItem("cart", JSON.stringify(cart));

    navigate("/menupage"); // chuyển qua trang giỏ hàng
  };

  return (
    <>
      <Box sx={{ py: 8, background: "#f5f5f5" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="/about.jpg"
                sx={{ width: "100%", borderRadius: 4, boxShadow: 3 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Về Nhà Hàng Của Chúng Tôi
              </Typography>

              <Typography sx={{ mb: 2 }}>
                Chúng tôi mang đến trải nghiệm ẩm thực hiện đại kết hợp
                cùng hương vị truyền thống Việt Nam.
              </Typography>

              <Button variant="contained">
                TÌM HIỂU THÊM
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Những hương vị được yêu thích nhất tuần
        </Typography>

        <Grid container spacing={3}>
          {products.map((item) => {
            const price = getPrice(item.variants);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardMedia
                    component="img"
                    image={getImage(item.imageUrl)}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block"
                    }}
                  />

                  <CardContent>
                    <Typography fontWeight="bold">
                      {item.name}
                    </Typography>

                    <Typography color="primary" fontWeight="bold">
                      {price ? price.toLocaleString() + "đ" : "Liên hệ"}
                    </Typography>

                    <Button
                      variant="contained"
                      sx={{ mt: 1 }}
                      fullWidth
                      onClick={() => handleAddToCart(item, price)}
                    >
                      THÊM
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
}