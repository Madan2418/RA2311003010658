import { useEffect, useState } from 'react'
import {
  Box, Typography, Chip, Select, MenuItem,
  FormControl, InputLabel, Pagination, CircularProgress
} from '@mui/material'
import { fetchNotifications } from '../api/notifications'
import { Log } from '../middleware/logger'

const typeColors = {
  Placement: 'success',
  Result: 'warning',
  Event: 'info',
}

function AllNotifications() {
  const [notifications, setNotifications] = useState([])
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(false)
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('readIds')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadNotifications()
  }, [page, type])

  async function loadNotifications() {
    setLoading(true)
    await Log('frontend', 'info', 'page', `loading page=${page} type=${type}`)
    const data = await fetchNotifications(page, 10, type)
    setNotifications(data)
    setLoading(false)
  }

  function markAsRead(id) {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id]
      setReadIds(updated)
      localStorage.setItem('readIds', JSON.stringify(updated))
    }
  }

  const unreadCount = notifications.filter(n => !readIds.includes(n.ID)).length

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">All Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" sx={{ bgcolor: '#d32f2f', color: 'white', px: 1, py: 0.3, borderRadius: 1 }}>
              {unreadCount} unread
            </Typography>
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => { setType(e.target.value); setPage(1) }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography color="text.secondary" mt={4} textAlign="center">
          No notifications found
        </Typography>
      ) : (
        notifications.map((notif) => {
          const isRead = readIds.includes(notif.ID)
          return (
            <Box
              key={notif.ID}
              onClick={() => markAsRead(notif.ID)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                mb: 0.5,
                cursor: 'pointer',
                bgcolor: isRead ? '#fafafa' : '#fff',
                borderBottom: '1px solid #eee',
                borderLeft: isRead ? '3px solid #eee' : '3px solid #1a237e',
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={isRead ? 'normal' : 'bold'}
                  color={isRead ? 'text.secondary' : 'text.primary'}
                >
                  {notif.Message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notif.Timestamp}
                </Typography>
              </Box>
              <Chip
                label={notif.Type}
                color={typeColors[notif.Type] || 'default'}
                size="small"
                variant={isRead ? 'outlined' : 'filled'}
              />
            </Box>
          )
        })
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={10}
          page={page}
          onChange={(e, val) => setPage(val)}
          size="small"
        />
      </Box>
    </Box>
  )
}

export default AllNotifications
