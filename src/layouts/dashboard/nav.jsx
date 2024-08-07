
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
// import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import DividerText from 'src/routes/divider';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';
// import { account } from 'src/_mock/account';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
// Import configurations from where they are defined
import { baseNavConfig, fullNavConfig, limitedNavConfig } from './config-navigation';


// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();

  // State to hold the logged-in user data
  const [user, setUser] = useState(null);
  const [navConfig, setNavConfig] = useState(baseNavConfig);  // default to baseNavConfig

  const upLg = useResponsive('up', 'lg');

  useEffect(() => {
    // Retrieve user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      if (JSON.parse(userData).email === 'admin@admin.com'){
        setUser(JSON.parse(userData));
        setNavConfig(fullNavConfig);
      }
      else {
      setUser(JSON.parse(userData));
      setNavConfig(limitedNavConfig);  // Logged in: use full navigation
      }  
    }else{
      setUser(null);
      setNavConfig(baseNavConfig); // Not logged in: use base navigation
    }

    // Close nav drawer when path changes
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = user ? (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Avatar src='/assets/images/avatars/avatar_25.jpg' alt="photoURL" />

      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2">{user.name}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {user.role}
        </Typography>
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1.5,
        textAlign: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      
        <Typography variant="h6">Want to contribute the research?</Typography>
          <RouterLink to="/login" style={{ marginRight: 8, textDecoration: 'none', color: 'inherit' }}>Sign in</RouterLink>
          |
          <RouterLink to="/register" style={{ marginLeft: 8, textDecoration: 'none', color: 'inherit' }}>Sign up</RouterLink>
      </Typography>
      
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
    {navConfig.map((item, index) => (
      <React.Fragment key={item.title}>
        <NavItem item={item} />
        {item.title === 'Insert Data' && user.email==='admin@admin.com' && <DividerText />}
      </React.Fragment>
    ))}
  </Stack>
  );

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
          
        },
      }}
    >
     
    <Box sx={{  mt: 3, ml:4 }}>
      <Logo />
    </Box>

      {renderAccount}

      {renderMenu}

      <Box sx={{ flexGrow: 1 }} />

      
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const pathname = usePathname();

  const active = item.path === pathname;

  return (
    <div>
      {/* <DividerText/> */}
      <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 'fontWeightMedium',
        ...(active && {
          color: 'primary.main',
          fontWeight: 'fontWeightSemiBold',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
    >
      <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
        {item.icon}
      </Box>

      <Box component="span">{item.title} </Box>
    </ListItemButton>
    </div>
    
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};
