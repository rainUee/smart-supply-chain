import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginCredentials } from "@/types";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import {
  Inventory as InventoryIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading = false, error }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onLogin(formData);
    } catch (error) {
      // error handled by parent
    }
  };

  const features = [
    {
      icon: <InventoryIcon sx={{ fontSize: 32, color: "primary.main" }} />,
      title: "Smart Inventory",
      description: "Real-time tracking and automated reordering",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 32, color: "success.main" }} />,
      title: "Advanced Analytics",
      description: "Data-driven insights and performance metrics",
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 32, color: "info.main" }} />,
      title: "Supplier Management",
      description: "Streamlined vendor relationships and procurement",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32, color: "warning.main" }} />,
      title: "Enterprise Security",
      description: "Bank-level security and compliance standards",
    },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Background Image Section with Overlay */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          flex: { sm: "0 0 33.333%", md: "0 0 58.333%" },
          backgroundImage:
            "url(https://source.unsplash.com/featured/?warehouse,logistics)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) => t.palette.grey[100],
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(25, 118, 210, 0.8)",
            zIndex: 1,
          },
        }}
      >
        {/* Content Overlay */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            p: 4,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "white",
              color: "primary.main",
              mb: 3,
            }}
          >
            <InventoryIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Smart Supply Chain
          </Typography>

          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Transform your business with intelligent supply chain management
          </Typography>

          {/* Features Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { md: "repeat(2, 1fr)" },
              gap: 3,
              maxWidth: 600,
              width: "100%",
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Login Form Section */}
      <Box
        component={Paper}
        elevation={6}
        square
        sx={{
          flex: { xs: "1 1 100%", sm: "0 0 66.667%", md: "0 0 41.667%" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
            <LockOutlinedIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mb: 3, color: "text.secondary", textAlign: "center" }}
          >
            Sign in to access your supply chain dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={isLoading}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Link href="#" variant="body2" sx={{ textDecoration: "none" }}>
                Forgot password?
              </Link>
              <Link href="#" variant="body2" sx={{ textDecoration: "none" }}>
                {`Don't have an account? Contact admin`}
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
