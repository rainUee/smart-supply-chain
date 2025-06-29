import { Supplier } from "@/types";
import { useEffect, useState } from "react";
import SupplierCard from "./SupplieCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { supplierService } from "@/services/apiService";
import { Box, Typography, Button, Alert } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await supplierService.getAll();
        setSuppliers(response.items);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load suppliers data');
        console.error('Suppliers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading suppliers..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Supplier Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Add New Supplier
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          lg: 'repeat(3, 1fr)' 
        }, 
        gap: 3 
      }}>
        {suppliers.map(supplier => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </Box>

      {suppliers.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary' 
        }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No suppliers found
          </Typography>
          <Typography variant="body2">
            Get started by adding your first supplier
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SupplierManagement;