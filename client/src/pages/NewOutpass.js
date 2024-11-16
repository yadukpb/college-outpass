import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Divider, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { StyledPaper, StyledTextField, StyledButton } from '../components/StyledComponents';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import ReasonIcon from '@mui/icons-material/QuestionAnswer';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const outpassTypes = [
  { value: 'leave', label: 'Leave' },
  { value: 'letter', label: 'Letter' },
];

const NewOutpass = () => {
  const [formData, setFormData] = useState({
    outpassType: '',
    reason: '',
    destination: '',
    contactNumber: '',
    dateOfLeaving: '',
    timeOfLeaving: '',
    dateOfReturn: '',
    timeOfReturn: '',
    personalInfo: {
      name: '',
      batch: '',
      rollNo: '',
      address: '',
      phoneNo: '',
      parentPhoneNo: '',
    },
  });

  const [minTime, setMinTime] = useState('');

  useEffect(() => {
    updateMinTime();
  }, [formData.dateOfLeaving]);

  // useEffect(() => {
  //   const requiredFields = ['userId', 'departmentId', 'classId', 'coordinatorId', 'hodId'];
  //   const missingFields = requiredFields.filter(field => !localStorage.getItem(field));
    
  //   if (missingFields.length > 0) {
  //     toast.error(`Missing required fields: ${missingFields.join(', ')}`);
  //   }
  // }, []);

  const updateMinTime = () => {
    const today = new Date().toISOString().split('T')[0];
    if (formData.dateOfLeaving === today) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setMinTime(`${hours}:${minutes}`);
    } else {
      setMinTime('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [name]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form Data:", formData);
    console.log("Personal Info:", formData.personalInfo);

    const userId = localStorage.getItem('userId');
    const departmentId = localStorage.getItem('departmentId');
    const classId = localStorage.getItem('classId');
    const coordinatorId = localStorage.getItem('coordinatorId');
    const hodId = localStorage.getItem('hodId');

    console.log("Local Storage Items:", {
      userId,
      departmentId,
      classId,
      coordinatorId,
      hodId
    });

    // if (!userId || !departmentId || !classId || !coordinatorId || !hodId) {
    //   toast.error('Missing user details. Please complete your profile first.');
    //   return;
    // }

    const outpassData = {
      outpassType: formData.outpassType,
      reason: formData.reason,
      destination: formData.destination,
      contactNumber: formData.contactNumber,
      dateOfGoing: formData.dateOfLeaving,
      timeOfGoing: formData.timeOfLeaving,
      dateOfArrival: formData.dateOfReturn,
      timeOfArrival: formData.timeOfReturn,
      student: {
        userId: userId,
        name: formData.personalInfo.name,
        rollNo: formData.personalInfo.rollNo,
        department: departmentId,
        class: classId,
        coordinator: coordinatorId,
        hod: hodId,
        year: formData.personalInfo.batch.split('-')[0],
        phoneNumber: formData.personalInfo.phoneNo,
        parentInfo: {
          fatherPhone: formData.personalInfo.parentPhoneNo
        }
      }
    };

    console.log("Outpass Data being sent:", outpassData);

    try {
      const token = localStorage.getItem('token');
      console.log("Authorization Token:", token);

      const response = await axios.post('http://localhost:5001/api/outpass', outpassData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        toast.success('Outpass created successfully!');
        setFormData({
          outpassType: '',
          reason: '',
          destination: '',
          contactNumber: '',
          dateOfLeaving: '',
          timeOfLeaving: '',
          dateOfReturn: '',
          timeOfReturn: '',
          personalInfo: {
            name: '',
            batch: '',
            rollNo: '',
            address: '',
            phoneNo: '',
            parentPhoneNo: '',
          },
        });
      }
    } catch (error) {
      console.error('Full Error Object:', error);
      console.error('Error Response Data:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Error Headers:', error.response?.headers);
      toast.error(error.response?.data?.message || 'Error creating outpass');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Container maxWidth="md" sx={{ padding: '20px' }}>
      <ToastContainer />
      <StyledPaper>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', fontSize: '32px', color: '#333' }}>
          Outpass Request Form
        </Typography>
        <Typography align="center" color="textSecondary" paragraph>
          Please fill in the details below to request a new outpass.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Outpass Type Section */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', backgroundColor: '#fff', boxShadow: 1, marginBottom: '20px' }}>
                <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                  Outpass Type
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={outpassTypes}
                      getOptionLabel={(option) => option.label}
                      onChange={(event, value) => setFormData({ ...formData, outpassType: value?.value || '' })}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          label="Outpass Type"
                          required
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <ReasonIcon sx={{ color: '#6c757d' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Reason"
                      required
                      variant="outlined"
                      name="reason"
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ReasonIcon sx={{ color: '#6c757d' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Travel Information Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  boxShadow: 1,
                  marginBottom: '20px',
                }}
              >
                <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                  Travel Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Destination"
                      required
                      variant="outlined"
                      name="destination"
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PlaceIcon sx={{ color: '#6c757d' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Contact Number"
                      required
                      variant="outlined"
                      type="tel"
                      name="contactNumber"
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#6c757d' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                      Leaving Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          fullWidth
                          label="Date of Leaving"
                          required
                          variant="outlined"
                          type="date"
                          name="dateOfLeaving"
                          value={formData.dateOfLeaving}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon sx={{ color: '#6c757d' }} />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          fullWidth
                          label="Time of Leaving"
                          required
                          variant="outlined"
                          type="time"
                          name="timeOfLeaving"
                          value={formData.timeOfLeaving}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon sx={{ color: '#6c757d' }} />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: minTime }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Box for Date of Return and Time of Return */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                      Return Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          fullWidth
                          label="Date of Return"
                          required
                          variant="outlined"
                          type="date"
                          name="dateOfReturn"
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon sx={{ color: '#6c757d' }} />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          fullWidth
                          label="Time of Return"
                          required
                          variant="outlined"
                          type="time"
                          name="timeOfReturn"
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon sx={{ color: '#6c757d' }} />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  boxShadow: 1,
                  marginBottom: '20px',
                }}
              >
                <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Name"
                      required
                      variant="outlined"
                      name="name"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Batch"
                      required
                      variant="outlined"
                      name="batch"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Roll No"
                      required
                      variant="outlined"
                      name="rollNo"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Address"
                      required
                      variant="outlined"
                      name="address"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Phone No"
                      required
                      variant="outlined"
                      type="tel"
                      name="phoneNo"
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#6c757d' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Parent Phone No"
                      required
                      variant="outlined"
                      type="tel"
                      name="parentPhoneNo"
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#6c757d' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <StyledButton type="submit" variant="contained" fullWidth>
                Submit
              </StyledButton>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Container>
  );
};

export default NewOutpass;
