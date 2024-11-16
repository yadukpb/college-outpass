import { styled } from '@mui/system';
import { Paper, TextField, Button, Typography } from '@mui/material';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '40px',
  background: '#ffffff',
  borderRadius: '15px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 'bold',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '20px',
}));
