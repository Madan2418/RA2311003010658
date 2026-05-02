import { useEffect, useState } from 'react'
import {
  Box, Typography, Chip, Select, MenuItem,
  FormControl, InputLabel, CircularProgress
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
  }, [type, topN])

  async function loadAll() {
    setLoading(true)
    await Log('frontend', 'info', 'page', `loading priority inbox topN=${topN} type=${type}`)
    const data = await fetchNotifications(1, topN, type)
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

  // data already filtered + limited by API; sort client-side by weight+recency
  const priorityList = getTopN(notifications, topN)
  const unreadCount = priorityList.filter(n => !readIds.includes(n.ID)).length

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Priority Inbox</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" sx={{ bgcolor: '#d32f2f', color: 'white', px: 1, py: 0.3, borderRadius: 1 }}>
              {unreadCount} unread
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Show Top</InputLabel>
            <Select
              value={topN}
              label="Show Top"
              onChange={(e) => setTopN(e.target.value)}
            >
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value)}
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
          <CircularProgress size={24} />
        </Box>
      ) : priorityList.length === 0 ? (
        <Typography color="text.secondary" mt={4} textAlign="center">
          No notifications found
        </Typography>
      ) : (
        priorityList.map((notif, index) => {
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
                borderLeft: isRead ? '3px solid #eee' : '3px solid #e65100',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#e65100', fontWeight: 'bold', minWidth: 20 }}
                >
                  #{index + 1}
                </Typography>
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
    </Box>
  )
}

export default PriorityNotifications