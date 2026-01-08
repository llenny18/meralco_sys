import { useContext, useEffect, useState } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import {
  Box,
  Drawer,
  alpha,
  styled,
  Divider,
  useTheme,
  Button,
  lighten,
  darken
} from '@mui/material';

// Import all sidebar menus
import {
  VendorSidebarMenu,
  ClerkSidebarMenu,
  EngineeringAideSidebarMenu,
  QualityInspectorSidebarMenu,
  EngineerSidebarMenu,
  WOSupervisorSidebarMenu,
  TeamLeaderSidebarMenu,
  SectorManagerSidebarMenu,
  SystemAdminSidebarMenu,
  SidebarCircularLoader
} from './SidebarMenu'; // Adjust path as needed

import Logo from 'src/components/Logo';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`
);

// Props interface - menuComponent override is optional
interface SidebarProps {
  menuComponent?: React.ComponentType;
}

function Sidebar({ menuComponent }: SidebarProps) {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  
  // Get user role from localStorage/sessionStorage or your auth context
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Try to get role from localStorage
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
      return;
    }

    // Alternative: Try to get from sessionStorage
    const sessionRole = sessionStorage.getItem('userRole');
    if (sessionRole) {
      setUserRole(sessionRole);
      return;
    }

    // Alternative: Fetch from API if needed
    const fetchUserRole = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };

    // Uncomment if you want to fetch from API
    // fetchUserRole();
  }, []);

  // Determine which menu to render
  const getMenuComponent = () => {
    // If menuComponent is provided directly, use it
    if (menuComponent) {
      const MenuComponent = menuComponent;
      return <MenuComponent />;
    }

    // Otherwise, determine by userRole from session
    switch (userRole) {
      case 'vendor':
        return <VendorSidebarMenu />;
      case 'clerk':
        return <ClerkSidebarMenu />;
      case 'engineering-aide':
        return <EngineeringAideSidebarMenu />;
      case 'quality-inspector':
        return <QualityInspectorSidebarMenu />;
      case 'engineer':
        return <EngineerSidebarMenu />;
      case 'supervisor':
        return <WOSupervisorSidebarMenu />;
      case 'team-leader':
        return <TeamLeaderSidebarMenu />;
      case 'sector-manager':
        return <SectorManagerSidebarMenu />;
      case 'admin':
        return <SystemAdminSidebarMenu />;
      default:
        return <SidebarCircularLoader />; // Default fallback
    }
  };

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background:
            theme.palette.mode === 'dark'
              ? alpha(lighten(theme.header.background, 0.1), 0.5)
              : darken(theme.colors.alpha.black[100], 0.5),
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Scrollbar>
          <Box
            mx={2}
            sx={{
              marginTop: '50px',
              width: 'auto',
              display: 'flex',
              justifyContent: 'center', // centers horizontally
              alignItems: 'center',     // centers vertically
            }}
          >
            <Logo />
          </Box>

          <Divider
            sx={{
              mt: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10]
            }}
          />
          {getMenuComponent()}
        </Scrollbar>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
       
      </SidebarWrapper>
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <Box
            mx={2}
            sx={{
              marginTop: '50px',
              width: 'auto',
              display: 'flex',
              justifyContent: 'center', // centers horizontally
              alignItems: 'center',     // centers vertically
            }}
          >
            <Logo />
          </Box>

            <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            {getMenuComponent()}
          </Scrollbar>
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;