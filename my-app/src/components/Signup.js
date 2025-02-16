import React, { useState } from 'react';
import { 
  Container,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Box
} from '@mui/material';
import { PersonAdd, Email, Lock } from '@mui/icons-material';
import { styled } from '@mui/system';

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  justifyContent: 'center',
});

const StyledPaper = styled(Paper)({
  padding: '32px',
  width: '400px',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  textAlign: 'center'
});

const StyledAvatar = styled(Avatar)({
  backgroundColor: '#1976d2', // Static color instead of theme reference
  margin: '0 auto 16px',
  width: 56,
  height: 56
});

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <StyledContainer component="main" maxWidth="xs">
      <StyledPaper elevation={6}>
        <StyledAvatar>
          <PersonAdd sx={{ fontSize: 32 }} />
        </StyledAvatar>

        <Typography component="h1" variant="h5" sx={{ 
          mb: 3, 
          fontWeight: 700,
          color: '#1976d2' // Static color instead of gradient
        }}>
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <Email sx={{ color: 'action.active', mr: 1 }} />
              ),
              sx: { borderRadius: '8px' }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <Lock sx={{ color: 'action.active', mr: 1 }} />
              ),
              sx: { borderRadius: '8px' }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <Lock sx={{ color: 'action.active', mr: 1 }} />
              ),
              sx: { borderRadius: '8px' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              bgcolor: '#1976d2', // Static color
              '&:hover': {
                bgcolor: '#1565c0',
                boxShadow: 2
              }
            }}
          >
            Sign Up
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link 
                href="/login" 
                sx={{ 
                  color: '#666', 
                  '&:hover': { color: '#1976d2' } 
                }}
              >
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
}