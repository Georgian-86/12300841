'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Pagination, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider,
  Button
} from '@mui/material';
import { fetchNotifications, fetchPriorityNotifications, markRead } from '@/services/api.service';
import { Log } from '../../../logging_middleware/src/logger';

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await fetchNotifications(page, type);
        setNotifications(res.data);
        setTotal(res.pagination.total);
      } else {
        const res = await fetchPriorityNotifications();
        setNotifications(res.data);
        setTotal(res.data.length);
      }
      await Log('frontend', 'info', 'page', 'Dashboard data loaded');
    } catch (err) {
      await Log('frontend', 'error', 'page', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab, page, type]);

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    loadData();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Notifications
        </Typography>
        {tab === 0 && (
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => { setType(e.target.value); setPage(1); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }}>
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>
      </Box>

      <Paper elevation={2}>
        <List>
          {notifications.map((n, i) => (
            <React.Fragment key={n.id}>
              <ListItem 
                sx={{ 
                  bgcolor: n.is_read ? 'transparent' : 'rgba(144, 202, 249, 0.08)',
                  transition: '0.3s',
                  '&:hover': { bgcolor: 'rgba(144, 202, 249, 0.12)' }
                }}
                secondaryAction={
                  !n.is_read && (
                    <Button size="small" onClick={() => handleMarkRead(n.id)}>
                      Mark Read
                    </Button>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={n.is_read ? 400 : 700}>
                        {n.message}
                      </Typography>
                      <Chip 
                        label={n.type} 
                        size="small" 
                        color={n.type === 'Placement' ? 'primary' : n.type === 'Result' ? 'secondary' : 'default'}
                      />
                    </Box>
                  }
                  secondary={new Date(n.createdAt).toLocaleString()}
                />
              </ListItem>
              {i < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText primary="No notifications found" sx={{ textAlign: 'center', color: 'text.secondary' }} />
            </ListItem>
          )}
        </List>
      </Paper>

      {tab === 0 && total > 10 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(total / 10)} 
            page={page} 
            onChange={(_, v) => setPage(v)} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
}
