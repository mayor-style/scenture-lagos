import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import CustomerService from '../../services/admin/customer.service';
import { LoadingState } from '../../components/ui/LoadingState';
import toast from 'react-hot-toast';

const AddCustomerPage = () => {
  const navigate = useNavigate();
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
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      await CustomerService.createCustomer(formData);
      toast.success('Customer created successfully');
      navigate('/admin/customers');
    } catch (err) {
      console.log('from page', err)
      setLoading(false);
      const errorMessage = err.toString() || 'Failed to create customer';
      setErrors({ form: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Customer | Scenture Lagos Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/admin/customers" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-medium text-secondary">Add New Customer</h1>
            <p className="text-secondary/70 mt-1">Create a new customer profile</p>
          </div>
        </div>

        {loading && <LoadingState fullPage={false} className="py-12" />}

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Enter the customer’s information below</CardDescription>
          </CardHeader>
          <CardContent>
            {errors.form && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {errors.form}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex justify-end space-x-3">
                <Link to="/admin/customers">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
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