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
  Stepper,
  Step,
  StepLabel,
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
  Divider,
  CircularProgress,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  Edit as EditIcon,
  VpnKey as VpnKeyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  ContactPhone as ContactPhoneIcon,
  Download as DownloadIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import NewOutpass from './NewOutpass'; 
import { keyframes } from '@mui/system';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { QRCodeSVG } from 'qrcode.react';
import OutpassPDF from '../utils/outpassPDF';
import ChatInterface from '../components/ChatInterface';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5A5F',
      light: '#FF7E82',
      dark: '#FF3B3F',
    },
    secondary: {
      main: '#00A699',
    },
    background: {
      default: '#F7F8FC',
    },
  },
  typography: {
    fontFamily: 'Circular, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif',
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
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 40, height: 40 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{value}</Typography>
    </Box>
  </Box>
);

const ProfileCard = ({ title, children, action }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{title}</Typography>
      {children}
    </CardContent>
    {action && (
      <Box sx={{ p: 2, pt: 0 }}>
        {action}
      </Box>
    )}
  </Card>
);

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    departmentId: '',
    classId: '',
    year: '',
    phoneNumber: '',
    hodId: '',
    wardenId: '',
    coordinatorId: '',
    parentInfo: {
      fatherName: '',
      fatherPhone: '',
      motherName: '',
      motherPhone: '',
      emergencyContact: ''
    }
  })

  const [departments, setDepartments] = useState([])
  const [classes, setClasses] = useState([])
  const [hods, setHods] = useState([])
  const [wardens, setWardens] = useState([])
  const [coordinators, setCoordinators] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAllData()
    fetchProfileData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [ hodsRes, wardensRes, coordsRes] = await Promise.all([
       
        axios.get('http://localhost:5001/api/staff/hods'),
        axios.get('http://localhost:5001/api/staff/wardens'),
        axios.get('http://localhost:5001/api/staff/coordinators')
      ])
      
      console.log('HODs:', hodsRes.data)
      console.log('Wardens:', wardensRes.data)
      console.log('Coordinators:', coordsRes.data)

      
      setHods(hodsRes.data || [])
      setWardens(wardensRes.data || [])
      setCoordinators(coordsRes.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data')
      setLoading(false)
    }
  }

  const fetchProfileData = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const response = await axios.get(`http://localhost:5001/api/student/profile/${userId}`)
      if (response.data.success) {
        setFormData(response.data.data)
        setIsEditing(response.data.data._id ? true : false)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setError('Failed to fetch profile data')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('parent.')) {
      const parentField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          [parentField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userId = localStorage.getItem('userId')
      const dataToSubmit = {
        userId,
        name: formData.name,
        rollNo: formData.rollNo,
        year: formData.year,
        phoneNumber: formData.phoneNumber,
        parentInfo: formData.parentInfo,
        hodId: formData.hodId,
        wardenId: formData.wardenId,
        coordinatorId: formData.coordinatorId
      }

      let response
      if (isEditing) {
        response = await axios.put(`http://localhost:5001/api/student/update-profile/${formData._id}`, dataToSubmit)
      } else {
        response = await axios.post('http://localhost:5001/api/student/complete-profile', dataToSubmit)
      }

      if (response.data.success) {
        localStorage.setItem('studentId', response.data.student._id)
        toast.success(isEditing ? 'Profile updated successfully' : 'Profile completed successfully')
        window.location.reload()
      }
    } catch (error) {
      console.error('Submission error:', error)
      setError(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'complete'} profile`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">{isEditing ? 'Edit Profile' : 'Complete Your Profile'}</Typography>
        {isEditing && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Roll Number"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                label="Department"
              >
                {departments && departments.map(dept => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                label="Class"
              >
                {classes && classes.map(cls => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Parent Information</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Father's Name"
              name="parent.fatherName"
              value={formData.parentInfo.fatherName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Father's Phone"
              name="parent.fatherPhone"
              value={formData.parentInfo.fatherPhone}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mother's Name"
              name="parent.motherName"
              value={formData.parentInfo.motherName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mother's Phone"
              name="parent.motherPhone"
              value={formData.parentInfo.motherPhone}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Emergency Contact"
              name="parent.emergencyContact"
              value={formData.parentInfo.emergencyContact}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>HOD</InputLabel>
              <Select
                name="hodId"
                value={formData.hodId}
                onChange={handleInputChange}
                label="HOD"
                required
              >
                {hods && hods.length > 0 && hods.map(hod => (
                  <MenuItem key={hod._id} value={hod._id}>
                    {hod.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Warden</InputLabel>
              <Select
                name="wardenId"
                value={formData.wardenId}
                onChange={handleInputChange}
                label="Warden"
                required
              >
                {wardens.length > 0 ? (
                  wardens.map(warden => (
                    <MenuItem key={warden._id} value={warden._id}>
                      {warden.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Wardens available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Coordinator</InputLabel>
              <Select
                name="coordinatorId"
                value={formData.coordinatorId}
                onChange={handleInputChange}
                label="Coordinator"
                required
              >
                {coordinators.length > 0 ? (
                  coordinators.map(coordinator => (
                    <MenuItem key={coordinator._id} value={coordinator._id}>
                      {coordinator.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Coordinators available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {isEditing ? 'Update Profile' : 'Complete Profile'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
`;

const RippleChip = ({ label, color }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Chip
        label={label}
        color={color}
        sx={{
          fontWeight: 'bold',
          borderRadius: '16px',
          px: 2,
          '& .MuiChip-label': { px: 1 },
          position: 'relative',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderRadius: '20px',
          border: '2px solid',
          borderColor: 'warning.main',
          animation: `${ripple} 1.5s ease-out infinite`,
        }}
      />
    </Box>
  );
};

const RecentOutpassStatus = ({ outpass }) => {
  const getStepNumber = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Approved':
        if (outpass.hodApproval?.status === 'Approved') return 4;
        if (outpass.wardenApproval?.status === 'Approved') return 3;
        if (outpass.coordinatorApproval?.status === 'Approved') return 2;
        return 1;
      case 'Rejected':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Outpass Status</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Going Out Date:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {new Date(outpass.dateOfGoing).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Going Out Time:</Typography>
            <Typography variant="body1" fontWeight="bold">{outpass.timeOfGoing}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Coming Back Date:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {new Date(outpass.dateOfArrival).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Coming Back Time:</Typography>
            <Typography variant="body1" fontWeight="bold">{outpass.timeOfArrival}</Typography>
          </Grid>
        </Grid>
        {outpass.qrCode && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" align="center">Exit QR Code:</Typography>
              <QRCodeSVG value={outpass.qrCode.exit} size={128} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" align="center">Entry QR Code:</Typography>
              <QRCodeSVG value={outpass.qrCode.entry} size={128} />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StudentDashboard = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [approvedOutpass, setApprovedOutpass] = useState(null);
  const [latestOutpass, setLatestOutpass] = useState(null);
  const [loading, setLoading] = useState(true);

  const outpassData = {
    id: '12345',
    studentId: 'S12345',
    destination: 'Home',
    dateOfGoing: '15/10/2024',
    timeOfGoing: '09:00 AM',
    dateOfArrival: '17/10/2024',
    timeOfArrival: '06:00 PM',
    status: 'Approved',
    hodApproved: true,
    activeStep: 4,
  };

  useEffect(() => {
    setApprovedOutpass(outpassData);
  }, []);

  useEffect(() => {
    const fetchLatestOutpass = async () => {
      try {
        // First get the student profile using userId
        const userId = localStorage.getItem('userId');
        const studentResponse = await axios.get(`http://localhost:5001/api/student/profile/${userId}`);
        
        if (studentResponse.data.success) {
          // Now use the student._id to fetch the latest outpass
          const studentId = studentResponse.data.data._id;
          localStorage.setItem('studentId', studentId); // Store for future use
          
          const outpassResponse = await axios.get(`http://localhost:5001/api/outpass/latest/${studentId}`);
          if (outpassResponse.data.success) {
            setLatestOutpass(outpassResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching latest outpass:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOutpass();
  }, []);

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
    localStorage.removeItem('studentId')
    window.location.href = '/login'
  }

  const drawer = (
    <Box sx={{ mt: isMobile ? 2 : 8, p: 2 }}>
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
          { text: 'New Request', icon: <AddCircleOutlineIcon />, view: 'newRequest' },
          { text: 'Outpass History', icon: <HistoryIcon />, view: 'outpassHistory' },
          { text: 'Profile', icon: <PersonIcon />, view: 'profile' },
          { text: 'Messages', icon: <MessageIcon />, view: 'messages' },
          
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

  const outpassSteps = ['Request Submitted', 'Warden Approval', 'Coordinator Approval', 'HOD Approval', 'Approved'];
  const activeStep = 3; // HOD Approval is pending

  const fetchOutpassHistory = async () => {
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        const userId = localStorage.getItem('userId');
        const profileResponse = await axios.get(`http://localhost:5001/api/student/profile/${userId}`);
        if (profileResponse.data.success) {
          localStorage.setItem('studentId', profileResponse.data.data._id);
          const response = await axios.get(`http://localhost:5001/api/outpass/student/${profileResponse.data.data._id}`);
          return response.data.data;
        }
      } else {
        const response = await axios.get(`http://localhost:5001/api/outpass/student/${studentId}`);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching outpass history:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const history = await fetchOutpassHistory();
      setOutpassHistory(history);
    };
    fetchData();
  }, []);

  const [outpassHistoryData, setOutpassHistory] = useState([]);

  const renderDashboard = () => (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2027', mb: 2 }}>
          Welcome back!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => handleViewChange('newRequest')}
          fullWidth
          sx={{
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          Create New Outpass Request
        </Button>
      </Box>
      <Grid container spacing={3}>
        {latestOutpass && (
          <Grid item xs={12}>
            <RecentOutpassStatus outpass={latestOutpass} />
          </Grid>
        )}
        <Grid item xs={12}>
          <Card sx={{ height: '100%', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                College Notifications
              </Typography>
              <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {[
                  { id: 1, title: "Campus Cleanup Drive", date: "2024-10-20", priority: "high" },
                  { id: 2, title: "Annual Sports Meet", date: "2024-11-15", priority: "medium" },
                  { id: 3, title: "Guest Lecture on AI", date: "2024-10-25", priority: "low" },
                  { id: 4, title: "Library Timings Extended", date: "2024-10-18", priority: "medium" },
                  { id: 5, title: "Scholarship Application Deadline", date: "2024-11-01", priority: "high" },
                ].map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      mb: 2,
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {notification.date}
                        </Typography>
                      }
                    />
                    <Chip
                      label={notification.priority}
                      size="small"
                      sx={{
                        backgroundColor:
                          notification.priority === 'high'
                            ? '#FFCDD2'
                            : notification.priority === 'medium'
                            ? '#FFF9C4'
                            : '#C8E6C9',
                        color:
                          notification.priority === 'high'
                            ? '#C62828'
                            : notification.priority === 'medium'
                            ? '#F9A825'
                            : '#2E7D32',
                        fontWeight: 'bold',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>Recent Requests</Typography>
              <List>
                {[
                  { destination: 'Library', date: '2024-10-11', status: 'Approved' },
                  { destination: 'Home', date: '2024-10-10', status: 'Rejected' },
                  { destination: 'Cafeteria', date: '2024-10-09', status: 'Approved' },
                  { destination: 'Gym', date: '2024-10-08', status: 'Pending' },
                ].map((request, index) => (
                  <ListItem key={index} sx={{ borderBottom: index !== 3 ? '1px solid #E0E0E0' : 'none', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                    <ListItemText
                      primary={request.destination}
                      secondary={`Date: ${request.date}`}
                      sx={{ mb: { xs: 1, sm: 0 } }}
                    />
                    <Chip
                      label={request.status}
                      sx={{
                        fontWeight: 'bold',
                        color: request.status === 'Approved' ? '#2E7D32' : request.status === 'Pending' ? '#ED6C02' : '#D32F2F',
                        backgroundColor: request.status === 'Approved' ? '#E8F5E9' : request.status === 'Pending' ? '#FFF3E0' : '#FFEBEE',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const renderOutpassHistory = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Outpass History
      </Typography>
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="outpass history table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 3 }}>Destination</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 3 }}>Going Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 3 }}>Going Time</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 3 }}>Arrival Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 3 }}>Arrival Time</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 3 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outpassHistoryData.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:nth-of-type(even)': { backgroundColor: 'background.default' },
                    '&:hover': { backgroundColor: 'action.hover' },
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ py: 3, fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', mr: 2, width: 32, height: 32, fontSize: '0.875rem' }}>{row.destination[0]}</Avatar>
                      {row.destination}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 3, fontSize: '0.875rem' }}>{row.dateOfGoing}</TableCell>
                  <TableCell align="right" sx={{ py: 3, fontSize: '0.875rem' }}>{row.timeOfGoing}</TableCell>
                  <TableCell align="right" sx={{ py: 3, fontSize: '0.875rem' }}>{row.dateOfArrival}</TableCell>
                  <TableCell align="right" sx={{ py: 3, fontSize: '0.875rem' }}>{row.timeOfArrival}</TableCell>
                  <TableCell align="right" sx={{ py: 3 }}>
                    <Chip
                      label={row.status}
                      color={
                        row.status === 'Approved' ? 'success' :
                        row.status === 'Pending' ? 'warning' : 'error'
                      }
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: '16px',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );

  const renderProfile = () => <Profile />;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'outpassHistory':
        return renderOutpassHistory();
      case 'profile':
        return renderProfile();
      case 'newRequest':
        return (
          <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
            <NewOutpass />
          </Box>
        );
      case 'messages':
        return <ChatInterface />;
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
              Student Outpass System
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
              <Avatar sx={{ bgcolor: 'primary.main' }}>JD</Avatar>
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
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                top: { xs: '56px', sm: '64px' }, // Adjust top position for mobile
                height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' }, // Adjust height for mobile
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                border: 'none',
                top: '64px', // Adjust top position for desktop
                height: 'calc(100% - 64px)', // Adjust height for desktop
              },
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
            mt: { xs: '56px', sm: '64px' }, // Add top margin to account for AppBar height
          }}
        >
          <Toolbar />
          {currentView === 'newRequest' ? (
            renderContent()
          ) : (
            <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 } }}>
              {renderContent()}
            </Container>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentDashboard;
