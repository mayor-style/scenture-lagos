import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/Button';
import InventoryService from '../../services/admin/inventory.service';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const InventoryHistory = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductAndHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Promise.all to fetch data concurrently
      const [productData, historyData] = await Promise.all([
        InventoryService.getInventoryItem(id),
        InventoryService.getInventoryHistory(id)
      ]);

      setProduct(productData || null);
      setHistory(Array.isArray(historyData?.history) ? historyData.history : []);
      
      if (!productData?._id) {
          throw new Error('Product not found.');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load product data';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchProductAndHistory();
  }, [fetchProductAndHistory]);

  if (loading) {
      return <LoadingOverlay loading text="Loading History..." className="min-h-screen"/>
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorState title="Could Not Load History" message={error} onRetry={fetchProductAndHistory} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product?.name ? `${product.name} Stock History` : 'Stock History'} | Scenture Lagos Admin</title>
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 max-w-7xl space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Button as={Link} to="/admin/inventory" variant="outline" aria-label="Back to inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-background shadow-sm">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="text-xl font-heading text-secondary tracking-tight">
                Stock Adjustment History for {product?.name || '...'}
              </CardTitle>
              {product && (
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  SKU: {product.sku || 'N/A'} | Current Stock: {product.stockQuantity ?? 'N/A'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              {history.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {history.map((entry) => (
                      <motion.div
                        key={entry._id}
                        variants={itemVariants}
                        layout
                      >
                        <Card className="border-primary/20 bg-background shadow-sm hover:shadow-md h-full">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-secondary">
                                {new Date(entry.adjustedAt).toLocaleString('en-NG', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  entry.adjustment > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm text-muted-foreground">
                              <div><span className="font-medium text-secondary">By:</span> {entry.adjustedBy ? `${entry.adjustedBy.firstName} ${entry.adjustedBy.lastName}` : 'N/A'}</div>
                              <div><span className="font-medium text-secondary">Reason:</span> <span className="capitalize">{entry.reason || 'N/A'}</span></div>
                              <div><span className="font-medium text-secondary">Stock Change:</span> {entry.previousStock ?? 'N/A'} → {entry.newStock ?? 'N/A'}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No stock adjustments have been recorded for this product.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default InventoryHistory;