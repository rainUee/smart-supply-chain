import React, { useEffect, useState, useMemo } from "react";
import { InventoryFilter, InventoryItem, ProductCategory, Warehouse } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProductForm from "./ProductForm";
import { inventoryService, supplierService } from "@/services/apiService";
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  Divider,
  Slider,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tabs,
  Tab,
  Pagination,
  Snackbar
} from "@mui/material";
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<InventoryFilter>({});
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);

  // Mock data for categories and warehouses (these would come from API in real implementation)
  const categories: ProductCategory[] = [
    { id: 1, name: "Electronics", description: "Electronic devices", isActive: true, createdAt: "", updatedAt: "" },
    { id: 2, name: "Clothing", description: "Apparel and accessories", isActive: true, createdAt: "", updatedAt: "" },
    { id: 3, name: "Home & Garden", description: "Home improvement items", isActive: true, createdAt: "", updatedAt: "" },
  ];

  const warehouses: Warehouse[] = [
    { id: 1, name: "Main Warehouse", address: { street: "123 Main St", city: "City", state: "State", zipCode: "12345", country: "Country" }, type: "main", capacity: 10000, isActive: true, createdAt: "", updatedAt: "" },
    { id: 2, name: "Distribution Center", address: { street: "456 Dist St", city: "City", state: "State", zipCode: "12345", country: "Country" }, type: "distribution", capacity: 5000, isActive: true, createdAt: "", updatedAt: "" },
  ];

  const fetchInventory = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters for API
      const apiFilters: InventoryFilter = {
        ...filter,
        search: searchTerm || undefined,
      };

      const response = await inventoryService.getAll(apiFilters, pagination.page, pagination.limit);
      setInventory(response.items);
      setPagination(response.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load inventory data';
      setError(errorMessage);
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter, searchTerm, pagination.page, pagination.limit]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesPriceRange = item.price >= priceRange[0] && item.price <= priceRange[1];

      if (filter.stockLevel === 'low') {
        return matchesPriceRange && item.quantity <= item.reorderPoint;
      } else if (filter.stockLevel === 'normal') {
        return matchesPriceRange && item.quantity > item.reorderPoint && item.quantity <= item.reorderPoint * 2;
      } else if (filter.stockLevel === 'high') {
        return matchesPriceRange && item.quantity > item.reorderPoint * 2;
      }

      return matchesPriceRange;
    });
  }, [inventory, filter, priceRange]);

  const handleUpdateQuantity = async (id: number, newQuantity: number): Promise<void> => {
    try {
      const updatedItem = await inventoryService.updateQuantity(id, newQuantity, 'Manual update');
      setInventory(prev => prev.map(item =>
        item.id === id ? updatedItem : item
      ));
      setEditingItem(null);
      setSnackbar({
        open: true,
        message: 'Quantity updated successfully',
        severity: 'success',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update quantity';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      console.error('Failed to update quantity:', error);
    }
  };

  const handleFilterChange = (newFilter: Partial<InventoryFilter>): void => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when search changes
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'success';
      case 'low-stock': return 'warning';
      case 'out-of-stock': return 'error';
      default: return 'default';
    }
  };

  const getStockLevelColor = (item: InventoryItem) => {
    if (item.quantity === 0) return 'error';
    if (item.quantity <= item.reorderPoint) return 'warning';
    return 'success';
  };

  const handleEditQuantity = (item: InventoryItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
  };

  const handleSaveQuantity = () => {
    if (editingItem) {
      handleUpdateQuantity(editingItem.id, editQuantity);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditQuantity(0);
  };

  const exportInventory = () => {
    // Implementation for exporting inventory data
    console.log('Exporting inventory data...');
    setSnackbar({
      open: true,
      message: 'Export feature coming soon',
      severity: 'info',
    });
  };

  const handleRefresh = () => {
    fetchInventory();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenProductForm = (product?: InventoryItem) => {
    setEditingProduct(product || null);
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleProductSuccess = (product: InventoryItem) => {
    if (editingProduct) {
      // Update existing product in the list
      setInventory(prev => prev.map(item => 
        item.id === product.id ? product : item
      ));
      setSnackbar({
        open: true,
        message: 'Product updated successfully',
        severity: 'success',
      });
    } else {
      // Add new product to the list
      setInventory(prev => [product, ...prev]);
      setSnackbar({
        open: true,
        message: 'Product created successfully',
        severity: 'success',
      });
    }
    handleCloseProductForm();
  };

  if (loading && inventory.length === 0) {
    return <LoadingSpinner message="Loading inventory..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your product inventory, track stock levels, and monitor reorder points
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          {/* <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportInventory}
          >
            Export
          </Button> */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenProductForm()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button
            variant="text"
            size="small"
            onClick={fetchInventory}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <TextField
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{ minWidth: 300, flex: 1 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filters
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="List View">
                <IconButton 
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid View">
                <IconButton 
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {showFilters && (
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Stock Level</InputLabel>
                    <Select
                      value={filter.stockLevel || 'all'}
                      label="Stock Level"
                      onChange={(e) => handleFilterChange({ stockLevel: e.target.value as any })}
                    >
                      <MenuItem value="all">All Levels</MenuItem>
                      <MenuItem value="low">Low Stock</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filter.category || 'all'}
                      label="Category"
                      onChange={(e) => handleFilterChange({ category: e.target.value })}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Warehouse</InputLabel>
                    <Select
                      value={filter.warehouse || 'all'}
                      label="Warehouse"
                      onChange={(e) => handleFilterChange({ warehouse: e.target.value })}
                    >
                      <MenuItem value="all">All Warehouses</MenuItem>
                      {warehouses.map(wh => (
                        <MenuItem key={wh.id} value={wh.name}>{wh.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filter.status || 'all'}
                      label="Status"
                      onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="in-stock">In Stock</MenuItem>
                      <MenuItem value="low-stock">Low Stock</MenuItem>
                      <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Price Range</Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">${priceRange[0]}</Typography>
                  <Typography variant="body2">${priceRange[1]}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={`All Items (${filteredInventory.length})`} />
          <Tab label={`Low Stock (${filteredInventory.filter(item => item.quantity <= item.reorderPoint).length})`} />
          <Tab label={`Out of Stock (${filteredInventory.filter(item => item.quantity === 0).length})`} />
        </Tabs>
      </Box>

      {/* Content based on tab */}
      <TabPanel value={tabValue} index={0}>
        {viewMode === 'list' ? (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="center">Reorder Point</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.category.name} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color={getStockLevelColor(item)}
                          >
                            {item.quantity}
                          </Typography>
                          {item.quantity <= item.reorderPoint && (
                            <WarningIcon color="warning" fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {item.reorderPoint}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status.replace('-', ' ')} 
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit Product">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenProductForm(item)}
                            >
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Quantity">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditQuantity(item)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filteredInventory.map(item => (
              <Box key={item.id} sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 400 }}>
                <Card sx={{ '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.sku}
                        </Typography>
                      </Box>
                      <Chip 
                        label={item.status.replace('-', ' ')} 
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Quantity:</strong> {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Price:</strong> ${item.price.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Category:</strong> {item.category.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {item.location}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit Product">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenProductForm(item)}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Quantity">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditQuantity(item)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredInventory
            .filter(item => item.quantity <= item.reorderPoint)
            .map(item => (
              <Box key={item.id} sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 400 }}>
                <Card sx={{ border: 2, borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.sku}
                        </Typography>
                      </Box>
                      <WarningIcon color="warning" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="warning.main" fontWeight="bold">
                        Current: {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        Reorder Point: {item.reorderPoint}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined" startIcon={<ShippingIcon />}>
                        Reorder
                      </Button>
                      <Button size="small" variant="contained" onClick={() => handleEditQuantity(item)}>
                        Update Stock
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredInventory
            .filter(item => item.quantity === 0)
            .map(item => (
              <Box key={item.id} sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 400 }}>
                <Card sx={{ border: 2, borderColor: 'error.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.sku}
                        </Typography>
                      </Box>
                      <CancelIcon color="error" />
                    </Box>

                    <Typography variant="body2" color="error.main" fontWeight="bold" sx={{ mb: 2 }}>
                      OUT OF STOCK
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined" startIcon={<ShippingIcon />}>
                        Reorder
                      </Button>
                      <Button size="small" variant="contained" onClick={() => handleEditQuantity(item)}>
                        Add Stock
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
        </Box>
      </TabPanel>

      {filteredInventory.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary' 
        }}>
          <InventoryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No inventory items found
          </Typography>
          <Typography variant="body2">
            {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by adding your first product'}
          </Typography>
        </Box>
      )}

      {/* Edit Quantity Dialog */}
      <Dialog open={!!editingItem} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Stock Quantity
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Product: <strong>{editingItem?.name}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              SKU: {editingItem?.sku}
            </Typography>
            
            <TextField
              label="New Quantity"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0 }}
            />
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current: {editingItem?.quantity} | Reorder Point: {editingItem?.reorderPoint}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveQuantity} variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Product Form Dialog */}
      <ProductForm
        open={showProductForm}
        onClose={handleCloseProductForm}
        onSuccess={handleProductSuccess}
        editProduct={editingProduct}
      />
    </Box>
  );
};

export default InventoryManagement;