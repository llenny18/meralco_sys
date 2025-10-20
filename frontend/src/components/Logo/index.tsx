import { Box, styled } from '@mui/material';
import Link from 'src/components/Link';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
    color: ${theme.palette.text.primary};
    padding: ${theme.spacing(0, 1, 0, 0)};
    display: flex;
    align-items: center;
    justify-content: center; /* Centers horizontally */
    text-decoration: none;
    font-weight: ${theme.typography.fontWeightBold};
    width: 70%;
    height: 70%;

    &:hover {
      text-decoration: none;
      opacity: 0.8;
    }
  `
);

const LogoImageWrapper = styled(Box)(
  () => `
    width: 70%;
    height: 70%;
    display: flex;
    align-items: center;      /* Centers vertically */
    justify-content: center;  /* Centers horizontally */

    img {
      width: 70%;
      height: 70%;
      object-fit: contain;     /* Keeps logo aspect ratio */
    }
  `
);

function Logo() {
  return (
    <LogoWrapper href="/">
      <LogoImageWrapper>
        <img
          src="/1200x630wa.png"
          alt="Logo"
        />
      </LogoImageWrapper>
    </LogoWrapper>
  );
}

export default Logo;
