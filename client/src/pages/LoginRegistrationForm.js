import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ExpandMore,
  Description,
  SupervisorAccount,
  School,
  QrCode2,
  Security,
} from '@mui/icons-material';

const theme = {
  palette: {
    primary: {
      main: '#1E88E5',
    },
    secondary: {
      main: '#FFC107',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
};

const OutpassSystem = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user._id);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userEmail', user.email);

        if (user.role === 'student') {
          navigate('/student-dashboard');
        } else if (user.role === 'coordinator') {
          navigate('/coordinator-dashboard');
        } else if (user.role === 'hod') {
          navigate('/hod-dashboard');
        } else if (user.role === 'warden') {
          navigate('/warden-dashboard');
        } else if (user.role === 'rootAdmin') {
          navigate('/admin-dashboard');
        } else if (user.role === 'security') {
          navigate('/security');
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Login error:', error);
    }
  };

  const sendOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/send-otp', { email });
      setOtpSent(true);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const resetPassword = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/reset-password', { email, otp, newPassword, repeatNewPassword });
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setRepeatNewPassword('');
      setError(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const outpassSteps = [
    {
      label: 'Fill Outpass Form',
      description: 'Complete the online outpass request form with all necessary details.',
      icon: <Description />,
    },
    {
      label: 'Warden Approval',
      description: 'Your request is sent to the warden for initial approval.',
      icon: <SupervisorAccount />,
    },
    {
      label: 'Coordinator Approval',
      description: 'After warden approval, the coordinator reviews your request.',
      icon: <School />,
    },
    {
      label: 'HOD Approval',
      description: 'Final approval is given by the Head of Department.',
      icon: <School />,
    },
    {
      label: 'Download QR Code',
      description: 'Once approved, download your outpass with a unique QR code.',
      icon: <QrCode2 />,
    },
    {
      label: 'Security Check',
      description: 'Show the QR code to the security guard for scanning before leaving.',
      icon: <Security />,
    },
  ];

  axios.defaults.baseURL = 'http://localhost:5001';
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://webfiles.amrita.edu/2019/06/felWvJAC-New-Project-10.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6, display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', p: 4, borderRadius: theme.shape.borderRadius }}>
                <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                   Outpass Management System
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', mb: 4 }}>
                  Simplify your campus exit process with our digital outpass system
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  sx={{ 
                    borderRadius: 20, 
                    textTransform: 'none', 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                    }
                  }}
                >
                  Request Outpass
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                      src="https://pbs.twimg.com/profile_images/1284162550540562433/nXSnAcoz_400x400.jpg"
                      alt="Amrita Logo"
                      style={{ width: 100, height: 100, marginBottom: 16 }}
                    />
                    <Typography component="h2" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Login to Your Account
                    </Typography>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                      <Tab label="Login" sx={{ textTransform: 'none' }} />
                      {/* <Tab label="Register" sx={{ textTransform: 'none' }} /> */}
                    </Tabs>
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        label="Email address"
                        variant="outlined"
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                          {error}
                        </Typography>
                      )}
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ borderRadius: 20, textTransform: 'none', py: 1.5 }}
                      >
                        Login
                      </Button>
                      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }} onClick={() => setShowForgotPassword(true)}>
                        Forgot Password?
                      </Typography>
                      {showForgotPassword && (
                        <>
                          <TextField
                            fullWidth
                            label="Email address"
                            variant="outlined"
                            margin="normal"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={sendOtp}
                            sx={{ borderRadius: 20, textTransform: 'none', py: 1.5 }}
                          >
                            Send OTP
                          </Button>
                        </>
                      )}
                      {otpSent && (
                        <>
                          <TextField
                            fullWidth
                            label="Enter OTP"
                            variant="outlined"
                            margin="normal"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            label="New Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            label="Repeat New Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={repeatNewPassword}
                            onChange={(e) => setRepeatNewPassword(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={resetPassword}
                            sx={{ borderRadius: 20, textTransform: 'none', py: 1.5 }}
                          >
                            Reset Password
                          </Button>
                        </>
                      )}
                    </form>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" sx={{ mb: 6, textAlign: 'center', fontWeight: 'bold' }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {outpassSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={step.label}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  height: '100%',
                  p: 3,
                  backgroundColor: 'background.default',
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: theme.palette.primary.main,
                    mb: 2
                  }}>
                    {step.icon}
                  </Avatar>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {step.label}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" sx={{ mb: 6, textAlign: 'center', fontWeight: 'bold' }}>
            Frequently Asked Questions
          </Typography>
          <Accordion elevation={0} sx={{ mb: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">How long does the approval process take?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                The approval process typically takes 24-48 hours, depending on the availability of the approving authorities. We recommend submitting your request well in advance of your planned departure.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion elevation={0} sx={{ mb: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">What happens if my outpass request is rejected?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                If your outpass request is rejected, you'll receive a notification with the reason for rejection. You can then address the concerns and submit a new request or contact the relevant authority for more information.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Can I extend my outpass duration after it's approved?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Yes, you can request an extension for your outpass. However, you'll need to submit a new request for the extended duration, which will go through the approval process again. It's best to do this before your current outpass expires.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Amrita Outpass System</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Simplifying campus exit procedures</Typography>
              <Typography variant="body2" color="text.secondary">© {new Date().getFullYear()} Amrita University</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Quick Links</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Request Outpass</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Check Status</Typography>
              <Typography variant="body2" color="text.secondary">Contact Support</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Resources</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>User Guide</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>FAQ</Typography>
              <Typography variant="body2" color="text.secondary">Terms of Service</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Contact</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>support@amritaoutpass.edu</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>+91 123 456 7890</Typography>
              <Typography variant="body2" color="text.secondary">Amrita University, Kerala</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default OutpassSystem;
