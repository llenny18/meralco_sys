import { Box, Container, Link, Typography, styled } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const FooterWrapper = styled(Container)(
  ({ theme }) => `
        margin-top: ${theme.spacing(4)};
`
);

function Footer() {
  return (
    <FooterWrapper className="footer-wrapper">
      <Box
        pb={4}
        display={{ xs: 'block', md: 'flex' }}
        alignItems="center"
        textAlign={{ xs: 'center', md: 'left' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            &copy; {new Date().getFullYear()} Automated and AI monitoring System in Work Order Closing (AIMS WO)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Smart Vendor Project Management System - All Rights Reserved
          </Typography>
        </Box>
        <Box
          sx={{
            pt: { xs: 2, md: 0 }
          }}
        >
          <Box display="flex" flexDirection="column" gap={0.5} alignItems={{ xs: 'center', md: 'flex-end' }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <EmailIcon fontSize="small" color="action" />
              <Link
                href="mailto:customercare@AIMS WO.com.ph"
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                support@AIMS WO.com.ph
              </Link>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                16211 (Customer Service)
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Ortigas Avenue, Pasig City, Metro Manila
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </FooterWrapper>
  );
}

export default Footer;