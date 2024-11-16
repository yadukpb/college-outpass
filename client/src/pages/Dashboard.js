import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';

const WardenDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/warden/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/warden/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving outpass:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/warden/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting outpass:', error);
    }
  };

  if (!dashboardData) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Warden Dashboard</Typography>
      
      <Grid container spacing={3} style={{ marginBottom: '20px' }}>
        <Grid item xs={3}>
          <Paper style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6">Pending</Typography>
            <Typography variant="h4">{dashboardData.stats.totalPending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6">Approved</Typography>
            <Typography variant="h4">{dashboardData.stats.totalApproved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6">Rejected</Typography>
            <Typography variant="h4">{dashboardData.stats.totalRejected}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6">Last 24 Hours</Typography>
            <Typography variant="h4">{dashboardData.stats.lastDayRequests}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>Pending Outpasses</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Date of Leaving</TableCell>
              <TableCell>Date of Return</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dashboardData.pendingOutpasses.map((outpass) => (
              <TableRow key={outpass._id}>
                <TableCell>{outpass.student.name}</TableCell>
                <TableCell>{outpass.destination}</TableCell>
                <TableCell>{new Date(outpass.dateOfLeaving).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(outpass.dateOfReturn).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => handleApprove(outpass._id)} color="primary" variant="contained" style={{ marginRight: '10px' }}>
                    Approve
                  </Button>
                  <Button onClick={() => handleReject(outpass._id)} color="secondary" variant="contained">
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default WardenDashboard;
