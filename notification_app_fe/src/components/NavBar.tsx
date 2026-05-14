'use client';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  return (
    <AppBar position="sticky" elevation={2} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary.main">
            NotifyHub
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<NotificationsIcon />}
            variant={pathname === '/' ? 'contained' : 'outlined'}
            size="small"
          >
            All
          </Button>
          <Button
            component={Link}
            href="/priority"
            startIcon={<StarIcon />}
            variant={pathname === '/priority' ? 'contained' : 'outlined'}
            size="small"
            color="secondary"
          >
            Priority Inbox
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
