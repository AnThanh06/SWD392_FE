import { Box, Typography, Container, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'black',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ borderBottom: '1px solid #333', pb: 4, mb: 4 }}>


          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RestaurantIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" fontWeight="900" letterSpacing="1px">
                SWD_FOOD
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.400', lineHeight: 1.8 }}>
              Mang đến trải nghiệm ẩm thực tinh tế, kết hợp giữa nguyên liệu hảo hạng và nghệ thuật nấu nướng đương đại.
            </Typography>
          </Grid>


          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Liên Hệ
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
              📍 123 Đường Ẩm Thực, Quận 1, TP. HCM
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
              📞 Hotline: 1900 1234
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              ✉️ Email: hello@swdfood.com
            </Typography>
          </Grid>


          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Giờ Mở Cửa
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
              Thứ 2 - Chủ Nhật: 08:00 AM - 10:00 PM
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'white', bgcolor: '#333', '&:hover': { bgcolor: 'grey.700' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: 'white', bgcolor: '#333', '&:hover': { bgcolor: 'grey.700' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton sx={{ color: 'white', bgcolor: '#333', '&:hover': { bgcolor: 'grey.700' } }}>
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>

        </Grid>


        <Typography variant="body2" align="center" sx={{ color: 'grey.500' }}>
          © {new Date().getFullYear()} SWD_FOOD. All rights reserved. Designed with React & MUI v6.
        </Typography>
      </Container>
    </Box>
  );
}