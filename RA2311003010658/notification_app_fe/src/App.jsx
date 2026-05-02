import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Log } from './middleware/logger'
import { useEffect } from 'react'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentTab = location.pathname === '/priority' ? 1 : 0

  useEffect(() => {
    Log('frontend', 'info', 'page', 'app loaded')
  }, [])

  const handleTabChange = (e, val) => {
    if (val === 0) navigate('/')
    else navigate('/priority')
    Log('frontend', 'info', 'component', `tab changed to ${val === 0 ? 'all' : 'priority'}`)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Campus Notifications
          </Typography>
        </Toolbar>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: '#283593' }}
        >
          <Tab label="All Notifications" />
          <Tab label="Priority Inbox" />
        </Tabs>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 3, px: 2 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default App
