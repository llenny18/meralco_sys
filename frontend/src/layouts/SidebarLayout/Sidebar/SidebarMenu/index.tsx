// ============================================================================
// ALL SIDEBAR NAVIGATION COMPONENTS
// ============================================================================
// This file contains all 9 sidebar navigation components for different user roles
// Each component follows the same structure and styling patterns

import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import Collapse from '@mui/material/Collapse';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import ExpandLessTwoToneIcon from '@mui/icons-material/ExpandLessTwoTone';
import {
  ListSubheader,
  alpha,
  Box,
  List,
  styled,
  Button,
  ListItem
} from '@mui/material';
import NextLink from 'next/link';
import { SidebarContext } from 'src/contexts/SidebarContext';

// Icons Import
import PlaylistAddCheckTwoToneIcon from '@mui/icons-material/PlaylistAddCheckTwoTone';
import LayersTwoToneIcon from '@mui/icons-material/LayersTwoTone';
import LocalAtmTwoToneIcon from '@mui/icons-material/LocalAtmTwoTone';
import ViewModuleTwoToneIcon from '@mui/icons-material/ViewModuleTwoTone';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import ScheduleTwoToneIcon from '@mui/icons-material/ScheduleTwoTone';
import UpdateTwoToneIcon from '@mui/icons-material/UpdateTwoTone';
import ReceiptLongTwoToneIcon from '@mui/icons-material/ReceiptLongTwoTone';
import HourglassEmptyTwoToneIcon from '@mui/icons-material/HourglassEmptyTwoTone';
import RuleTwoToneIcon from '@mui/icons-material/RuleTwoTone';
import NotificationImportantTwoToneIcon from '@mui/icons-material/NotificationImportantTwoTone';
import MoneyOffTwoToneIcon from '@mui/icons-material/MoneyOffTwoTone';
import ViewListTwoToneIcon from '@mui/icons-material/ViewListTwoTone';
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';
import CategoryTwoToneIcon from '@mui/icons-material/CategoryTwoTone';
import SummarizeTwoToneIcon from '@mui/icons-material/SummarizeTwoTone';
import AnalyticsTwoToneIcon from '@mui/icons-material/AnalyticsTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import GroupTwoToneIcon from '@mui/icons-material/GroupTwoTone';
import ContactsTwoToneIcon from '@mui/icons-material/ContactsTwoTone';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import FlagTwoToneIcon from '@mui/icons-material/FlagTwoTone';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import AccountBalanceWalletTwoToneIcon from '@mui/icons-material/AccountBalanceWalletTwoTone';
import FeedbackTwoToneIcon from '@mui/icons-material/FeedbackTwoTone';
import MessageTwoToneIcon from '@mui/icons-material/MessageTwoTone';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import CalendarTodayTwoToneIcon from '@mui/icons-material/CalendarTodayTwoTone';
import HistoryTwoToneIcon from '@mui/icons-material/HistoryTwoTone';
import AssessmentTwoToneIcon from '@mui/icons-material/AssessmentTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import WorkTwoToneIcon from '@mui/icons-material/WorkTwoTone';
import GpsFixedTwoToneIcon from '@mui/icons-material/GpsFixedTwoTone';
import ShowChartTwoToneIcon from '@mui/icons-material/ShowChartTwoTone';
import PhoneAndroidTwoToneIcon from '@mui/icons-material/PhoneAndroidTwoTone';
import BarChartTwoToneIcon from '@mui/icons-material/BarChartTwoTone';
import TrendingUpTwoToneIcon from '@mui/icons-material/TrendingUpTwoTone';
import TimerTwoToneIcon from '@mui/icons-material/TimerTwoTone';
import SmartToyTwoToneIcon from '@mui/icons-material/SmartToyTwoTone';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import GavelTwoToneIcon from '@mui/icons-material/GavelTwoTone';
import GroupsTwoToneIcon from '@mui/icons-material/GroupsTwoTone';
import TvTwoToneIcon from '@mui/icons-material/TvTwoTone';
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';
import TrackChangesTwoToneIcon from '@mui/icons-material/TrackChangesTwoTone';
import BuildTwoToneIcon from '@mui/icons-material/BuildTwoTone';
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone';
import AutorenewTwoToneIcon from '@mui/icons-material/AutorenewTwoTone';
import VerifiedUserTwoToneIcon from '@mui/icons-material/VerifiedUserTwoTone';
import PieChartTwoToneIcon from '@mui/icons-material/PieChartTwoTone';
import TimelineTwoToneIcon from '@mui/icons-material/TimelineTwoTone';
import BusinessCenterTwoToneIcon from '@mui/icons-material/BusinessCenterTwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import AttachMoneyTwoToneIcon from '@mui/icons-material/AttachMoneyTwoTone';
import WarningTwoToneIcon from '@mui/icons-material/WarningTwoTone';
import PsychologyTwoToneIcon from '@mui/icons-material/PsychologyTwoTone';
import EventNoteTwoToneIcon from '@mui/icons-material/EventNoteTwoTone';
import PeopleTwoToneIcon from '@mui/icons-material/PeopleTwoTone';
import SecurityTwoToneIcon from '@mui/icons-material/SecurityTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import StorageTwoToneIcon from '@mui/icons-material/StorageTwoTone';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import ExtensionTwoToneIcon from '@mui/icons-material/ExtensionTwoTone';
import BackupTwoToneIcon from '@mui/icons-material/BackupTwoTone';
import BugReportTwoToneIcon from '@mui/icons-material/BugReportTwoTone';
import EmailTwoToneIcon from '@mui/icons-material/EmailTwoTone';
import PaletteTwoToneIcon from '@mui/icons-material/PaletteTwoTone';
import ReceiptTwoToneIcon from '@mui/icons-material/ReceiptTwoTone';
import PaymentTwoToneIcon from '@mui/icons-material/PaymentTwoTone';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import StoreTwoToneIcon from '@mui/icons-material/StoreTwoTone';

// Add this import at the top with other MUI imports
import { CircularProgress, Skeleton } from '@mui/material';

// Add this styled component with other styled components (after SubMenuWrapper)
const LoaderWrapper = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: ${theme.spacing(4)};
`
);

const SkeletonMenuWrapper = styled(Box)(
  ({ theme }) => `
    padding: ${theme.spacing(1)};
    
    .MuiSkeleton-root {
      margin-bottom: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius}px;
    }
`
);

// Loader Component for Sidebar
export function SidebarLoader() {
  return (
    <MenuWrapper>
      <SkeletonMenuWrapper>
        <Skeleton 
          variant="text" 
          width="60%" 
          height={24} 
          sx={{ mb: 2, ml: 2 }}
        />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Skeleton
            key={item}
            variant="rectangular"
            height={42}
            sx={{ 
              mx: 1,
              mb: 1,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)'
            }}
          />
        ))}
      </SkeletonMenuWrapper>
    </MenuWrapper>
  );
}

// Alternative: Simple Circular Loader
export function SidebarCircularLoader() {
  return (
    <MenuWrapper>
      <LoaderWrapper>
        <CircularProgress 
          size={40} 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)' 
          }} 
        />
      </LoaderWrapper>
    </MenuWrapper>
  );
}






// ============================================================================
// SHARED STYLED COMPONENTS
// ============================================================================

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create([
                  'transform',
                  'opacity'
                ])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);


// ============================================================================
// VENDOR SIDEBAR
// ============================================================================

export function VendorSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Vendor Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/vendor" passHref>
                <Button
                  className={currentRoute === '/vendor' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Vendor Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/billing" passHref>
                <Button
                  className={currentRoute === '/vendor/billing' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ReceiptLongTwoToneIcon />}
                >
                  Billing
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/compliance" passHref>
                <Button
                  className={currentRoute === '/vendor/compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CheckCircleTwoToneIcon />}
                >
                  Compliance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/disputes" passHref>
                <Button
                  className={currentRoute === '/vendor/disputes' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GavelTwoToneIcon />}
                >
                  Disputes
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/documents" passHref>
                <Button
                  className={currentRoute === '/vendor/documents' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Documents
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/feedback" passHref>
                <Button
                  className={currentRoute === '/vendor/feedback' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FeedbackTwoToneIcon />}
                >
                  Feedback
                </Button>
              </NextLink>
            </ListItem>
            
            <ListItem component="div">
              <NextLink href="/vendor/payments" passHref>
                <Button
                  className={currentRoute === '/vendor/payments' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PaymentTwoToneIcon />}
                >
                  Payments
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/projects" passHref>
                <Button
                  className={currentRoute === '/vendor/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FolderTwoToneIcon />}
                >
                  Projects
                </Button>
              </NextLink>
            </ListItem>
       
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}



// ============================================================================
// CLERK SIDEBAR
// ============================================================================

export function ClerkSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Clerk Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/clerk/dashboard" passHref>
                <Button
                  className={currentRoute === '/clerk/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/change-logs" passHref>
                <Button
                  className={currentRoute === '/clerk/change-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Change Logs
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/compliance" passHref>
                <Button
                  className={currentRoute === '/clerk/compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<RuleTwoToneIcon />}
                >
                  Compliance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/document-types" passHref>
                <Button
                  className={currentRoute === '/clerk/document-types' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssignmentTwoToneIcon />}
                >
                  Document Types
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/documents" passHref>
                <Button
                  className={currentRoute === '/clerk/documents' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Documents
                </Button>
              </NextLink>
            </ListItem>
          
           
            <ListItem component="div">
              <NextLink href="/clerk/projects" passHref>
                <Button
                  className={currentRoute === '/clerk/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FolderTwoToneIcon />}
                >
                  Projects
                </Button>
              </NextLink>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

// ============================================================================
// ENGINEERING AIDE SIDEBAR
// ============================================================================

export function EngineeringAideSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Engineering Aide Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/aide/dashboard" passHref>
                <Button
                  className={currentRoute === '/aide/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/aide/workorder" passHref>
                <Button
                  className={currentRoute === '/aide/workorder' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Work Orders
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/aide/change-logs" passHref>
                <Button
                  className={currentRoute === '/aide/change-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Change Logs
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/aide/compliance" passHref>
                <Button
                  className={currentRoute === '/aide/compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<RuleTwoToneIcon />}
                >
                  Compliance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/aide/documents" passHref>
                <Button
                  className={currentRoute === '/aide/documents' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Documents
                </Button>
              </NextLink>
            </ListItem>
          
            <ListItem component="div">
              <NextLink href="/aide/projects" passHref>
                <Button
                  className={currentRoute === '/aide/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FolderTwoToneIcon />}
                >
                  Projects
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/aide/workflow" passHref>
                <Button
                  className={currentRoute === '/aide/workflow' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountTreeTwoToneIcon />}
                >
                  Workflow
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/aide/workflow-stages" passHref>
                <Button
                  className={currentRoute === '/aide/workflow-stages' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PlaylistAddCheckTwoToneIcon />}
                >
                  Workflow Stages
                </Button>
              </NextLink>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

// =======================================================================
// QUALITY INSPECTOR SIDEBAR
// ============================================================================

export function QualityInspectorSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Quality Inspector Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/qi" passHref>
                <Button
                  className={currentRoute === '/qi' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  QI Dashboard
                </Button>
              </NextLink>
            </ListItem>
            
            <ListItem component="div">
              <NextLink href="/qi/workorder" passHref>
                <Button
                  className={currentRoute === '/qi/workorder' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Work Orders
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/daily-targets" passHref>
                <Button
                  className={currentRoute === '/qi/daily-targets' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GpsFixedTwoToneIcon />}
                >
                  Daily Targets
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/document-types" passHref>
                <Button
                  className={currentRoute === '/qi/document-types' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Document Types
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/inspections" passHref>
                <Button
                  className={currentRoute === '/qi/inspections' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SearchTwoToneIcon />}
                >
                  Inspections
                </Button>
              </NextLink>
            </ListItem>
            
            <ListItem component="div">
              <NextLink href="/qi/performance" passHref>
                <Button
                  className={currentRoute === '/qi/performance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ShowChartTwoToneIcon />}
                >
                  Performance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/projects" passHref>
                <Button
                  className={currentRoute === '/qi/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FolderTwoToneIcon />}
                >
                  Projects
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/workflow" passHref>
                <Button
                  className={currentRoute === '/qi/workflow' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountTreeTwoToneIcon />}
                >
                  Workflow
                </Button>
              </NextLink>
            </ListItem>
          
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}


// ============================================================================
// ENGINEER SIDEBAR
// ============================================================================

export function EngineerSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;
  const [openSections, setOpenSections] = useState({
    projects: false,
    compliance: false,
    financial: false,
    qi: false,
    vendors: false,
    workflow: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Engineer Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/supervisor" passHref>
                <Button
                  className={currentRoute === '/supervisor' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Supervisor Dashboard
                </Button>
              </NextLink>
            </ListItem>

            
            
            <ListItem component="div">
              <NextLink href="/supervisor/kpis" passHref>
                <Button
                  className={currentRoute === '/supervisor/kpis' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  KPI Analytics
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/engineer/dashboard" passHref>
                <Button
                  className={currentRoute === '/engineer/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BarChartTwoToneIcon />}
                >
                  Dashboard
                </Button>
              </NextLink>
            </ListItem>

            

            {/* Projects Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/engineer/project') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('projects')}
                startIcon={<FolderTwoToneIcon />}
                endIcon={openSections.projects ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Projects
              </Button>
            </ListItem>
            <Collapse in={openSections.projects}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/projects" passHref>
                    <Button
                      className={currentRoute === '/engineer/projects' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      All Projects
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/milestones" passHref>
                    <Button
                      className={currentRoute === '/engineer/milestones' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<FlagTwoToneIcon />}
                    >
                      Milestones
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/milestone-templates" passHref>
                    <Button
                      className={currentRoute === '/engineer/milestone-templates' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<ViewModuleTwoToneIcon />}
                    >
                      Milestone Templates
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/project-schedules" passHref>
                    <Button
                      className={currentRoute === '/engineer/project-schedules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<ScheduleTwoToneIcon />}
                    >
                      Project Schedules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/project-delays" passHref>
                    <Button
                      className={currentRoute === '/engineer/project-delays' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<AccessTimeTwoToneIcon />}
                    >
                      Project Delays
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/delay-factors" passHref>
                    <Button
                      className={currentRoute === '/engineer/delay-factors' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<HourglassEmptyTwoToneIcon />}
                    >
                      Delay Factors
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/status-updates" passHref>
                    <Button
                      className={currentRoute === '/engineer/status-updates' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<UpdateTwoToneIcon />}
                    >
                      Status Updates
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Compliance & SLA Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/engineer/sla') || currentRoute.includes('/engineer/compliance') || currentRoute.includes('/engineer/escalation') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('compliance')}
                startIcon={<CheckCircleTwoToneIcon />}
                endIcon={openSections.compliance ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Compliance & SLA
              </Button>
            </ListItem>
            <Collapse in={openSections.compliance}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/compliance" passHref>
                    <Button
                      className={currentRoute === '/engineer/compliance' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Compliance
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/sla-rules" passHref>
                    <Button
                      className={currentRoute === '/engineer/sla-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<RuleTwoToneIcon />}
                    >
                      SLA Rules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/sla-tracking" passHref>
                    <Button
                      className={currentRoute === '/engineer/sla-tracking' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<TrackChangesTwoToneIcon />}
                    >
                      SLA Tracking
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/escalation-rules" passHref>
                    <Button
                      className={currentRoute === '/engineer/escalation-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<TrendingUpTwoToneIcon />}
                    >
                      Escalation Rules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/escalations" passHref>
                    <Button
                      className={currentRoute === '/engineer/escalations' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<NotificationImportantTwoToneIcon />}
                    >
                      Escalations
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Financial Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/engineer/payment') || currentRoute.includes('/engineer/invoice') || currentRoute.includes('/engineer/penalt') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('financial')}
                startIcon={<PaymentTwoToneIcon />}
                endIcon={openSections.financial ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Financial
              </Button>
            </ListItem>
            <Collapse in={openSections.financial}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/payments" passHref>
                    <Button
                      className={currentRoute === '/engineer/payments' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Payments
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/invoices" passHref>
                    <Button
                      className={currentRoute === '/engineer/invoices' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<LocalAtmTwoToneIcon />}
                    >
                      Invoices
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/penalties" passHref>
                    <Button
                      className={currentRoute === '/engineer/penalties' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<MoneyOffTwoToneIcon />}
                    >
                      Penalties
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/penalty-rules" passHref>
                    <Button
                      className={currentRoute === '/engineer/penalty-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<GavelTwoToneIcon />}
                    >
                      Penalty Rules
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* QI Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/engineer/qi') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('qi')}
                startIcon={<TrendingUpTwoToneIcon />}
                endIcon={openSections.qi ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Quality Indicators
              </Button>
            </ListItem>
            <Collapse in={openSections.qi}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/qis" passHref>
                    <Button
                      className={currentRoute === '/engineer/qis' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      QIs
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/qi-performance" passHref>
                    <Button
                      className={currentRoute === '/engineer/qi-performance' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<SpeedTwoToneIcon />}
                    >
                      QI Performance
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Vendors Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/engineer/vendor') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('vendors')}
                startIcon={<BusinessTwoToneIcon />}
                endIcon={openSections.vendors ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Vendors
              </Button>
            </ListItem>
            <Collapse in={openSections.vendors}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/vendors" passHref>
                    <Button
                      className={currentRoute === '/engineer/vendors' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      All Vendors
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/vendor-feedback" passHref>
                    <Button
                      className={currentRoute === '/engineer/vendor-feedback' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<FeedbackTwoToneIcon />}
                    >
                      Vendor Feedback
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Workflow Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/engineer/workflow') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('workflow')}
                startIcon={<AccountTreeTwoToneIcon />}
                endIcon={openSections.workflow ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Workflow
              </Button>
            </ListItem>
            <Collapse in={openSections.workflow}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/workflow" passHref>
                    <Button
                      className={currentRoute === '/engineer/workflow' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Workflow
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/engineer/workflow-stages" passHref>
                    <Button
                      className={currentRoute === '/engineer/workflow-stages' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<LayersTwoToneIcon />}
                    >
                      Workflow Stages
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Documents Section */}
            <ListItem component="div">
              <NextLink href="/engineer/documents" passHref>
                <Button
                  className={currentRoute === '/engineer/documents' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Documents
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/engineer/document-types" passHref>
                <Button
                  className={currentRoute === '/engineer/document-types' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<LayersTwoToneIcon />}
                >
                  Document Types
                </Button>
              </NextLink>
            </ListItem>

            {/* Logs Section */}
            <ListItem component="div">
              <NextLink href="/engineer/audit-logs" passHref>
                <Button
                  className={currentRoute === '/engineer/audit-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Audit Logs
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/engineer/change-logs" passHref>
                <Button
                  className={currentRoute === '/engineer/change-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Change Logs
                </Button>
              </NextLink>
            </ListItem>

           
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}


// ============================================================================
// SUPERVISOR SIDEBAR
// ============================================================================

export function WOSupervisorSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;
  const [openSections, setOpenSections] = useState({
    projects: false,
    compliance: false,
    financial: false,
    qi: false,
    vendors: false,
    workflow: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Supervisor Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/supervisor" passHref>
                <Button
                  className={currentRoute === '/supervisor' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Supervisor Dashboard
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/supervisor/dashboard" passHref>
                <Button
                  className={currentRoute === '/supervisor/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BarChartTwoToneIcon />}
                >
                  Dashboard
                </Button>
              </NextLink>
            </ListItem>

           

            {/* Projects Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/supervisor/project') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('projects')}
                startIcon={<FolderTwoToneIcon />}
                endIcon={openSections.projects ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Projects
              </Button>
            </ListItem>
            <Collapse in={openSections.projects}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/projects" passHref>
                    <Button
                      className={currentRoute === '/supervisor/projects' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      All Projects
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/milestones" passHref>
                    <Button
                      className={currentRoute === '/supervisor/milestones' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<FlagTwoToneIcon />}
                    >
                      Milestones
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/milestone-templates" passHref>
                    <Button
                      className={currentRoute === '/supervisor/milestone-templates' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<ViewModuleTwoToneIcon />}
                    >
                      Milestone Templates
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/project-schedules" passHref>
                    <Button
                      className={currentRoute === '/supervisor/project-schedules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<ScheduleTwoToneIcon />}
                    >
                      Project Schedules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/project-delays" passHref>
                    <Button
                      className={currentRoute === '/supervisor/project-delays' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<AccessTimeTwoToneIcon />}
                    >
                      Project Delays
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/delay-factors" passHref>
                    <Button
                      className={currentRoute === '/supervisor/delay-factors' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<HourglassEmptyTwoToneIcon />}
                    >
                      Delay Factors
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/status-updates" passHref>
                    <Button
                      className={currentRoute === '/supervisor/status-updates' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<UpdateTwoToneIcon />}
                    >
                      Status Updates
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Compliance & SLA Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/supervisor/sla') || currentRoute.includes('/supervisor/compliance') || currentRoute.includes('/supervisor/escalation') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('compliance')}
                startIcon={<CheckCircleTwoToneIcon />}
                endIcon={openSections.compliance ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Compliance & SLA
              </Button>
            </ListItem>
            <Collapse in={openSections.compliance}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/compliance" passHref>
                    <Button
                      className={currentRoute === '/supervisor/compliance' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Compliance
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/sla-rules" passHref>
                    <Button
                      className={currentRoute === '/supervisor/sla-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<RuleTwoToneIcon />}
                    >
                      SLA Rules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/sla-tracking" passHref>
                    <Button
                      className={currentRoute === '/supervisor/sla-tracking' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<TrackChangesTwoToneIcon />}
                    >
                      SLA Tracking
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/escalation-rules" passHref>
                    <Button
                      className={currentRoute === '/supervisor/escalation-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<TrendingUpTwoToneIcon />}
                    >
                      Escalation Rules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/escalations" passHref>
                    <Button
                      className={currentRoute === '/supervisor/escalations' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<NotificationImportantTwoToneIcon />}
                    >
                      Escalations
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Financial Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/supervisor/payment') || currentRoute.includes('/supervisor/invoice') || currentRoute.includes('/supervisor/penalt') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('financial')}
                startIcon={<PaymentTwoToneIcon />}
                endIcon={openSections.financial ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Financial
              </Button>
            </ListItem>
            <Collapse in={openSections.financial}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/payments" passHref>
                    <Button
                      className={currentRoute === '/supervisor/payments' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Payments
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/invoices" passHref>
                    <Button
                      className={currentRoute === '/supervisor/invoices' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<LocalAtmTwoToneIcon />}
                    >
                      Invoices
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/penalties" passHref>
                    <Button
                      className={currentRoute === '/supervisor/penalties' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<MoneyOffTwoToneIcon />}
                    >
                      Penalties
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/penalty-rules" passHref>
                    <Button
                      className={currentRoute === '/supervisor/penalty-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<GavelTwoToneIcon />}
                    >
                      Penalty Rules
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* QI Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/supervisor/qi') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('qi')}
                startIcon={<TrendingUpTwoToneIcon />}
                endIcon={openSections.qi ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Quality Indicators
              </Button>
            </ListItem>
            <Collapse in={openSections.qi}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/qis" passHref>
                    <Button
                      className={currentRoute === '/supervisor/qis' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      QIs
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/qi-performance" passHref>
                    <Button
                      className={currentRoute === '/supervisor/qi-performance' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<SpeedTwoToneIcon />}
                    >
                      QI Performance
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Vendors Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/supervisor/vendor') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('vendors')}
                startIcon={<BusinessTwoToneIcon />}
                endIcon={openSections.vendors ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Vendors
              </Button>
            </ListItem>
            <Collapse in={openSections.vendors}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/vendors" passHref>
                    <Button
                      className={currentRoute === '/supervisor/vendors' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      All Vendors
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/vendor-feedback" passHref>
                    <Button
                      className={currentRoute === '/supervisor/vendor-feedback' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<FeedbackTwoToneIcon />}
                    >
                      Vendor Feedback
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Workflow Section */}
            <ListItem component="div">
              <Button
                className={currentRoute.includes('/supervisor/workflow') ? 'active' : ''}
                disableRipple
                onClick={() => toggleSection('workflow')}
                startIcon={<AccountTreeTwoToneIcon />}
                endIcon={openSections.workflow ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Workflow
              </Button>
            </ListItem>
            <Collapse in={openSections.workflow}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/workflow" passHref>
                    <Button
                      className={currentRoute === '/supervisor/workflow' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Workflow
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/supervisor/workflow-stages" passHref>
                    <Button
                      className={currentRoute === '/supervisor/workflow-stages' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                      startIcon={<LayersTwoToneIcon />}
                    >
                      Workflow Stages
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            {/* Documents Section */}
            <ListItem component="div">
              <NextLink href="/supervisor/documents" passHref>
                <Button
                  className={currentRoute === '/supervisor/documents' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Documents
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/supervisor/document-types" passHref>
                <Button
                  className={currentRoute === '/supervisor/document-types' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<LayersTwoToneIcon />}
                >
                  Document Types
                </Button>
              </NextLink>
            </ListItem>

            {/* Logs Section */}
            <ListItem component="div">
              <NextLink href="/supervisor/audit-logs" passHref>
                <Button
                  className={currentRoute === '/supervisor/audit-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Audit Logs
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/supervisor/change-logs" passHref>
                <Button
                  className={currentRoute === '/supervisor/change-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Change Logs
                </Button>
              </NextLink>
            </ListItem>

           
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

// ============================================================================
// TEAM LEADERS SIDEBAR
// ============================================================================

export function TeamLeaderSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Executive Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/leader/dashboard" passHref>
                <Button
                  className={currentRoute === '/leader/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Leader Dashboard
                </Button>
              </NextLink>
            </ListItem>

            
            <ListItem component="div">
              <NextLink href="/leader/kpis" passHref>
                <Button
                  className={currentRoute === '/leader/kpis' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  KPI Analytics
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/leader/audit-logs" passHref>
                <Button
                  className={currentRoute === '/leader/audit-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Audit Logs
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/billing" passHref>
                <Button
                  className={currentRoute === '/leader/billing' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ReceiptLongTwoToneIcon />}
                >
                  Billing
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/change-logs" passHref>
                <Button
                  className={currentRoute === '/leader/change-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Change Logs
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/delay-analysis" passHref>
                <Button
                  className={currentRoute === '/leader/delay-analysis' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HourglassEmptyTwoToneIcon />}
                >
                  Delay Analysis
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/escalation-rules" passHref>
                <Button
                  className={currentRoute === '/leader/escalation-rules' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TrendingUpTwoToneIcon />}
                >
                  Escalation Rules
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/escalations" passHref>
                <Button
                  className={currentRoute === '/leader/escalations' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<NotificationImportantTwoToneIcon />}
                >
                  Escalations
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/penalties" passHref>
                <Button
                  className={currentRoute === '/leader/penalties' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MoneyOffTwoToneIcon />}
                >
                  Penalties
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/penalty-rules" passHref>
                <Button
                  className={currentRoute === '/leader/penalty-rules' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GavelTwoToneIcon />}
                >
                  Penalty Rules
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/permissions" passHref>
                <Button
                  className={currentRoute === '/leader/permissions' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SecurityTwoToneIcon />}
                >
                  Permissions
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/project-status" passHref>
                <Button
                  className={currentRoute === '/leader/project-status' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssignmentTwoToneIcon />}
                >
                  Project Status
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/projects" passHref>
                <Button
                  className={currentRoute === '/leader/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FolderTwoToneIcon />}
                >
                  Projects
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/qi-overview" passHref>
                <Button
                  className={currentRoute === '/leader/qi-overview' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ViewListTwoToneIcon />}
                >
                  QI Overview
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/qi-workload" passHref>
                <Button
                  className={currentRoute === '/leader/qi-workload' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<WorkTwoToneIcon />}
                >
                  QI Workload
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/role-permissions" passHref>
                <Button
                  className={currentRoute === '/leader/role-permissions' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AdminPanelSettingsTwoToneIcon />}
                >
                  Role Permissions
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/sectors" passHref>
                <Button
                  className={currentRoute === '/leader/sectors' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CategoryTwoToneIcon />}
                >
                  Sectors
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/sla-overview" passHref>
                <Button
                  className={currentRoute === '/leader/sla-overview' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SummarizeTwoToneIcon />}
                >
                  SLA Overview
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/sla-rules" passHref>
                <Button
                  className={currentRoute === '/leader/sla-rules' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<RuleTwoToneIcon />}
                >
                  SLA Rules
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/user-roles" passHref>
                <Button
                  className={currentRoute === '/leader/user-roles' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PeopleAltTwoToneIcon />}
                >
                  User Roles
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/users" passHref>
                <Button
                  className={currentRoute === '/leader/users' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GroupTwoToneIcon />}
                >
                  Users
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/vendor-analytics" passHref>
                <Button
                  className={currentRoute === '/leader/vendor-analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AnalyticsTwoToneIcon />}
                >
                  Vendor Analytics
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/vendor-contacts" passHref>
                <Button
                  className={currentRoute === '/leader/vendor-contacts' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ContactsTwoToneIcon />}
                >
                  Vendor Contacts
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/vendors" passHref>
                <Button
                  className={currentRoute === '/leader/vendors' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BusinessTwoToneIcon />}
                >
                  Vendors
                </Button>
              </NextLink>
            </ListItem>
            
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

// ============================================================================
// 8. SECTOR MANAGERS SIDEBAR
// ============================================================================

export function SectorManagerSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Sector Executive Portal
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/sector-manager/dashboard" passHref>
                <Button
                  className={currentRoute === '/sector-manager/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Executive Dashboard
                </Button>
              </NextLink>
            </ListItem>

            
            <ListItem component="div">
              <NextLink href="/sector-manager/kpis" passHref>
                <Button
                  className={currentRoute === '/sector-manager/kpis' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  KPI Analytics
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/sector-manager/penalties" passHref>
                <Button
                  className={currentRoute === '/sector-manager/penalties' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PieChartTwoToneIcon />}
                >
                  Penalties
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/projects" passHref>
                <Button
                  className={currentRoute === '/sector-manager/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TimelineTwoToneIcon />}
                >
                  Projects
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/sectors" passHref>
                <Button
                  className={currentRoute === '/sector-manager/sectors' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BusinessCenterTwoToneIcon />}
                >
                  Sector Overview
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/vendor-performance" passHref>
                <Button
                  className={currentRoute === '/sector-manager/vendor-performance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SpeedTwoToneIcon />}
                >
                  Vendor Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/financial" passHref>
                <Button
                  className={currentRoute === '/sector-manager/financial' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AttachMoneyTwoToneIcon />}
                >
                  Financial Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/sla" passHref>
                <Button
                  className={currentRoute === '/sector-manager/sla' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<WarningTwoToneIcon />}
                >
                  SLA
                </Button>
              </NextLink>
            </ListItem>
           
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

// ============================================================================
// 9. SYSTEM ADMINISTRATORS SIDEBAR
// ============================================================================

export function SystemAdminSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;
  const [openMenus, setOpenMenus] = React.useState({});

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <MenuWrapper>
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            System Administration
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <NextLink href="/admin/dashboard" passHref>
                <Button
                  className={currentRoute === '/admin/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Dashboard
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/kpis" passHref>
                <Button
                  className={currentRoute === '/admin/kpis' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  KPI Analytics
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/workorder" passHref>
                <Button
                  className={currentRoute === '/admin/workorder' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Work Orders
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('audit')}
                startIcon={<HistoryTwoToneIcon />}
                endIcon={openMenus.audit ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Audit
              </Button>
            </ListItem>
            <Collapse in={openMenus.audit}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/audit-logs" passHref>
                    <Button
                      className={currentRoute === '/admin/audit-logs' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Audit Logs
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('changeManagement')}
                startIcon={<BuildTwoToneIcon />}
                endIcon={openMenus.changeManagement ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Change Management
              </Button>
            </ListItem>
            <Collapse in={openMenus.changeManagement}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/change-logs" passHref>
                    <Button
                      className={currentRoute === '/admin/change-logs' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Change Logs
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('delays')}
                startIcon={<TimerTwoToneIcon />}
                endIcon={openMenus.delays ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Delays
              </Button>
            </ListItem>
            <Collapse in={openMenus.delays}>
              <List component="div" disablePadding>
               
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/project-delays" passHref>
                    <Button
                      className={currentRoute === '/admin/project-delays' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Project Delays
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('escalations')}
                startIcon={<NotificationsActiveTwoToneIcon />}
                endIcon={openMenus.escalations ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Escalations
              </Button>
            </ListItem>
            <Collapse in={openMenus.escalations}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/escalation-rules" passHref>
                    <Button
                      className={currentRoute === '/admin/escalation-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Escalation Rules
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/escalations" passHref>
                    <Button
                      className={currentRoute === '/admin/escalations' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Escalations
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            <ListItem component="div">
              <NextLink href="/admin/invoices" passHref>
                <Button
                  className={currentRoute === '/admin/invoices' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ReceiptTwoToneIcon />}
                >
                  Invoices
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/maintenance" passHref>
                <Button
                  className={currentRoute === '/admin/maintenance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BuildTwoToneIcon />}
                >
                  Maintenance
                </Button>
              </NextLink>
            </ListItem>

        

            <ListItem component="div">
              <NextLink href="/admin/payments" passHref>
                <Button
                  className={currentRoute === '/admin/payments' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PaymentTwoToneIcon />}
                >
                  Payments
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('penalties')}
                startIcon={<GavelTwoToneIcon />}
                endIcon={openMenus.penalties ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Penalties
              </Button>
            </ListItem>
            <Collapse in={openMenus.penalties}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/penalties" passHref>
                    <Button
                      className={currentRoute === '/admin/penalties' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Penalties
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/penalty-rules" passHref>
                    <Button
                      className={currentRoute === '/admin/penalty-rules' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Penalty Rules
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('performance')}
                startIcon={<SpeedTwoToneIcon />}
                endIcon={openMenus.performance ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Performance
              </Button>
            </ListItem>
            <Collapse in={openMenus.performance}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/performance" passHref>
                    <Button
                      className={currentRoute === '/admin/performance' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Performance
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/qi-performance" passHref>
                    <Button
                      className={currentRoute === '/admin/qi-performance' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      QI Performance
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

        

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('qi')}
                startIcon={<AssignmentTwoToneIcon />}
                endIcon={openMenus.qi ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                QI
              </Button>
            </ListItem>
            <Collapse in={openMenus.qi}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/qi-daily-logs" passHref>
                    <Button
                      className={currentRoute === '/admin/qi-daily-logs' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      QI Daily Logs
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/qi-inspections" passHref>
                    <Button
                      className={currentRoute === '/admin/qi-inspections' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      QI Inspections
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>

            <ListItem component="div">
              <NextLink href="/admin/roles" passHref>
                <Button
                  className={currentRoute === '/admin/roles' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SecurityTwoToneIcon />}
                >
                  Roles
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/security" passHref>
                <Button
                  className={currentRoute === '/admin/security' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SecurityTwoToneIcon />}
                >
                  Security
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/sla-penalty-config" passHref>
                <Button
                  className={currentRoute === '/admin/sla-penalty-config' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TimerTwoToneIcon />}
                >
                  SLA Penalty Config
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/supply-centre" passHref>
                <Button
                  className={currentRoute === '/admin/supply-centre' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<StoreTwoToneIcon />}
                >
                  Supply Centre
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/system-settings" passHref>
                <Button
                  className={currentRoute === '/admin/system-settings' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SettingsTwoToneIcon />}
                >
                  System Settings
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <NextLink href="/admin/user-management" passHref>
                <Button
                  className={currentRoute === '/admin/user-management' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PeopleTwoToneIcon />}
                >
                  User Management
                </Button>
              </NextLink>
            </ListItem>

            <ListItem component="div">
              <Button
                disableRipple
                onClick={() => toggleMenu('vendors')}
                startIcon={<BusinessTwoToneIcon />}
                endIcon={openMenus.vendors ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />}
              >
                Vendors
              </Button>
            </ListItem>
            <Collapse in={openMenus.vendors}>
              <List component="div" disablePadding>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/vendors" passHref>
                    <Button
                      className={currentRoute === '/admin/vendors' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Vendors
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/vendor-disputes" passHref>
                    <Button
                      className={currentRoute === '/admin/vendor-disputes' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Vendor Disputes
                    </Button>
                  </NextLink>
                </ListItem>
                <ListItem component="div" sx={{ pl: 4 }}>
                  <NextLink href="/admin/vendor-feedback" passHref>
                    <Button
                      className={currentRoute === '/admin/vendor-feedback' ? 'active' : ''}
                      disableRipple
                      component="a"
                      onClick={closeSidebar}
                    >
                      Vendor Feedback
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

export default {
  VendorSidebarMenu,
  ClerkSidebarMenu,
  EngineeringAideSidebarMenu,
  QualityInspectorSidebarMenu,
  EngineerSidebarMenu,
  WOSupervisorSidebarMenu,
  TeamLeaderSidebarMenu,
  SectorManagerSidebarMenu,
  SystemAdminSidebarMenu
};