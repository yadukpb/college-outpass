import React from 'react';
import { Button, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <Toolbar>
      <Button color="inherit" component={Link} to="/">Dashboard</Button>
      <Button color="inherit" component={Link} to="/new-outpass">New Outpass Request</Button>
      <Button color="inherit" component={Link} to="/my-outpasses">My Outpasses</Button>
      <Button color="inherit" component={Link} to="/leave-history">Leave History</Button>
      <Button color="inherit" component={Link} to="/profile">Profile</Button>
      <Button color="inherit" component={Link} to="/login">Login</Button> 
    </Toolbar>
  );
};

export default Navbar;