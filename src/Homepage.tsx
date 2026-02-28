import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { Grid } from "@mui/material";

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
    <Container sx={{ mt: 5 }}>
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
  );
}