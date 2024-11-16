import React from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';

// Sample data for leave history
const leaveHistoryData = [
  {
    id: 1,
    type: 'Personal Leave',
    reason: 'Medical check-up',
    startDate: '2024-09-10',
    endDate: '2024-09-12',
    status: 'Approved',
  },
  {
    id: 2,
    type: 'Sick Leave',
    reason: 'Fever',
    startDate: '2024-09-15',
    endDate: '2024-09-17',
    status: 'Pending',
  },
  {
    id: 3,
    type: 'Vacation',
    reason: 'Family trip',
    startDate: '2024-10-01',
    endDate: '2024-10-05',
    status: 'Denied',
  },
];

const LeaveHistory = () => {
  return (
    <Box sx={{ background: '#f3f4f6', minHeight: '100vh', display: 'flex', padding: '20px' }}>
      <Container maxWidth="md" sx={{ flexGrow: 1 }}>
        <Paper elevation={3} sx={{ padding: '20px' }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', fontSize: '32px', color: '#333' }}>
            Leave History
          </Typography>
          <Divider sx={{ my: 2 }} />
          {leaveHistoryData.length === 0 ? (
            <Typography align="center" color="textSecondary" paragraph>
              No leave history found.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveHistoryData.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.id}</TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>{leave.startDate}</TableCell>
                      <TableCell>{leave.endDate}</TableCell>
                      <TableCell>{leave.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default LeaveHistory;
