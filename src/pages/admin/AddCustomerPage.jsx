import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import CustomerService from '../../services/admin/customer.service';
import { LoadingState } from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/Toast'; // Replaced react-hot-toast with custom toast

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast(); // Use custom toast hook
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
      addToast('Please fix the errors in the form', 'error'); // Updated to use custom toast
      return;
    }

    setLoading(true);
    try {
      await CustomerService.createCustomer(formData);
      addToast('Customer created successfully', 'success'); // Updated to use custom toast
      navigate('/admin/customers');
    } catch (err) {
      setLoading(false);
      const errorMessage = err.toString() || 'Failed to create customer';
      setErrors({ form: errorMessage });
      addToast(errorMessage, 'error'); // Updated to use custom toast
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Customer | Scenture Lagos Admin</title>
      </Helmet>

      <div className="space-y-6 px-0">
        <div className="flex items-center px-4 sm:px-6">
          <Link to="/admin/customers" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="dashboardHeading">Add New Customer</h1>
            <p className="dashboardSubHeading">Create a new customer profile</p>
          </div>
        </div>

        {loading && <LoadingState fullPage={false} className="py-12 px-4 sm:px-6" />}

        <Card className="mx-0">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Enter the customer’s information below</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {errors.form && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {errors.form}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 w-full px-4 py-2 border ${
                      errors.firstName ? 'border-red-300' : 'border-slate-200'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 w-full px-4 py-2 border ${
                      errors.lastName ? 'border-red-300' : 'border-slate-200'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 w-full px-4 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-slate-200'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 w-full px-4 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-slate-200'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary mb-2">Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary">Street</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter street (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter city (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter state (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">Postal Code</label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter postal code (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-3 gap-3">
                <Link to="/admin/customers">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  <UserPlus size={16} className="mr-2" />
                  Create Customer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AddCustomerPage;