import { Supplier } from "@/types";
import { Box, Card, CardContent, Typography, Chip, Rating, Button, Stack } from "@mui/material";
import { Business, Email, Phone, LocationOn, Star } from "@mui/icons-material";

interface SupplierCardProps {
  supplier: Supplier;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier }) => {
  const getStatusColor = (isActive: boolean, isPreferred: boolean): "success" | "warning" | "error" | "default" => {
    if (!isActive) return "error";
    if (isPreferred) return "success";
    return "default";
  };

  const getStatusText = (isActive: boolean, isPreferred: boolean): string => {
    if (!isActive) return "Inactive";
    if (isPreferred) return "Preferred";
    return "Active";
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {supplier.name}
          </Typography>
          <Chip 
            label={getStatusText(supplier.isActive, supplier.isPreferred)}
            color={getStatusColor(supplier.isActive, supplier.isPreferred)}
            size="small"
          />
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          {supplier.contactPerson && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {supplier.contactPerson}
              </Typography>
            </Box>
          )}
          
          {supplier.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {supplier.email}
              </Typography>
            </Box>
          )}
          
          {supplier.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {supplier.phone}
              </Typography>
            </Box>
          )}
          
          {(supplier.address || supplier.city || supplier.state || supplier.country) && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationOn fontSize="small" color="action" sx={{ mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary">
                {[supplier.address, supplier.city, supplier.state, supplier.country]
                  .filter(Boolean)
                  .join(', ')}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating 
            value={supplier.rating} 
            readOnly 
            size="small"
            precision={0.5}
          />
          <Typography variant="body2" color="text.secondary">
            ({supplier.rating.toFixed(1)})
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          {supplier.paymentTerms && (
            <Typography variant="body2">
              <strong>Payment Terms:</strong> {supplier.paymentTerms}
            </Typography>
          )}
          {supplier.creditLimit > 0 && (
            <Typography variant="body2">
              <strong>Credit Limit:</strong> ${supplier.creditLimit.toLocaleString()}
            </Typography>
          )}
          {supplier.taxId && (
            <Typography variant="body2">
              <strong>Tax ID:</strong> {supplier.taxId}
            </Typography>
          )}
        </Stack>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" fullWidth>
            View Details
          </Button>
          <Button variant="contained" size="small" fullWidth>
            Create PO
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default SupplierCard;