import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1
      }}>
        <LogoutIcon color="error" />
        <Typography variant="h6" component="span">
          Confirm Logout
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to log out? Any unsaved changes will be lost.
        </Typography>
        
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ 
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }
          }}
        >
          You will be redirected to the login page.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color="error"
          startIcon={isLoading ? <CircularProgress size={16} /> : <LogoutIcon />}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal; 