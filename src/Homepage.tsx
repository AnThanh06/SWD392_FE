import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Grid
} from "@mui/material";

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
  productVariants: ProductVariant[];
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get("https://localhost:7031/api/products")
      .then((res) => {
        const activeProducts = res.data.filter(
          (p: Product) => p.isActive
        );
        setProducts(activeProducts);
      })
      .catch((err) => console.log(err));
  }, []);

  const getPrice = (variants: ProductVariant[]) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price));
  };

  const getImage = (imageUrl: string) => {
    if (!imageUrl) return "https://via.placeholder.com/300";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `https://localhost:7031/images/${imageUrl}`;
  };

  return (
    <>
      {/* ===== GIỚI THIỆU ===== */}
      <Box sx={{ py: 8, background: "#f5f5f5" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="/about.jpg"
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  boxShadow: 3
                }}
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

      {/* ===== SẢN PHẨM ===== */}
      <Container id="products" sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Những hương vị được yêu thích nhất tuần
        </Typography>

        <Grid container spacing={3}>
          {products.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getImage(item.imageUrl)}
                  sx={{ objectFit: "cover" }}
                />

                <CardContent>
                  <Typography fontWeight="bold">
                    {item.name}
                  </Typography>

                  <Typography color="primary" fontWeight="bold">
                    {getPrice(item.productVariants).toLocaleString()}đ
                  </Typography>

                  <Button variant="contained" sx={{ mt: 1 }} fullWidth>
                    THÊM
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}