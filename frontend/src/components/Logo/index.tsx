import { Box, styled, Tooltip } from '@mui/material';
import Link from 'src/components/Link';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.palette.text.primary};
        padding: ${theme.spacing(0, 1, 0, 0)};
        display: flex;
        text-decoration: none;
        font-weight: ${theme.typography.fontWeightBold};
        align-items: center;

        &:hover {
          text-decoration: none;
          opacity: 0.8;
        }
`
);

const LogoImageWrapper = styled(Box)(
  () => `
        width: 52px;
        height: 52px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
`
);

const LogoTextWrapper = styled(Box)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
`
);

const VersionBadge = styled(Box)(
  ({ theme }) => `
        background: ${theme.palette.success.main};
        color: ${theme.palette.success.contrastText};
        padding: ${theme.spacing(0.4, 1)};
        border-radius: ${theme.general.borderRadiusSm};
        text-align: center;
        display: inline-block;
        line-height: 1;
        font-size: ${theme.typography.pxToRem(11)};
`
);

const LogoText = styled(Box)(
  ({ theme }) => `
        font-size: ${theme.typography.pxToRem(15)};
        font-weight: ${theme.typography.fontWeightBold};
`
);

function Logo() {
  return (
    <LogoWrapper href="/">
      <LogoImageWrapper>
        <img
          src="https://is1-ssl.mzstatic.com/image/thumb/Purple123/v4/4f/10/87/4f1087b7-a1e7-21a0-5eef-678a8cbd46ca/AppIcons-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/1200x630wa.png"
          alt="Logo"
        />
      </LogoImageWrapper>
      <Box
        component="span"
        sx={{
          display: { xs: 'none', sm: 'inline-block' }
        }}
      >
        <LogoTextWrapper>
          
          <LogoText>SMART Vendor System</LogoText>
        </LogoTextWrapper>
      </Box>
    </LogoWrapper>
  );
}

export default Logo;