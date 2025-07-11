import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import InventoryService from '../../services/admin/inventory.service';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const InventoryHistory = () => {
  const { id } = useParams();
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
        setProduct(productData);
        
        // Fetch history
        const historyData = await InventoryService.getInventoryHistory(id);
        setHistory(historyData.history || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product data or stock history');
        toast({ title: 'Error', description: 'Failed to load stock history', variant: 'destructive' });
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
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="mb-6">{error}</p>
          <Button as={Link} to="/admin/inventory" className="flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Return to Inventory
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product?.name ? `${product.name} Stock History` : 'Stock History'} | Scenture Lagos Admin</title>
      </Helmet>
      <div className="mb-6">
        <Button as={Link} to="/admin/inventory" variant="outline" className="flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Back to Inventory
        </Button>
      </div>
      <LoadingOverlay loading={loading}>
        <Card>
          <CardHeader>
            <CardTitle>{product?.name ? product.name : 'Product'} Stock Adjustment History</CardTitle>
            {product && (
              <CardDescription>
                SKU: {product.sku} | Current Stock: {product.stockQuantity}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left font-medium p-3">Date</th>
                  <th className="text-left font-medium p-3">Adjusted By</th>
                  <th className="text-center font-medium p-3">Adjustment</th>
                  <th className="text-center font-medium p-3">Previous Stock</th>
                  <th className="text-center font-medium p-3">New Stock</th>
                  <th className="text-left font-medium p-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((entry) => (
                    <tr key={entry._id} className="border-b border-slate-100">
                      <td className="p-3">{new Date(entry.adjustedAt).toLocaleString()}</td>
                      <td className="p-3">{entry.adjustedBy?.firstName} {entry.adjustedBy?.lastName}</td>
                      <td className="p-3 text-center">
                        <span className={entry.adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                          {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
                        </span>
                      </td>
                      <td className="p-3 text-center">{entry.previousStock}</td>
                      <td className="p-3 text-center">{entry.newStock}</td>
                      <td className="p-3 capitalize">{entry.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-slate-500">
                      No stock adjustments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </LoadingOverlay>
    </>
  );
};

export default InventoryHistory;