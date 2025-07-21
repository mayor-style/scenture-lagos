import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import CustomerService from '../../services/admin/customer.service';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/Toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: { street: '', city: '', state: '', postalCode: '', country: 'Nigeria' },
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      addToast('Please fix the errors in the form', 'error');
      return;
    }
    setLoading(true);
    try {
      await CustomerService.createCustomer(formData);
      addToast('Customer created successfully', 'success');
      navigate('/admin/customers');
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to create customer';
      setErrors({ form: errorMessage });
      addToast(errorMessage, 'error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Customer | Scenture Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-4xl"
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          <Link to="/admin/customers" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10"
              aria-label="Back to customers"
            >
              <ArrowLeft className="h-5 w-5 text-secondary" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
              Add New Customer
            </h1>
            <p className="text-sm text-muted-foreground">Create a new customer profile</p>
          </div>
        </motion.header>

        <motion.div variants={cardVariants}>
          <Card className="border-primary/20 bg-background shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg font-heading text-secondary">Customer Details</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter the customer’s information below
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <LoadingOverlay loading={loading}>
                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-4 bg-destructive/20 text-destructive rounded-md flex items-center"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {errors.form}
                  </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        First Name
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className={errors.firstName ? 'border-destructive' : ''}
                        aria-label="First name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className={errors.lastName ? 'border-destructive' : ''}
                        aria-label="Last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                        className={errors.email ? 'border-destructive' : ''}
                        aria-label="Email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Phone
                      </label>
                      <Input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number (optional)"
                        aria-label="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Password
                      </label>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        className={errors.password ? 'border-destructive' : ''}
                        aria-label="Password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-heading text-secondary mb-2">Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Street
                        </label>
                        <Input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Enter street (optional)"
                          aria-label="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          City
                        </label>
                        <Input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="Enter city (optional)"
                          aria-label="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          State
                        </label>
                        <Input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          placeholder="Enter state (optional)"
                          aria-label="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Postal Code
                        </label>
                        <Input
                          type="text"
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                          placeholder="Enter postal code (optional)"
                          aria-label="Postal code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Country
                        </label>
                        <Input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          placeholder="Enter country"
                          aria-label="Country"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Link to="/admin/customers">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto hover:bg-primary/10"
                        aria-label="Cancel"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-secondary"
                      aria-label="Create customer"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Customer
                    </Button>
                  </div>
                </form>
              </LoadingOverlay>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default AddCustomerPage;