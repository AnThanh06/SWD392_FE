import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, Container } from '@mui/material';
import { Link } from 'react-router-dom';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


const featuredDishes = [
  { id: 1, name: 'Burger Bò Wagyu Hảo Hạng', price: '189.000đ', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { id: 2, name: 'Pizza Ý Truyền Thống', price: '250.000đ', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80' },
  { id: 3, name: 'Salad Cá Ngừ Tươi Mát', price: '120.000đ', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
  { id: 4, name: 'Mỳ Ý Sốt Kem Nấm', price: '159.000đ', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80' },
];

export default function HomePage() {
  return (
    <Box>
      <Box 
        sx={{ 
          position: 'relative',
          height: '80vh', 
          display: 'flex',
          alignItems: 'center',
         
          backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          mb: 8,
         
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" fontWeight="800" gutterBottom>
            THƯỞNG THỨC VỊ NGON <br/> ĐÁNH THỨC GIÁC QUAN
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
            Nguyên liệu tươi sạch, công thức độc quyền, giao hàng tận nơi.
          </Typography>
          {/* Nút màu trắng trên nền tối để tương phản */}
          <Button 
            variant="contained" 
            size="large"
            component={Link} 
            to="/menu" 
            sx={{ 
              bgcolor: 'white', 
              color: 'black', 
              px: 5, py: 1.5, fontSize: '1.1rem',
              '&:hover': { bgcolor: '#e0e0e0' }
            }}
          >
            XEM THỰC ĐƠN NGAY
          </Button>
        </Container>
      </Box>


      {/* --- KHU VỰC LÝ DO CHỌN CHÚNG TÔI (Icon đen trắng) --- */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4} textAlign="center">
          
          {/* CÁCH VIẾT MỚI: Bỏ chữ 'item', dùng 'size' */}
          <Grid size={{ xs: 12, md: 4 }}>
            <LocalShippingIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Giao Hàng Siêu Tốc</Typography>
            <Typography color="text.secondary">Đảm bảo món ăn đến tay bạn vẫn còn nóng hổi trong 30 phút.</Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <RestaurantMenuIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Nguyên Liệu Tươi Sạch</Typography>
            <Typography color="text.secondary">Nguồn gốc rõ ràng, được tuyển chọn kỹ lưỡng mỗi ngày.</Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <SupportAgentIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Hỗ Trợ Tận Tâm</Typography>
            <Typography color="text.secondary">Đội ngũ chăm sóc khách hàng luôn sẵn sàng lắng nghe bạn.</Typography>
          </Grid>

        </Grid>
      </Container>


      {/* --- KHU VỰC MÓN ĂN NỔI BẬT (Phần quan trọng nhất) --- */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" textAlign="center" fontWeight="800" sx={{ mb: 1 }}>
          MÓN NGON ĐỀ XUẤT
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 5 }}>
          Những hương vị được yêu thích nhất tuần qua
        </Typography>
        
        <Grid container spacing={3}>
          {featuredDishes.map((dish) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={dish.id}>
              
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { borderColor: 'black' } }}>
                {/* Ảnh món ăn có màu sắc rực rỡ */}
                <CardMedia
                  component="img"
                  height="250"
                  image={dish.image}
                  alt={dish.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                      {dish.name}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {dish.price}
                    </Typography>
                    {/* Nút thêm vào giỏ hàng màu đen */}
                    <Button variant="contained" color="primary" size="small" startIcon={<AddShoppingCartIcon />}>
                      Thêm
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box textAlign="center" mt={5}>
           <Button variant="outlined" color="primary" size="large" component={Link} to="/menu" sx={{borderWidth: '2px', fontWeight: 'bold'}}>
             XEM TẤT CẢ THỰC ĐƠN
           </Button>
        </Box>
      </Container>
    </Box>
  );
}