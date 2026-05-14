'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, List, ListItem,
  ListItemText, Chip, Pagination, FormControl, InputLabel,
  Select, MenuItem, Divider, CircularProgress, Alert, Tooltip,
} from '@mui/material';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { fetchNotifications, Notification } from '@/services/api.service';
import { useReadTracker } from '@/hooks/useReadTracker';
import { Log } from '@/utils/logger';

const LIMIT = 10;

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState('');
  const { isRead, markAsRead } = useReadTracker();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Log('frontend', 'info', 'page', `Loading all notifications page=${page} type=${filterType}`);
      const res = await fetchNotifications(page, filterType, LIMIT);
      const data = res.notifications || [];
      setNotifications(data);
      // Mark fetched notifications as read automatically when viewed
      data.forEach(n => markAsRead(n.ID));
      setTotal(data.length >= LIMIT ? page * LIMIT + 1 : (page - 1) * LIMIT + data.length);
      await Log('frontend', 'info', 'page', `Loaded ${data.length} notifications`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load';
      setError(msg);
      await Log('frontend', 'error', 'page', `Failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => { load(); }, [load]);

  const typeColor = (t: string) =>
    t === 'Placement' ? 'primary' : t === 'Result' ? 'secondary' : 'default';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          All Notifications
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            label="Filter by Type"
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Placement">📋 Placement</MenuItem>
            <MenuItem value="Result">📊 Result</MenuItem>
            <MenuItem value="Event">🎉 Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List disablePadding>
              {notifications.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No notifications found."
                    sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}
                  />
                </ListItem>
              ) : notifications.map((n, i) => {
                const wasNew = !isRead(n.ID);
                return (
                  <React.Fragment key={n.ID}>
                    <ListItem
                      sx={{
                        py: 1.5, px: 2,
                        bgcolor: wasNew ? 'rgba(144,202,249,0.08)' : 'transparent',
                        transition: 'background 0.3s',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {wasNew && <FiberNewIcon color="primary" fontSize="small" />}
                            <Chip label={n.Type} size="small" color={typeColor(n.Type) as any} />
                            <Typography variant="body1" fontWeight={wasNew ? 600 : 400}>
                              {n.Message}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Tooltip title={n.Timestamp}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(n.Timestamp).toLocaleString('en-IN')}
                            </Typography>
                          </Tooltip>
                        }
                      />
                    </ListItem>
                    {i < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>

          {total > LIMIT && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(total / LIMIT)}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                showFirstButton showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
