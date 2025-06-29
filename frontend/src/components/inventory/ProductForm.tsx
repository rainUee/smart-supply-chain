import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  InputAdornment,
  FormHelperText,
  Chip,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { InventoryFormData, InventoryItem } from '@/types';
import { inventoryService } from '@/services/apiService';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: InventoryItem) => void;
  editProduct?: InventoryItem | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSuccess,
  editProduct
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    sku: '',
    name: '',
    description: '',
    categoryId: 1,
    quantity: 0,
    reorderPoint: 0,
    maxStock: undefined,
    price: 0,
    cost: 0,
    warehouseId: 1,
    supplierId: undefined,
    unit: 'pcs',
    weight: undefined,
    dimensions: undefined,
    barcode: '',
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Mock categories - in real app, fetch from API
  const mockCategories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Books',
    'Sports',
    'Automotive',
    'Health & Beauty',
    'Toys',
    'Food & Beverages',
    'Office Supplies'
  ];

  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        sku: editProduct.sku,
        name: editProduct.name,
        description: editProduct.description || '',
        categoryId: editProduct.category.id,
        quantity: editProduct.quantity,
        reorderPoint: editProduct.reorderPoint,
        maxStock: editProduct.maxStock,
        price: editProduct.price,
        cost: editProduct.cost,
        warehouseId: editProduct.warehouse.id,
        supplierId: editProduct.supplier?.id,
        unit: editProduct.unit,
        weight: editProduct.weight,
        dimensions: editProduct.dimensions ? {
          length: editProduct.dimensions.length,
          width: editProduct.dimensions.width,
          height: editProduct.dimensions.height,
          unit: editProduct.dimensions.unit
        } : undefined,
        barcode: editProduct.barcode || '',
        tags: editProduct.tags || []
      });
    } else {
      // Reset form for new product
      setFormData({
        sku: '',
        name: '',
        description: '',
        categoryId: 1,
        quantity: 0,
        reorderPoint: 0,
        maxStock: undefined,
        price: 0,
        cost: 0,
        warehouseId: 1,
        supplierId: undefined,
        unit: 'pcs',
        weight: undefined,
        dimensions: undefined,
        barcode: '',
        tags: []
      });
    }
    setError(null);
  }, [editProduct, open]);

  const handleInputChange = (field: keyof InventoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.sku || !formData.name || formData.price <= 0 || formData.cost <= 0) {
        setError('Please fill in all required fields and ensure prices are greater than 0');
        return;
      }

      if (editProduct) {
        // Update existing product
        const updatedProduct = await inventoryService.update(editProduct.id, formData);
        onSuccess(updatedProduct);
      } else {
        // Create new product
        const newProduct = await inventoryService.create(formData);
        onSuccess(newProduct);
      }

      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {editProduct ? <SaveIcon /> : <AddIcon />}
          <Typography variant="h6">
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              Basic Information
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <TextField
                label="SKU *"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                fullWidth
                required
                disabled={loading}
                helperText="Unique product identifier"
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <TextField
                label="Product Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                fullWidth
                required
                disabled={loading}
              />
            </Box>
          </Box>

          <Box>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Autocomplete
                options={categories}
                value={categories.find(cat => cat === formData.categoryId.toString()) || ''}
                onChange={(_, newValue) => {
                  const categoryId = categories.indexOf(newValue || '') + 1;
                  handleInputChange('categoryId', categoryId);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    fullWidth
                  />
                )}
                disabled={loading}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <TextField
                label="Barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                fullWidth
                disabled={loading}
              />
            </Box>
          </Box>

          {/* Pricing */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              Pricing
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <TextField
                label="Cost Price *"
                type="number"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                fullWidth
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <TextField
                label="Selling Price *"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                fullWidth
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
          </Box>

          {/* Inventory */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              Inventory Management
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <TextField
                label="Current Stock"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <TextField
                label="Reorder Point"
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value) || 0)}
                fullWidth
                disabled={loading}
                helperText="Minimum stock level before reordering"
              />
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <TextField
                label="Max Stock Level"
                type="number"
                value={formData.maxStock || ''}
                onChange={(e) => handleInputChange('maxStock', e.target.value ? parseInt(e.target.value) : undefined)}
                fullWidth
                disabled={loading}
                helperText="Maximum stock level"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  value={formData.unit}
                  label="Unit of Measure"
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  <MenuItem value="pcs">Pieces</MenuItem>
                  <MenuItem value="kg">Kilograms</MenuItem>
                  <MenuItem value="g">Grams</MenuItem>
                  <MenuItem value="l">Liters</MenuItem>
                  <MenuItem value="ml">Milliliters</MenuItem>
                  <MenuItem value="m">Meters</MenuItem>
                  <MenuItem value="cm">Centimeters</MenuItem>
                  <MenuItem value="box">Box</MenuItem>
                  <MenuItem value="pack">Pack</MenuItem>
                  <MenuItem value="set">Set</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                fullWidth
                disabled={loading}
              />
            </Box>
          </Box>

          {/* Dimensions */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Dimensions (optional)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <TextField
                label="Length"
                type="number"
                value={formData.dimensions?.length || ''}
                onChange={(e) => handleInputChange('dimensions', {
                  ...formData.dimensions,
                  length: e.target.value ? parseFloat(e.target.value) : 0
                })}
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <TextField
                label="Width"
                type="number"
                value={formData.dimensions?.width || ''}
                onChange={(e) => handleInputChange('dimensions', {
                  ...formData.dimensions,
                  width: e.target.value ? parseFloat(e.target.value) : 0
                })}
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <TextField
                label="Height"
                type="number"
                value={formData.dimensions?.height || ''}
                onChange={(e) => handleInputChange('dimensions', {
                  ...formData.dimensions,
                  height: e.target.value ? parseFloat(e.target.value) : 0
                })}
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.dimensions?.unit || 'cm'}
                  label="Unit"
                  onChange={(e) => handleInputChange('dimensions', {
                    ...formData.dimensions,
                    unit: e.target.value
                  })}
                >
                  <MenuItem value="cm">Centimeters</MenuItem>
                  <MenuItem value="in">Inches</MenuItem>
                  <MenuItem value="m">Meters</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Tags */}
          <Box>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags || []}
              onChange={(_, newValue) => handleInputChange('tags', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags..."
                  fullWidth
                />
              )}
              disabled={loading}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          {loading ? 'Saving...' : (editProduct ? 'Update Product' : 'Create Product')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm; 