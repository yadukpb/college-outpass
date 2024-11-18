import React, { useState } from 'react'
import { Box, Typography, Paper, Snackbar, Alert, List, ListItem, ListItemText, Avatar, Chip, ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, IconButton, Container, Grid, Fade, Button } from '@mui/material'
import { QrCodeScanner as QrCodeScannerIcon, ArrowBack as ArrowBackIcon, Security as SecurityIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material'
import QrScanner from 'react-qr-scanner'
import axios from 'axios'

const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8' },
    secondary: { main: '#e94235' },
    success: { main: '#0f9d58' },
    background: { default: '#f5f5f5' }
  }
})

const SecurityScan = () => {
  const [scanResult, setScanResult] = useState(null)
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' })
  const [scans, setScans] = useState([])
  const [scanning, setScanning] = useState(false)

  const handleScan = async (data) => {
    if (!data) return

    try {
      const response = await axios.post('/api/security/scan-qr', {
        qrCode: data.text,
        securityId: localStorage.getItem('userId'),
        scanType: 'exit'
      })

      const { success, message, data: outpassData } = response.data

      if (success) {
        setScanResult(outpassData)
        setScans(prev => [outpassData, ...prev])
        setAlert({
          open: true,
          message: `Successfully scanned outpass for ${outpassData.student.name}`,
          severity: 'success'
        })
      } else {
        setAlert({
          open: true,
          message: message || 'Invalid QR code',
          severity: 'error'
        })
      }
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Error processing scan',
        severity: 'error'
      })
    }
  }

  const handleError = (error) => {
    setAlert({
      open: true,
      message: 'Error accessing camera',
      severity: 'error'
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Security Checkpoint
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScanning(!scanning)}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              {scanning ? 'Stop Scan' : 'Start Scan'}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            {scanning && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.900' }}>
                  <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%', borderRadius: 8 }}
                    constraints={{ facingMode: 'environment' }}
                  />
                </Paper>
              </Grid>
            )}

            {scanResult && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: scanResult.status === 'Active' ? 'success.light' : 'error.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {scanResult.status === 'Active' ? 
                      <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} /> :
                      <CancelIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                    }
                    <Typography variant="h6" color="text.primary">
                      {scanResult.status === 'Active' ? 'Valid Outpass' : 'Invalid Outpass'}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    Student: {scanResult.student?.name}<br />
                    Destination: {scanResult.destination}<br />
                    Time: {new Date().toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <List>
                  <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    Recent Scans
                  </Typography>
                  {scans.map((scan, index) => (
                    <ListItem key={index} divider={index !== scans.length - 1}>
                      <Avatar sx={{ mr: 2, bgcolor: scan.status === 'Active' ? 'success.main' : 'error.main' }}>
                        {scan.student?.name?.[0]}
                      </Avatar>
                      <ListItemText
                        primary={scan.student?.name}
                        secondary={`${scan.destination} - ${new Date(scan.securityCheckpoints?.exitScan?.timestamp).toLocaleTimeString()}`}
                      />
                      <Chip
                        label={scan.status}
                        color={scan.status === 'Active' ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Snackbar 
          open={alert.open} 
          autoHideDuration={4000} 
          onClose={() => setAlert({ ...alert, open: false })}
        >
          <Alert severity={alert.severity} variant="filled">
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}

export default SecurityScan