import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import InventoryService from '../../services/admin/inventory.service';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const InventoryHistory = () => {
  const { id } = useParams();
  const {addToast} = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductAndHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productData = await InventoryService.getInventoryItem(id);
        setProduct(productData || {});

        // Fetch history
        const historyData = await InventoryService.getInventoryHistory(id);
        setHistory(Array.isArray(historyData.history) ? historyData.history : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load product data or stock history');
        addToast(err.response?.data?.message || 'Failed to load stock history', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndHistory();
  }, [id]);

  if (error && !loading) {
    return (
      <>
        <Helmet>
          <title>Error | Scenture Lagos Admin</title>
        </Helmet>
        <div className="space-y-6 px-0">
          <div className="px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-heading font-medium text-red-600 mb-4">Error Loading Data</h2>
            <p className="text-sm text-secondary/70 mb-6">{error}</p>
            <Button as={Link} to="/admin/inventory" className="flex items-center w-full sm:w-auto">
              <ArrowLeft size={16} className="mr-2" />
              Return to Inventory
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product?.name ? `${product.name} Stock History` : 'Stock History'} | Scenture Lagos Admin</title>
      </Helmet>
      <div className="space-y-6 px-0">
        <div className="px-4 sm:px-6">
          <Button as={Link} to="/admin/inventory" variant="outline" className="flex items-center w-full sm:w-auto">
            <ArrowLeft size={16} className="mr-2" />
            Back to Inventory
          </Button>
        </div>
        <LoadingOverlay loading={loading}>
          <Card className="mx-0 shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>{product?.name ? product.name : 'Product'} Stock Adjustment History</CardTitle>
              {product && (
                <CardDescription className="text-sm text-secondary/70">
                  SKU: {product.sku || 'N/A'} | Current Stock: {product.stockQuantity ?? 'N/A'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {history.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((entry) => (
                    <Card key={entry._id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-secondary">
                              {new Date(entry.adjustedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                entry.adjustment > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Adjusted By:</span>
                              <span className="truncate">
                                {entry.adjustedBy?.firstName && entry.adjustedBy?.lastName
                                  ? `${entry.adjustedBy.firstName} ${entry.adjustedBy.lastName}`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Previous Stock:</span>
                              <span>{entry.previousStock ?? 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">New Stock:</span>
                              <span>{entry.newStock ?? 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">Reason:</span>
                              <span className="capitalize truncate">{entry.reason || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-6 text-sm">
                  No stock adjustments found
                </div>
              )}
            </CardContent>
          </Card>
        </LoadingOverlay>
      </div>
    </>
  );
};

export default InventoryHistory;