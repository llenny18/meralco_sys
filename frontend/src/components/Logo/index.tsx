import { Box, styled } from '@mui/material';
import Link from 'src/components/Link';

const LogoWrapper = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  fontWeight: theme.typography.fontWeightBold,
  width: 'fit-content',
  height: 'fit-content',
  borderRadius: theme.spacing(1.5),
  background: '#ffffff',
  boxShadow: '0 4px 20px rgba(255, 107, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(255, 107, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 107, 0, 0.1), transparent)',
    transition: 'left 0.5s',
  },
  
  '&:hover': {
    textDecoration: 'none',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 28px rgba(255, 107, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
    
    '&::before': {
      left: '100%',
    },
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const LogoImageWrapper = styled(Box)(() => ({
  width: '104px',
  height: '104px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px',
  
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
    transition: 'transform 0.3s ease',
  },
  
  '&:hover img': {
    transform: 'scale(1.05) rotate(2deg)',
  },
}));

function Logo() {
  return (
    <LogoWrapper href="/" aria-label="Go to homepage">
      <LogoImageWrapper>
        <img src="/1200x630wa.png" alt="Nettbank Logo" />
      </LogoImageWrapper>
    </LogoWrapper>
  );
}

export default Logo;