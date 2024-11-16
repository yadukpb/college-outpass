import React, { useState } from 'react';
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

const WardenDashboard = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

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

  const outpassRequests = [
    { id: 1, studentName: 'Ananthu', destination: 'Home', dateOfGoing: '2024-10-15', dateOfArrival: '2024-10-17', status: 'Pending' },
    { id: 2, studentName: 'Anandhu', destination: 'Library', dateOfGoing: '2024-10-11', dateOfArrival: '2024-10-11', status: 'Pending' },
    { id: 3, studentName: 'Yadu', destination: 'City XYZ', dateOfGoing: '2024-10-20', dateOfArrival: '2024-10-22', status: 'Pending' },
    { id: 4, studentName: 'Rahul', destination: 'Sports Event', dateOfGoing: '2024-10-18', dateOfArrival: '2024-10-19', status: 'Pending' },
    { id: 5, studentName: 'Shiraz', destination: 'Medical Appointment', dateOfGoing: '2024-10-25', dateOfArrival: '2024-10-25', status: 'Pending' },
  ];

  const renderDashboard = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Welcome, Warden!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Pending Approvals</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                {outpassRequests.filter(request => request.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Approved Today</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Rejected Today</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                1
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Outpass Requests</Typography>
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
                          <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }}>
                            Approve
                          </Button>
                          <Button variant="outlined" color="error" size="small">
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
                  <TableCell>Date of Going</TableCell>
                  <TableCell>Date of Arrival</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outpassRequests.filter(request => request.status === 'Pending').map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.studentName}</TableCell>
                    <TableCell>{request.destination}</TableCell>
                    <TableCell>{request.dateOfGoing}</TableCell>
                    <TableCell>{request.dateOfArrival}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }}>
                        Approve
                      </Button>
                      <Button variant="outlined" color="error" size="small">
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
              Warden Dashboard
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
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>
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

export default WardenDashboard;