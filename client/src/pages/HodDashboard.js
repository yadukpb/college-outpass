import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Drawer,
  Button,
  Menu,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    secondary: {
      main: '#388E3C',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const HodDashboard = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [outpassRequests, setOutpassRequests] = useState([]);

  const fetchOutpassRequests = async () => {
    try {
      const hodId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5001/api/outpass/pending/hod/${hodId}`);
      const data = await response.json();
      if (data.success) {
        setOutpassRequests(data.data.map(request => ({
          id: request._id,
          studentName: request.student?.name || 'Unknown Student',
          destination: request.destination,
          dateOfGoing: new Date(request.dateOfGoing).toLocaleDateString() + ' ' + request.timeOfGoing,
          dateOfArrival: new Date(request.dateOfArrival).toLocaleDateString() + ' ' + request.timeOfArrival,
          status: request.status,
          reason: request.reason,
          coordinatorApproval: request.coordinatorApproval,
          wardenApproval: request.wardenApproval,
          hodApproval: request.hodApproval
        })));
      }
    } catch (error) {
      console.error('Error fetching outpass requests:', error);
    }
  };

  useEffect(() => {
    fetchOutpassRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/outpass/${requestId}/hod-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Approved',
          remarks: 'Approved by HOD'
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOutpassRequests(prevRequests => 
          prevRequests.filter(request => request.id !== requestId)
        );
      }
    } catch (error) {
      console.error('Error approving outpass:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/outpass/${requestId}/hod-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Rejected',
          remarks: 'Rejected by HOD'
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOutpassRequests(prevRequests => 
          prevRequests.filter(request => request.id !== requestId)
        );
      }
    } catch (error) {
      console.error('Error rejecting outpass:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    window.location.href = '/login'
  }

  const drawer = (
    <Box sx={{ mt: isMobile ? 2 : 8, p: 2 }}>
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
          { text: 'Pending Approvals', icon: <HistoryIcon />, view: 'pendingApprovals' },
          { text: 'Approved Outpasses', icon: <CheckCircleIcon />, view: 'approvedOutpasses' },
          { text: 'Rejected Outpasses', icon: <CancelIcon />, view: 'rejectedOutpasses' },
          { text: 'Profile', icon: <PersonIcon />, view: 'profile' },
        ].map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleViewChange(item.view)}
            sx={{ 
              borderRadius: '8px', 
              mb: 1, 
              '&:hover': { backgroundColor: theme.palette.primary.light },
              backgroundColor: currentView === item.view ? theme.palette.primary.light : 'transparent',
            }}
          >
            <Avatar sx={{ mr: 2, backgroundColor: theme.palette.primary.main }}>
              {item.icon}
            </Avatar>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderDashboard = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Welcome, HOD!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Pending Outpass Requests</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Date of Going</TableCell>
                      <TableCell>Date of Arrival</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {outpassRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.destination}</TableCell>
                        <TableCell>{request.dateOfGoing}</TableCell>
                        <TableCell>{request.dateOfArrival}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={request.status === 'Pending' ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const renderPendingApprovals = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Pending Approvals
      </Typography>
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Going Out</TableCell>
                  <TableCell>Coming Back</TableCell>
                  <TableCell>Approvals</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outpassRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.studentName}</TableCell>
                    <TableCell>{request.destination}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{request.dateOfGoing}</TableCell>
                    <TableCell>{request.dateOfArrival}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={`Coordinator: ${request.coordinatorApproval.status}`}
                          color={request.coordinatorApproval.status === 'Approved' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Chip
                          label={`Warden: ${request.wardenApproval.status}`}
                          color={request.wardenApproval.status === 'Approved' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleApprove(request.id)}
                          startIcon={<CheckCircleIcon />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleReject(request.id)}
                          startIcon={<CancelIcon />}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );

  const renderApprovedOutpasses = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Approved Outpasses
      </Typography>
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Date of Going</TableCell>
                  <TableCell>Date of Arrival</TableCell>
                  <TableCell>Approved On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add sample approved outpasses data here */}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );

  const renderRejectedOutpasses = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Rejected Outpasses
      </Typography>
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Date of Going</TableCell>
                  <TableCell>Date of Arrival</TableCell>
                  <TableCell>Rejected On</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add sample rejected outpasses data here */}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'pendingApprovals':
        return renderPendingApprovals();
      case 'approvedOutpasses':
        return renderApprovedOutpasses();
      case 'rejectedOutpasses':
        return renderRejectedOutpasses();
      case 'profile':
        return <Typography>Profile Content</Typography>;
      default:
        return renderDashboard();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold', flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              HOD Dashboard
            </Typography>
            <IconButton color="primary" sx={{ mr: 2 }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="primary"
            >
              <Avatar sx={{ bgcolor: 'primary.main' }}>W</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleViewChange('profile')}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
            overflow: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 } }}>
            {renderContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HodDashboard;
