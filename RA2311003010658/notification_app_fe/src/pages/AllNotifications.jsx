import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Chip,
  Select, MenuItem, FormControl, InputLabel,
  Pagination, CircularProgress, Badge
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
    // load read notifications from localStorage
    const saved = localStorage.getItem('readIds')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadNotifications()
  }, [page, type])

  async function loadNotifications() {
    setLoading(true)
    await Log('frontend', 'info', 'page', `loading all notifications page=${page} type=${type}`)
    const data = await fetchNotifications(page, 10, type)
    setNotifications(data)
    setLoading(false)
  }

  function markAsRead(id) {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id]
      setReadIds(updated)
      localStorage.setItem('readIds', JSON.stringify(updated))
      Log('frontend', 'info', 'component', `notification ${id} marked as read`)
    }
  }

  const unreadCount = notifications.filter(n => !readIds.includes(n.ID)).length

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          All Notifications
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={type}
            label="Filter by Type"
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
              Log('frontend', 'info', 'component', `filter changed to ${e.target.value}`)
            }}
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
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={5}>
          No notifications found
        </Typography>
      ) : (
        notifications.map((notif) => {
          const isRead = readIds.includes(notif.ID)
          return (
            <Card
              key={notif.ID}
              onClick={() => markAsRead(notif.ID)}
              sx={{
                mb: 1.5,
                cursor: 'pointer',
                borderLeft: isRead ? '4px solid #ccc' : '4px solid #1a237e',
                bgcolor: isRead ? '#fafafa' : '#fff',
                transition: '0.2s',
                '&:hover': { boxShadow: 3 }
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!isRead && (
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: '#1a237e', flexShrink: 0
                      }} />
                    )}
                    <Typography fontWeight={isRead ? 'normal' : 'bold'}>
                      {notif.Message}
                    </Typography>
                  </Box>
                  <Chip
                    label={notif.Type}
                    color={typeColors[notif.Type] || 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: isRead ? 0 : 2 }}>
                  {notif.Timestamp}
                </Typography>
              </CardContent>
            </Card>
          )
        })
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={10}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Box>
    </Box>
  )
}

export default AllNotifications
