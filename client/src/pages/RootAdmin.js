import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Verified as VerifiedIcon,
  Error as ErrorIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, RadialBarChart, RadialBar, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import axios from 'axios';

const drawerWidth = 240;


// BCA,MCA,BBA,DATA SCINCE,Int MCA,BSC Visual media,BSC Chemistry,MA English,BA english ,b.com tax

// HOD-cs
// commerce
// b.com tax

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
});

const StudentManagement = () => {
  const [view, setView] = useState('list');
  const [emails, setEmails] = useState(['']);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentFilters, setStudentFilters] = useState({
    year: 'all',
    department: 'all',
    search: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/students');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmailField = () => {
    setEmails([...emails, '']);
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleRemoveEmailField = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleAddStudents = async () => {
    const validEmails = emails.filter(email => email.trim() !== '');
    
    if (validEmails.length === 0) {
      console.error('No valid emails provided');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/register-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: validEmails })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchStudents();
      setEmails(['']);
      setView('list');
    } catch (error) {
      console.error('Error adding students:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesYear = studentFilters.year === 'all' || student.year === studentFilters.year;
    const matchesDepartment = studentFilters.department === 'all' || student.department === studentFilters.department;
    const matchesSearch = !studentFilters.search || 
      student.name.toLowerCase().includes(studentFilters.search.toLowerCase()) ||
      student.email.toLowerCase().includes(studentFilters.search.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(studentFilters.search.toLowerCase());

    return matchesYear && matchesDepartment && matchesSearch;
  });

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2027', mb: { xs: 2, sm: 0 } }}>
          Student Management
        </Typography>
        <Box>
          <Button
            variant={view === 'list' ? 'contained' : 'outlined'}
            onClick={() => setView('list')}
            sx={{ mr: 1 }}
          >
            Student List
          </Button>
          <Button
            variant={view === 'add' ? 'contained' : 'outlined'}
            onClick={() => setView('add')}
          >
            Add Students
          </Button>
        </Box>
      </Box>
      
      {view === 'list' && (
        <Card>
          <CardContent>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={studentFilters.year}
                    onChange={(e) => setStudentFilters({ ...studentFilters, year: e.target.value })}
                  >
                    <MenuItem value="all">All Years</MenuItem>
                    <MenuItem value="1st">1st Year</MenuItem>
                    <MenuItem value="2nd">2nd Year</MenuItem>
                    <MenuItem value="3rd">3rd Year</MenuItem>
                    <MenuItem value="4th">4th Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={studentFilters.department}
                    onChange={(e) => setStudentFilters({ ...studentFilters, department: e.target.value })}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Mechanical">Mechanical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Hostel</InputLabel>
                  <Select
                    value={studentFilters.hostel}
                    onChange={(e) => setStudentFilters({ ...studentFilters, hostel: e.target.value })}
                  >
                    <MenuItem value="all">All Hostels</MenuItem>
                    <MenuItem value="A Block">A Block</MenuItem>
                    <MenuItem value="B Block">B Block</MenuItem>
                    <MenuItem value="C Block">C Block</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search by Name/Roll No/Email"
                  InputProps={{
                    endAdornment: <SearchIcon />
                  }}
                />
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Coordinator</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">No students found</TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.coordinator}</TableCell>
                        <TableCell>
                          <Chip
                            icon={student.signedUp ? <CheckCircleIcon /> : <CancelIcon />}
                            label={student.signedUp ? 'Signed Up' : 'Not Signed Up'}
                            color={student.signedUp ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                            Edit
                          </Button>
                          <Button variant="outlined" color="error" size="small">
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {view === 'add' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Student Emails</Typography>
            {emails.map((email, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label={`Student Email ${index + 1}`}
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  sx={{ mr: 1 }}
                />
                {index === emails.length - 1 ? (
                  <IconButton onClick={handleAddEmailField} color="primary">
                    <AddIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleRemoveEmailField(index)} color="error">
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button variant="contained" color="primary" onClick={handleAddStudents} sx={{ mt: 2 }}>
              Add Students
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

const RootAdminDashboard = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [openAddStaffDialog, setOpenAddStaffDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Rajesh Verma',
    email: 'admin@college.edu',
    role: 'Root Admin',
    department: 'Administration',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [outpassData, setOutpassData] = useState([]);
  const [outpassStats, setOutpassStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    studentsOutOfCampus: 0,
    totalRequests: 0,
    weeklyData: {}
  });
  const [staffMembers, setStaffMembers] = useState({
    hod: [],
    coordinator: [],
    warden: []
  });
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    priority: 'low',
  });
  const [departments, setDepartments] = useState([
    { name: 'Computer Science', branches: ['AI', 'ML', 'Cybersecurity'] },
    { name: 'Electronics', branches: ['Embedded Systems', 'VLSI', 'Communication'] },
    { name: 'Mechanical', branches: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing'] },
  ]);
  const [newDepartment, setNewDepartment] = useState({ name: '', hod: '', branches: [] });
  const [newBranch, setNewBranch] = useState({ name: '', year: '', isActive: true, coordinator: '' });
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    branch: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOutpassData();
  }, []);

  const fetchOutpassData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/outpass/all');
      const data = await response.json();
      
      if (data.success) {
        setOutpassData(data.data);
        calculateOutpassStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching outpass data:', error);
    }
  };

  const calculateOutpassStats = (outpasses) => {
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      studentsOutOfCampus: 0,
      totalRequests: outpasses.length,
      weeklyData: {}
    };

    const now = new Date();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    outpasses.forEach(outpass => {
      // Status counts
      if (outpass.status === 'Pending') stats.pending++;
      else if (outpass.status === 'Approved') stats.approved++;
      else if (outpass.status === 'Rejected') stats.rejected++;

      // Count active outpasses (students currently out)
      if (outpass.status === 'Active') stats.studentsOutOfCampus++;

      // Weekly data
      const createdDate = new Date(outpass.createdAt);
      if (now - createdDate <= 7 * 24 * 60 * 60 * 1000) {
        const dayName = weekDays[createdDate.getDay()];
        stats.weeklyData[dayName] = (stats.weeklyData[dayName] || 0) + 1;
      }
    });

    setOutpassStats(stats);
  };

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://localhost:5001/api/staff/hods'),
          fetch('http://localhost:5001/api/staff/coordinators'),
          fetch('http://localhost:5001/api/staff/wardens')
        ]);

        const [hodsData, coordinatorsData, wardensData] = await Promise.all(
          responses.map(res => res.json())
        );

        setStaffMembers({
          hod: hodsData,
          coordinator: coordinatorsData,
          warden: wardensData
        });
      } catch (error) {
        console.error('Error fetching staff members:', error);
      }
    };

    fetchStaffMembers();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.content) return;
      
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:5001/api/notifications', {
        ...newNotification,
        createdBy: userId
      });
      
      if (response.data.success) {
        await fetchNotifications();
        setNewNotification({ title: '', content: '', priority: 'low' });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/notifications/${id}`);
      if (response.data.success) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
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

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    setEditMode(false);
  };

  const handleChangePassword = () => {
    setPasswordChangeMode(true);
  };

  const handleSavePassword = () => {
    if (newPassword === confirmPassword) {
      setPasswordChangeMode(false);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert("Passwords don't match!");
    }
  };

  const handleAddDepartment = () => {
    const newDepartment = { name: '', branches: [] };
    setDepartments([...departments, newDepartment]);
  };

  const handleAddBranch = () => {
    setNewDepartment({ ...newDepartment, branches: [...newDepartment.branches, newBranch] });
    setNewBranch({ name: '', year: '', isActive: true, coordinator: '' });
  };

  const handleAddStaff = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/register-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStaff)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStaffMembers([...staffMembers, data]);
      setOpenAddStaffDialog(false);
      setNewStaff({ name: '', email: '', role: '', department: '', branch: '' });
    } catch (error) {
      console.error('Error adding staff:', error);
    }
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
          { text: 'Staff Management', icon: <SupervisorIcon />, view: 'staff' },
          { text: 'Student Management', icon: <SchoolIcon />, view: 'students' },
          { text: 'Notice Board', icon: <NotificationsIcon />, view: 'notices' },
          { text: 'Profile', icon: <PersonIcon />, view: 'profile' },
        ].map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleViewChange(item.view)}
            sx={{ 
              borderRadius: '8px', 
              mb: 1,
              backgroundColor: currentView === item.view ? 'primary.light' : 'transparent',
            }}
          >
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {item.icon}
            </Avatar>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderDashboard = () => {
    const pieChartData = [
      { name: 'Pending', value: outpassStats.pending },
      { name: 'Approved', value: outpassStats.approved },
      { name: 'Rejected', value: outpassStats.rejected },
    ];

    const COLORS = ['#FFA500', '#4CAF50', '#F44336'];

    const radialBarData = [
      { name: 'Students Out', value: outpassStats.studentsOutOfCampus, fill: '#2196F3' },
    ];

    return (
      <>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
          Root Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Outpass Request Status</Typography>
                <PieChart width={300} height={300}>
                  <Pie
                    data={pieChartData}
                    cx={150}
                    cy={150}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  {pieChartData.map((entry, index) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Box sx={{ width: 10, height: 10, backgroundColor: COLORS[index], mr: 1 }} />
                      <Typography variant="body2">{entry.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Students Out of Campus</Typography>
                <RadialBarChart 
                  width={300} 
                  height={300} 
                  cx={150} 
                  cy={150} 
                  innerRadius={20} 
                  outerRadius={140} 
                  barSize={30} 
                  data={radialBarData}
                >
                  <RadialBar
                    minAngle={15}
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    clockWise
                    dataKey="value"
                  />
                </RadialBarChart>
                <Typography variant="h4" align="center" sx={{ mt: 2 }}>
                  {outpassStats.studentsOutOfCampus} / {outpassStats.totalRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, overflowX: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1A2027' }}>
            Recent Outpass Requests
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Departure Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Current Approver</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outpassData.map((outpass) => (
                  <TableRow key={outpass._id}>
                    <TableCell>{outpass.student?.name}</TableCell>
                    <TableCell>{outpass.student?.rollNo}</TableCell>
                    <TableCell>{new Date(outpass.dateOfGoing).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(outpass.dateOfArrival).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={outpass.status} 
                        color={
                          outpass.status === 'Pending' ? 'warning' :
                          outpass.status === 'Approved' ? 'success' : 'error'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{outpass.currentApprover}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </>
    );
  };

  const renderStaffManagement = () => (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        Staff Management
      </Typography>
      
      {['HOD', 'Warden', 'Coordinator'].map((role) => (
        <Card key={role} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{role}s</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewStaff({ ...newStaff, role });
                  setOpenAddStaffDialog(true);
                }}
              >
                Add New {role}
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    {role === 'HOD' && <TableCell>Department</TableCell>}
                    {role === 'Coordinator' && (
                      <>
                        <TableCell>Department</TableCell>
                        <TableCell>Branch</TableCell>
                      </>
                    )}
                    {role === 'Warden' && <TableCell>Hostel</TableCell>}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffMembers[role.toLowerCase()]?.map((staff) => (
                    <TableRow key={staff._id}>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      {role === 'HOD' && <TableCell>{staff.department}</TableCell>}
                      {role === 'Coordinator' && (
                        <>
                          <TableCell>{staff.department}</TableCell>
                          <TableCell>{staff.branch}</TableCell>
                        </>
                      )}
                      {role === 'Warden' && <TableCell>{staff.hostel}</TableCell>}
                      <TableCell>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button variant="outlined" color="error" size="small">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      <Dialog open={openAddStaffDialog} onClose={() => setOpenAddStaffDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Staff Member</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <MenuItem value="HOD">HOD</MenuItem>
                <MenuItem value="Coordinator">Coordinator</MenuItem>
                <MenuItem value="Warden">Warden</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            {newStaff.role !== 'Warden' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                >
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                </Select>
              </FormControl>
            )}
            {newStaff.role === 'Coordinator' && (
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={newStaff.branch}
                  onChange={(e) => setNewStaff({ ...newStaff, branch: e.target.value })}
                >
                  <MenuItem value="AI">AI</MenuItem>
                  <MenuItem value="ML">ML</MenuItem>
                  <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddStaffDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStaff}>Add Staff</Button>
        </DialogActions>
      </Dialog>
    </>
  );

  const renderProfile = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
        User Profile
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Avatar sx={{ width: 150, height: 150, mb: 2, mx: 'auto' }}>
                {userProfile.name.charAt(0)}
              </Avatar>
              {!editMode && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                  sx={{ mb: 2, display: 'block', mx: 'auto' }}
                >
                  Edit Profile
                </Button>
              )}
              {editMode && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  sx={{ mb: 2, display: 'block', mx: 'auto' }}
                >
                  Save Profile
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Name"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Role"
                value={userProfile.role}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Department"
                value={userProfile.department}
                onChange={(e) => setUserProfile({ ...userProfile, department: e.target.value })}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
              {!passwordChangeMode && (
                <Button
                  variant="outlined"
                  onClick={handleChangePassword}
                >
                  Change Password
                </Button>
              )}
              {passwordChangeMode && (
                <>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSavePassword}
                  >
                    Save New Password
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderNoticeBoard = () => {
    return (
      <>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1A2027' }}>
          Notice Board
        </Typography>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New Notification</Typography>
            <TextField
              fullWidth
              label="Title"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={newNotification.content}
              onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newNotification.priority}
                onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddNotification}>
              Add Notification
            </Button>
          </CardContent>
        </Card>
        <Typography variant="h6" sx={{ mb: 2 }}>Posted Notifications</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          notifications.map((notification) => (
            <Card key={notification._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{notification.title}</Typography>
                  <Chip
                    label={notification.priority.toUpperCase()}
                    color={
                      notification.priority === 'high' ? 'error' :
                      notification.priority === 'medium' ? 'warning' : 'success'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>{notification.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Posted on: {new Date(notification.createdAt).toLocaleString()}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteNotification(notification._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'staff':
        return renderStaffManagement();
      case 'students':
        return <StudentManagement />;
      case 'notices':
        return renderNoticeBoard();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#FFFFFF' }}>
          <Toolbar>
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold', flexGrow: 1 }}>
              CMS | Root Admin
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
              <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
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
              <MenuItem onClick={() => { handleClose(); handleViewChange('profile'); }}>
                <PersonIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>
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
                bgcolor: 'background.default',
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
                bgcolor: 'background.default',
                border: 'none',
                boxShadow: 1,
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
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          <Container maxWidth="xl">
            {renderContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default RootAdminDashboard;
