import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import CustomerService from '../../services/admin/customer.service';
import { LoadingState } from '../../components/ui/LoadingState';
import {useToast} from '../../components/ui/Toast';

const EditCustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {addToast} = useToast();
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
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load customer data';
      setErrors({ form: errorMessage });
      addToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

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
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState fullPage={false} className="py-12 px-4 sm:px-6" />;
  }

  return (
    <>
      <Helmet>
        <title>Edit Customer | Scenture Lagos Admin</title>
      </Helmet>

      <div className="space-y-6 px-0">
        <div className="flex items-center px-4 sm:px-6">
          <Link to={`/admin/customers/${id}`} className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-secondary">Edit Customer</h1>
            <p className="text-sm text-secondary/70 mt-1">Update customer profile details</p>
          </div>
        </div>

        <Card className="mx-0 shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Update the customer’s information below</CardDescription>
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
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm`}
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
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm`}
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
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm`}
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
                    className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 w-full px-4 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-slate-200'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm`}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Status</label>
                  <select
                    name="active"
                    value={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
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
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
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
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
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
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
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
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
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
                      className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow hover:shadow-sm"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-3 gap-3">
                <Link to={`/admin/customers/${id}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  <Edit size={16} className="mr-2" />
                  Update Customer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditCustomerPage;