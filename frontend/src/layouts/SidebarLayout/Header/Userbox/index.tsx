import { useEffect, useRef, useState } from 'react';

import NextLink from 'next/link';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  lighten,
  List,
  ListItem,
  ListItemText,
  Modal,
  Popover,
  Typography
} from '@mui/material';

import InboxTwoToneIcon from '@mui/icons-material/InboxTwoTone';
import { styled } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';


const ModalBox = styled(Box)(
  () => `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    background: #0a1a33;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 10px 35px rgba(0,0,0,0.4);
    padding: 32px;
    text-align: center;
    color: #fff;
    outline: none;
`
);


const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${lighten(theme.palette.secondary.main, 0.5)}
`
);




function HeaderUserbox() {
  const [storedRole, setStoredRole] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const handleLogoutClick = (): void => {
    handleClose(); // Close the popover
    setShowLogoutModal(true); // Open logout modal
  };

  const handleLogout = (): void => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleCancelLogout = (): void => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("email");

    setStoredRole(role ? `Role: ${role.toUpperCase()}` : null);
    setStoredEmail(email);
  }, []);
  const user = {
    name: storedEmail,
    avatar: 'https://cdn-icons-png.flaticon.com/512/9187/9187532.png',
    jobtitle: storedRole
  };

  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
        <Avatar variant="rounded" alt={user.name} src={user.avatar} />
        <Hidden mdDown>
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {user.jobtitle}
            </UserBoxDescription>
          </UserBoxText>
        </Hidden>
        <Hidden smDown>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Hidden>
      </UserBoxButton>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuUserBox sx={{ minWidth: 210 }} display="flex">
          <Avatar variant="rounded" alt={user.name} src={user.avatar} />
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {user.jobtitle}
            </UserBoxDescription>
          </UserBoxText>
        </MenuUserBox>
        <Divider sx={{ mb: 0 }} />
        <List sx={{ p: 1 }} component="nav">
          <NextLink href="/management/profile" passHref>
            <ListItem button>
              <AccountBoxTwoToneIcon fontSize="small" />
              <ListItemText primary="My Profile" />
            </ListItem>
          </NextLink>
        
        </List>
        <Divider />
        <Box sx={{ m: 1 }}>
        <Button color="primary" fullWidth onClick={handleLogoutClick}>
          <LockOpenTwoToneIcon sx={{ mr: 1 }} />
          Sign out
        </Button>
      </Box>
      </Popover>

      <Modal
        open={showLogoutModal}
        onClose={handleCancelLogout}
      >
        <ModalBox>
          <Typography variant="h4" sx={{ marginBottom: '12px' }}>
            Confirm Logout
          </Typography>
          <Typography sx={{ marginBottom: '24px', color: '#b5c7de' }}>
            Are you sure you want to log out?
          </Typography>

          <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button onClick={handleLogout} /* ... styling ... */>
              Logout
            </Button>
            <Button onClick={handleCancelLogout} /* ... styling ... */>
              Cancel
            </Button>
          </Box>
        </ModalBox>
      </Modal>
    </>
  );
}

export default HeaderUserbox;
