'use client';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Header() {
  return (
    <AppBar position="static" color="primary" elevation={2} sx={{ bgcolor: '#0a1019' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 900, letterSpacing: 2, color: '#fff' }}>
            DIGITALYZ
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 