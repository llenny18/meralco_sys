import { Box, styled } from '@mui/material';
import Link from 'src/components/Link';

const LogoWrapper = styled(Link)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  width: 'fit-content',
  height: 'fit-content',
  transition: 'all 0.3s ease',

  '&:hover': {
    textDecoration: 'none',
    transform: 'scale(1.05)',
  },

  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const LogoImageWrapper = styled(Box)(() => ({
  width: '104px',
  height: '104px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
}));

function Logo() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();          // stop router navigation
    window.location.reload();    // reload SAME page
  };

  return (
    <LogoWrapper
      href="#"
      aria-label="Reload page"
      onClick={handleClick}
    >
      <LogoImageWrapper>
        <img src="/1200x630wa.png" alt="Nettbank Logo" />
      </LogoImageWrapper>
    </LogoWrapper>
  );
}

export default Logo;
