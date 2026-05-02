import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material'
import { Log } from './middleware/logger'
import { useEffect } from 'react'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = location.pathname === '/priority' ? 1 : 0

  useEffect(() => {
    Log('frontend', 'info', 'page', 'app loaded')
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a237e' }}>
        <Toolbar variant="dense">
          <Typography variant="subtitle1" fontWeight="bold">
            Campus Notifications
          </Typography>
        </Toolbar>
        <Tabs
          value={currentTab}
          onChange={(e, val) => {
            navigate(val === 0 ? '/' : '/priority')
            Log('frontend', 'info', 'component', `tab switched`)
          }}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: '#283593', minHeight: 36 }}
        >
          <Tab label="All Notifications" sx={{ fontSize: 12, minHeight: 36 }} />
          <Tab label="Priority Inbox" sx={{ fontSize: 12, minHeight: 36 }} />
        </Tabs>
      </AppBar>

      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 3, px: 2 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default App
