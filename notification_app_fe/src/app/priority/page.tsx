'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, List, ListItem,
  ListItemText, Chip, Divider, CircularProgress, Alert,
  TextField, Tooltip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { fetchNotifications, Notification } from '@/services/api.service';
import { useReadTracker } from '@/hooks/useReadTracker';
import { Log } from '@/utils/logger';

const PRIORITY_SCORE: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };

function getTopN(notifications: Notification[], n: number): Notification[] {
  return [...notifications]
    .sort((a, b) => {
      const pd = (PRIORITY_SCORE[b.Type] || 0) - (PRIORITY_SCORE[a.Type] || 0);
      if (pd !== 0) return pd;
      return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
    })
    .slice(0, n);
}

export default function PriorityInboxPage() {
  const [all, setAll] = useState<Notification[]>([]);
  const [displayed, setDisplayed] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState('');
  const { isRead, markAsRead } = useReadTracker();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Log('frontend', 'info', 'page', `Loading priority inbox topN=${topN}`);
      // Fetch top recent notifications to compute priority locally
      const res = await fetchNotifications(1, '', 10);
      const data = res.notifications || [];
      setAll(data);
      await Log('frontend', 'info', 'page', `Priority inbox loaded ${data.length} notifications`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load';
      setError(msg);
      await Log('frontend', 'error', 'page', `Priority inbox failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let filtered = filterType ? all.filter(n => n.Type === filterType) : all;
    const top = getTopN(filtered, topN);
    top.forEach(n => markAsRead(n.ID));
    setDisplayed(top);
  }, [all, topN, filterType]);

  const typeColor = (t: string) =>
    t === 'Placement' ? 'primary' : t === 'Result' ? 'secondary' : 'default';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <StarIcon color="warning" sx={{ fontSize: 30 }} />
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Top notifications ranked by priority (Placement &gt; Result &gt; Event) and recency.
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Show Top N"
          type="number"
          size="small"
          value={topN}
          onChange={e => setTopN(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
          slotProps={{ htmlInput: { min: 1, max: 50 } }}
          sx={{ width: 130 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            label="Filter by Type"
            onChange={e => setFilterType(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Placement">📋 Placement</MenuItem>
            <MenuItem value="Result">📊 Result</MenuItem>
            <MenuItem value="Event">🎉 Event</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          Showing {displayed.length} of {topN} requested
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            {displayed.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No priority notifications found."
                  sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}
                />
              </ListItem>
            ) : displayed.map((n, i) => {
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
                    {/* Priority Rank Badge */}
                    <Box sx={{
                      minWidth: 36, height: 36, borderRadius: '50%',
                      bgcolor: 'primary.main', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', mr: 2,
                    }}>
                      <Typography variant="caption" fontWeight={700} color="white">
                        #{i + 1}
                      </Typography>
                    </Box>
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
                  {i < displayed.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}
    </Container>
  );
}
