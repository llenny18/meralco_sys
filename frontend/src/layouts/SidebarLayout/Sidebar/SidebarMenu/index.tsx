// ============================================================================
// ALL SIDEBAR NAVIGATION COMPONENTS
// ============================================================================
// This file contains all 9 sidebar navigation components for different user roles
// Each component follows the same structure and styling patterns

import { useContext } from 'react';
import { useRouter } from 'next/router';
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
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import AccountBalanceWalletTwoToneIcon from '@mui/icons-material/AccountBalanceWalletTwoTone';
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
// 1. VENDOR REPRESENTATIVES SIDEBAR
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
              <NextLink href="/vendor/dashboard" passHref>
                <Button
                  className={currentRoute === '/vendor/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Home / Dashboard
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
                  My Projects
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
              <NextLink href="/vendor/compliance" passHref>
                <Button
                  className={currentRoute === '/vendor/compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CheckCircleTwoToneIcon />}
                >
                  Compliance Status
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
                  startIcon={<AccountBalanceWalletTwoToneIcon />}
                >
                  Billing Summary
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/messages" passHref>
                <Button
                  className={currentRoute === '/vendor/messages' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MessageTwoToneIcon />}
                >
                  Messages & Disputes
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/vendor/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/vendor/profile" passHref>
                <Button
                  className={currentRoute === '/vendor/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
// 2. CLERKS SIDEBAR
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
            Dashboard Items
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
                  Home / Dashboard
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
              <NextLink href="/clerk/notifications" passHref>
                <Button
                  className={currentRoute === '/clerk/notifications' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<NotificationsTwoToneIcon />}
                >
                  Notifications
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/calendar" passHref>
                <Button
                  className={currentRoute === '/clerk/calendar' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CalendarTodayTwoToneIcon />}
                >
                  Calendar
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
              <NextLink href="/clerk/reports" passHref>
                <Button
                  className={currentRoute === '/clerk/reports' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Reports
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/clerk/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/clerk/profile" passHref>
                <Button
                  className={currentRoute === '/clerk/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
// 3. ENGINEERING AIDE SIDEBAR
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
              <NextLink href="/eng-aide/dashboard" passHref>
                <Button
                  className={currentRoute === '/eng-aide/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Home / Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/eng-aide/projects" passHref>
                <Button
                  className={currentRoute === '/eng-aide/projects' ? 'active' : ''}
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
              <NextLink href="/eng-aide/documents" passHref>
                <Button
                  className={currentRoute === '/eng-aide/documents' ? 'active' : ''}
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
              <NextLink href="/eng-aide/workflow" passHref>
                <Button
                  className={currentRoute === '/eng-aide/workflow' ? 'active' : ''}
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
              <NextLink href="/eng-aide/notifications" passHref>
                <Button
                  className={currentRoute === '/eng-aide/notifications' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<NotificationsTwoToneIcon />}
                >
                  Notifications
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/eng-aide/calendar" passHref>
                <Button
                  className={currentRoute === '/eng-aide/calendar' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CalendarTodayTwoToneIcon />}
                >
                  Calendar
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/eng-aide/reports" passHref>
                <Button
                  className={currentRoute === '/eng-aide/reports' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Reports
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/eng-aide/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/eng-aide/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/eng-aide/profile" passHref>
                <Button
                  className={currentRoute === '/eng-aide/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
// 4. QUALITY INSPECTORS (QI) SIDEBAR
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
              <NextLink href="/qi/dashboard" passHref>
                <Button
                  className={currentRoute === '/qi/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Home / Dashboard
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
              <NextLink href="/qi/workload" passHref>
                <Button
                  className={currentRoute === '/qi/workload' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<WorkTwoToneIcon />}
                >
                  My Workload
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/audit-targets" passHref>
                <Button
                  className={currentRoute === '/qi/audit-targets' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GpsFixedTwoToneIcon />}
                >
                  Audit Targets
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
                  My Performance
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
            <ListItem component="div">
              <NextLink href="/qi/calendar" passHref>
                <Button
                  className={currentRoute === '/qi/calendar' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CalendarTodayTwoToneIcon />}
                >
                  Calendar
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/audit-logs" passHref>
                <Button
                  className={currentRoute === '/qi/audit-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Audit Logs
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/mobile" passHref>
                <Button
                  className={currentRoute === '/qi/mobile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PhoneAndroidTwoToneIcon />}
                >
                  Mobile View
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/qi/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/qi/profile" passHref>
                <Button
                  className={currentRoute === '/qi/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
// 5. ENGINEERS / DESIGN ENGINEERS SIDEBAR
// ============================================================================

export function EngineerSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

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
              <NextLink href="/engineer/dashboard" passHref>
                <Button
                  className={currentRoute === '/engineer/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HomeTwoToneIcon />}
                >
                  Home / Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/projects" passHref>
                <Button
                  className={currentRoute === '/engineer/projects' ? 'active' : ''}
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
              <NextLink href="/engineer/approvals" passHref>
                <Button
                  className={currentRoute === '/engineer/approvals' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CheckCircleTwoToneIcon />}
                >
                  Approvals
                </Button>
              </NextLink>
            </ListItem>
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
              <NextLink href="/engineer/workflow" passHref>
                <Button
                  className={currentRoute === '/engineer/workflow' ? 'active' : ''}
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
              <NextLink href="/engineer/analytics" passHref>
                <Button
                  className={currentRoute === '/engineer/analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BarChartTwoToneIcon />}
                >
                  Analytics
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/predictive-insights" passHref>
                <Button
                  className={currentRoute === '/engineer/predictive-insights' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TrendingUpTwoToneIcon />}
                >
                  Predictive Insights
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/sla-monitoring" passHref>
                <Button
                  className={currentRoute === '/engineer/sla-monitoring' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TimerTwoToneIcon />}
                >
                  SLA Monitoring
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/ai-assistant" passHref>
                <Button
                  className={currentRoute === '/engineer/ai-assistant' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SmartToyTwoToneIcon />}
                >
                  AI Assistant
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/calendar" passHref>
                <Button
                  className={currentRoute === '/engineer/calendar' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CalendarTodayTwoToneIcon />}
                >
                  Calendar
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
            <ListItem component="div">
              <NextLink href="/engineer/reports" passHref>
                <Button
                  className={currentRoute === '/engineer/reports' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Reports
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/engineer/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/engineer/profile" passHref>
                <Button
                  className={currentRoute === '/engineer/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
// 6. WORK ORDER (WO) SUPERVISORS SIDEBAR
// ============================================================================

export function WOSupervisorSidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

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
              <NextLink href="/supervisor/dashboard" passHref>
                <Button
                  className={currentRoute === '/supervisor/dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Home / Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/analytics" passHref>
                <Button
                  className={currentRoute === '/supervisor/analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BarChartTwoToneIcon />}
                >
                  Analytics Hub
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/projects" passHref>
                <Button
                  className={currentRoute === '/supervisor/projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<FolderTwoToneIcon />}
                >
                  All Projects
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/approvals" passHref>
                <Button
                  className={currentRoute === '/supervisor/approvals' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CheckCircleTwoToneIcon />}
                >
                  Approvals & Escalations
                </Button>
              </NextLink>
            </ListItem>
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
              <NextLink href="/supervisor/workflow" passHref>
                <Button
                  className={currentRoute === '/supervisor/workflow' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountTreeTwoToneIcon />}
                >
                  Workflow Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/sla-compliance" passHref>
                <Button
                  className={currentRoute === '/supervisor/sla-compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TimerTwoToneIcon />}
                >
                  SLA & Compliance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/billing" passHref>
                <Button
                  className={currentRoute === '/supervisor/billing' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountBalanceWalletTwoToneIcon />}
                >
                  Billing Overview
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/vendor-management" passHref>
                <Button
                  className={currentRoute === '/supervisor/vendor-management' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BusinessTwoToneIcon />}
                >
                  Vendor Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/penalties" passHref>
                <Button
                  className={currentRoute === '/supervisor/penalties' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GavelTwoToneIcon />}
                >
                  Penalty Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/qi-workload" passHref>
                <Button
                  className={currentRoute === '/supervisor/qi-workload' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GroupsTwoToneIcon />}
                >
                  QI Workload Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/ai-assistant" passHref>
                <Button
                  className={currentRoute === '/supervisor/ai-assistant' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SmartToyTwoToneIcon />}
                >
                  AI Assistant
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/predictive-analytics" passHref>
                <Button
                  className={currentRoute === '/supervisor/predictive-analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TrendingUpTwoToneIcon />}
                >
                  Predictive Analytics
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/calendar" passHref>
                <Button
                  className={currentRoute === '/supervisor/calendar' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CalendarTodayTwoToneIcon />}
                >
                  Calendar & Planning
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
            <ListItem component="div">
              <NextLink href="/supervisor/reports" passHref>
                <Button
                  className={currentRoute === '/supervisor/reports' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Reports Center
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/tv-dashboard" passHref>
                <Button
                  className={currentRoute === '/supervisor/tv-dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TvTwoToneIcon />}
                >
                  TV Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/supervisor/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/supervisor/profile" passHref>
                <Button
                  className={currentRoute === '/supervisor/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
// 7. TEAM LEADERS SIDEBAR
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
                  Executive Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/analytics" passHref>
                <Button
                  className={currentRoute === '/leader/analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<InsightsTwoToneIcon />}
                >
                  Analytics & Intelligence
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/strategic-projects" passHref>
                <Button
                  className={currentRoute === '/leader/strategic-projects' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TrackChangesTwoToneIcon />}
                >
                  Strategic Project View
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/team-management" passHref>
                <Button
                  className={currentRoute === '/leader/team-management' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<GroupsTwoToneIcon />}
                >
                  Team Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/performance" passHref>
                <Button
                  className={currentRoute === '/leader/performance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ShowChartTwoToneIcon />}
                >
                  Performance Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/sla-compliance" passHref>
                <Button
                  className={currentRoute === '/leader/sla-compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TimerTwoToneIcon />}
                >
                  SLA & Compliance Control
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/financial" passHref>
                <Button
                  className={currentRoute === '/leader/financial' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountBalanceWalletTwoToneIcon />}
                >
                  Financial Overview
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
                  startIcon={<GavelTwoToneIcon />}
                >
                  Penalty & Enforcement
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/process-optimization" passHref>
                <Button
                  className={currentRoute === '/leader/process-optimization' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BuildTwoToneIcon />}
                >
                  Process Optimization
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/ai-assistant" passHref>
                <Button
                  className={currentRoute === '/leader/ai-assistant' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SmartToyTwoToneIcon />}
                >
                  AI Strategic Assistant
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/predictive" passHref>
                <Button
                  className={currentRoute === '/leader/predictive' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TrendingUpTwoToneIcon />}
                >
                  Predictive & Trend Analysis
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/calendar" passHref>
                <Button
                  className={currentRoute === '/leader/calendar' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<CalendarTodayTwoToneIcon />}
                >
                  Strategic Calendar
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/access-management" passHref>
                <Button
                  className={currentRoute === '/leader/access-management' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<LockTwoToneIcon />}
                >
                  Access Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/reports" passHref>
                <Button
                  className={currentRoute === '/leader/reports' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AssessmentTwoToneIcon />}
                >
                  Executive Reports
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/tv-dashboard" passHref>
                <Button
                  className={currentRoute === '/leader/tv-dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TvTwoToneIcon />}
                >
                  TV Dashboard Control
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/continuous-improvement" passHref>
                <Button
                  className={currentRoute === '/leader/continuous-improvement' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AutorenewTwoToneIcon />}
                >
                  Continuous Improvement
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/audit-compliance" passHref>
                <Button
                  className={currentRoute === '/leader/audit-compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<VerifiedUserTwoToneIcon />}
                >
                  Audit & Compliance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/leader/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base Admin
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/leader/profile" passHref>
                <Button
                  className={currentRoute === '/leader/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  My Profile
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
              <NextLink href="/sector-manager/sector-analytics" passHref>
                <Button
                  className={currentRoute === '/sector-manager/sector-analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PieChartTwoToneIcon />}
                >
                  Sector Analytics
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/strategic-metrics" passHref>
                <Button
                  className={currentRoute === '/sector-manager/strategic-metrics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TimelineTwoToneIcon />}
                >
                  Strategic Metrics
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/sector-overview" passHref>
                <Button
                  className={currentRoute === '/sector-manager/sector-overview' ? 'active' : ''}
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
              <NextLink href="/sector-manager/performance" passHref>
                <Button
                  className={currentRoute === '/sector-manager/performance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SpeedTwoToneIcon />}
                >
                  Performance Dashboard
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
              <NextLink href="/sector-manager/risk-compliance" passHref>
                <Button
                  className={currentRoute === '/sector-manager/risk-compliance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<WarningTwoToneIcon />}
                >
                  Risk & Compliance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/predictive-intelligence" passHref>
                <Button
                  className={currentRoute === '/sector-manager/predictive-intelligence' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PsychologyTwoToneIcon />}
                >
                  Predictive Intelligence
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/ai-assistant" passHref>
                <Button
                  className={currentRoute === '/sector-manager/ai-assistant' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SmartToyTwoToneIcon />}
                >
                  AI Executive Assistant
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/reports" passHref>
                <Button
                  className={currentRoute === '/sector-manager/reports' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Executive Reports
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/strategic-planning" passHref>
                <Button
                  className={currentRoute === '/sector-manager/strategic-planning' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<EventNoteTwoToneIcon />}
                >
                  Strategic Planning
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/continuous-improvement" passHref>
                <Button
                  className={currentRoute === '/sector-manager/continuous-improvement' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TrendingUpTwoToneIcon />}
                >
                  Continuous Improvement
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/tv-dashboard" passHref>
                <Button
                  className={currentRoute === '/sector-manager/tv-dashboard' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<TvTwoToneIcon />}
                >
                  Sector TV Dashboard
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/sector-manager/profile" passHref>
                <Button
                  className={currentRoute === '/sector-manager/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  Executive Profile
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
                  Admin Dashboard
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
              <NextLink href="/admin/security" passHref>
                <Button
                  className={currentRoute === '/admin/security' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SecurityTwoToneIcon />}
                >
                  Security & Access Control
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/system-config" passHref>
                <Button
                  className={currentRoute === '/admin/system-config' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SettingsTwoToneIcon />}
                >
                  System Configuration
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/database" passHref>
                <Button
                  className={currentRoute === '/admin/database' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<StorageTwoToneIcon />}
                >
                  Database Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/notifications" passHref>
                <Button
                  className={currentRoute === '/admin/notifications' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<NotificationsActiveTwoToneIcon />}
                >
                  Notification Settings
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
                  SLA & Penalty Configuration
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/performance" passHref>
                <Button
                  className={currentRoute === '/admin/performance' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<SpeedTwoToneIcon />}
                >
                  System Performance
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/audit-logs" passHref>
                <Button
                  className={currentRoute === '/admin/audit-logs' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<HistoryTwoToneIcon />}
                >
                  Audit & Logs
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
                  Maintenance & Updates
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/integrations" passHref>
                <Button
                  className={currentRoute === '/admin/integrations' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<ExtensionTwoToneIcon />}
                >
                  Integrations
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/knowledge-base" passHref>
                <Button
                  className={currentRoute === '/admin/knowledge-base' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<MenuBookTwoToneIcon />}
                >
                  Knowledge Base Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/backup-recovery" passHref>
                <Button
                  className={currentRoute === '/admin/backup-recovery' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BackupTwoToneIcon />}
                >
                  Backup & Recovery
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/analytics" passHref>
                <Button
                  className={currentRoute === '/admin/analytics' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BarChartTwoToneIcon />}
                >
                  System Analytics
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/issue-management" passHref>
                <Button
                  className={currentRoute === '/admin/issue-management' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<BugReportTwoToneIcon />}
                >
                  Issue Management
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/email-settings" passHref>
                <Button
                  className={currentRoute === '/admin/email-settings' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<EmailTwoToneIcon />}
                >
                  Email Settings
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/ui-customization" passHref>
                <Button
                  className={currentRoute === '/admin/ui-customization' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PaletteTwoToneIcon />}
                >
                  UI Customization
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/mobile-app" passHref>
                <Button
                  className={currentRoute === '/admin/mobile-app' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<PhoneAndroidTwoToneIcon />}
                >
                  Mobile App Settings
                </Button>
              </NextLink>
            </ListItem>
            <ListItem component="div">
              <NextLink href="/admin/profile" passHref>
                <Button
                  className={currentRoute === '/admin/profile' ? 'active' : ''}
                  disableRipple
                  component="a"
                  onClick={closeSidebar}
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  Admin Profile
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