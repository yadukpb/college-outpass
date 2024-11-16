import React, { useState } from 'react';
import { Box, Typography, Paper, Snackbar, List, ListItem, ListItemText, Avatar, Chip, ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, IconButton, Container, Grid, Fade } from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon, ArrowBack as ArrowBackIcon, Security as SecurityIcon } from '@mui/icons-material';
import QrScanner from 'react-qr-scanner';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f0f2f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

const SecurityScan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [outpasses, setOutpasses] = useState({});
  const [scanning, setScanning] = useState(false);

  const handleScan = (data) => {
    if (data) {
      try {
        const outpassData = JSON.parse(data.text);
        if (outpassData.type === 'outpass') {
          const currentTime = new Date().toLocaleTimeString();
          const updatedOutpasses = {
            ...outpasses,
            [outpassData.id]: { ...outpassData, status: 'outside', timeOfLeaving: currentTime }
          };
          setOutpasses(updatedOutpasses);
          setScanResult(updatedOutpasses[outpassData.id]);
          setSnackbarMessage(`Outpass for ${outpassData.studentId} updated successfully`);
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error processing QR code:', error);
        setSnackbarMessage('Invalid QR code');
        setSnackbarOpen(true);
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    setSnackbarMessage('Error scanning QR code');
    setSnackbarOpen(true);
  };

  const toggleScanner = () => {
    setScanning(!scanning);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="back" sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} /> Security Scan
            </Typography>
            <IconButton color="inherit" onClick={toggleScanner}>
              <QrCodeScannerIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Fade in={scanning}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden', display: scanning ? 'block' : 'none' }}>
                  <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Paper>
              </Fade>
            </Grid>
            {scanResult && (
              <Grid item xs={12}>
                <Fade in={true}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.primary.light }}>
                    <Typography variant="h6" gutterBottom color="primary.contrastText">
                      Last Scan Result
                    </Typography>
                    <Typography variant="body1" color="primary.contrastText">
                      Student {scanResult.studentId} marked as outside campus at {scanResult.timeOfLeaving}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            )}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" sx={{ p: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>Recent Scans</Typography>
                  {Object.values(outpasses).map((outpass, index) => (
                    <ListItem key={index} alignItems="flex-start" divider={index !== Object.values(outpasses).length - 1}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>{outpass.studentId[0]}</Avatar>
                      <ListItemText
                        primary={`Student ${outpass.studentId}`}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {outpass.destination}
                            </Typography>
                            {` - Left at ${outpass.timeOfLeaving}`}
                          </React.Fragment>
                        }
                      />
                      <Chip label="Outside" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </ThemeProvider>
  );
};

export default SecurityScan;