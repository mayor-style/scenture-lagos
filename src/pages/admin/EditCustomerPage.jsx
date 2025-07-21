import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import CustomerService from '../../services/admin/customer.service';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/Toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const EditCustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
    },
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setErrors({});
      try {
        const response = await CustomerService.getCustomer(id);
        const customer = response.data?.customer || {};
        setFormData({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          password: '',
          address: {
            street: customer.address?.street || '',
            city: customer.address?.city || '',
            state: customer.address?.state || '',
            postalCode: customer.address?.postal_code || '',
            country: customer.address?.country || 'Nigeria',
          },
          active: customer.status === 'active',
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to load customer data';
        setErrors({ form: errorMessage });
        addToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id, addToast]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (formData.password && formData.password.length < 6) {
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
      setErrors({ ...errors, [`address.${addressField}`]: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    }
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
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        active: formData.active,
      };
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }
      await CustomerService.updateCustomer(id, updateData);
      addToast('Customer updated successfully', 'success');
      navigate(`/admin/customers/${id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update customer';
      setErrors({ form: errorMessage });
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Customer | Scenture Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-6 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
      >
        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="mr-4 hover:bg-primary/20"
              aria-label="Back to customer details"
            >
              <Link to={`/admin/customers/${id}`}>
                <ArrowLeft className="h-5 w-5 text-secondary" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary tracking-tight">
                Edit Customer
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">Update customer profile details</p>
            </div>
          </div>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary-dark"
          >
            <Edit className="mr-2 h-4 w-4" />
            {loading ? 'Updating...' : 'Update Customer'}
          </Button>
        </motion.header>

        {/* Loading State */}
        <LoadingOverlay loading={loading}>
          {/* Error State */}
          <AnimatePresence>
            {errors.form && !loading && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md flex items-center"
              >
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{errors.form}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-background shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-secondary">Customer Details</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Update the customer’s information below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        First Name*
                      </label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className={errors.firstName ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Last Name*
                      </label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className={errors.lastName ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Email*
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                        className={errors.email ? 'border-destructive' : ''}
                        disabled={loading}
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number (optional)"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Password (optional)
                      </label>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password (leave blank to keep current)"
                        className={errors.password ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">
                        Status
                      </label>
                      <Select
                        value={formData.active.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, active: value === 'true' })
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-background border-primary/20">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-medium text-secondary mb-2">Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Street
                        </label>
                        <Input
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Enter street (optional)"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          City
                        </label>
                        <Input
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="Enter city (optional)"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          State
                        </label>
                        <Input
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          placeholder="Enter state (optional)"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Postal Code
                        </label>
                        <Input
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                          placeholder="Enter postal code (optional)"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">
                          Country
                        </label>
                        <Input
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          placeholder="Enter country"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      variant="outline"
                      asChild
                      className="hover:bg-primary/10"
                      disabled={loading}
                    >
                      <Link to={`/admin/customers/${id}`}>Cancel</Link>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {loading ? 'Updating...' : 'Update Customer'}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </LoadingOverlay>
      </motion.div>
    </>
  );
};

export default EditCustomerPage;