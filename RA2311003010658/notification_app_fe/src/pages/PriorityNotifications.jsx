import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Chip,
  Select, MenuItem, FormControl, InputLabel,
  CircularProgress, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import { fetchNotifications } from '../api/notifications'
import { Log } from '../middleware/logger'

const typeColors = {
  Placement: 'success',
  Result: 'warning',
  Event: 'info',
}

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
}

function getScore(notif) {
  const weight = TYPE_WEIGHT[notif.Type] || 0
  const timestamp = new Date(notif.Timestamp).getTime()
  return weight * 1e13 + timestamp
}

function getTopN(notifications, n) {
  return [...notifications]
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, n)
}

function PriorityNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [topN, setTopN] = useState(10)
  const [type, setType] = useState('')
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('readIds')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadAll()
  }, [type])

  async function loadAll() {
    setLoading(true)
    await Log('frontend', 'info', 'page', `loading priority notifications type=${type}`)
    // fetch large limit to get all notifications for priority sorting
    const data = await fetchNotifications(1, 100, type)
    setNotifications(data)
    setLoading(false)
  }

  function markAsRead(id) {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id]
      setReadIds(updated)
      localStorage.setItem('readIds', JSON.stringify(updated))
      Log('frontend', 'info', 'component', `priority notification ${id} marked as read`)
    }
  }

  const priorityList = getTopN(notifications, topN)
  const unreadCount = priorityList.filter(n => !readIds.includes(n.ID)).length

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          Priority Inbox
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* top N selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Show Top</InputLabel>
            <Select
              value={topN}
              label="Show Top"
              onChange={(e) => {
                setTopN(e.target.value)
                Log('frontend', 'info', 'component', `top N changed to ${e.target.value}`)
              }}
            >
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>

          {/* type filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={type}
              label="Filter by Type"
              onChange={(e) => {
                setType(e.target.value)
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
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : priorityList.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={5}>
          No notifications found
        </Typography>
      ) : (
        priorityList.map((notif, index) => {
          const isRead = readIds.includes(notif.ID)
          return (
            <Card
              key={notif.ID}
              onClick={() => markAsRead(notif.ID)}
              sx={{
                mb: 1.5,
                cursor: 'pointer',
                borderLeft: isRead ? '4px solid #ccc' : '4px solid #e65100',
                bgcolor: isRead ? '#fafafa' : '#fff',
                transition: '0.2s',
                '&:hover': { boxShadow: 3 }
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: '#e65100',
                        color: 'white',
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        fontWeight: 'bold'
                      }}
                    >
                      #{index + 1}
                    </Typography>
                    {!isRead && (
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: '#e65100', flexShrink: 0
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
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                  {notif.Timestamp}
                </Typography>
              </CardContent>
            </Card>
          )
        })
      )}
    </Box>
  )
}

export default PriorityNotifications
