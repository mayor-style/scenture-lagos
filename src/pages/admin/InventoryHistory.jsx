import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LoadingOverlay } from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/Button';
import InventoryService from '../../services/admin/inventory.service';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, AlertCircle, Package } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const InventoryHistory = () => {
  const { id } = useParams();
  const { addToast } = useToast();
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
  }, [id, addToast]);

  if (error && !loading) {
    return (
      <>
        <Helmet>
          <title>Error | Scenture Lagos Admin</title>
        </Helmet>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 max-w-7xl"
        >
          <Card className="border-destructive/20 bg-destructive/10 shadow-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <CardTitle className="text-xl font-heading text-secondary mb-2">Error Loading Data</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mb-6">{error}</CardDescription>
              <Button
                as={Link}
                to="/admin/inventory"
                className="flex items-center justify-center w-full sm:w-auto bg-primary hover:bg-primary-dark"
                aria-label="Return to inventory"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Inventory
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </>
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
        <motion.div variants={itemVariants} className="flex items-center">
          <Button
            as={Link}
            to="/admin/inventory"
            variant="outline"
            className="flex items-center w-full sm:w-auto border-primary/20 hover:bg-primary/10"
            aria-label="Back to inventory"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </motion.div>
        <LoadingOverlay loading={loading}>
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-background shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="p-5 sm:p-6">
                <CardTitle className="text-xl font-heading text-secondary tracking-tight">
                  {product?.name ? `${product.name} Stock Adjustment History` : 'Stock Adjustment History'}
                </CardTitle>
                {product && (
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    SKU: {product.sku || 'N/A'} | Current Stock: {product.stockQuantity ?? 'N/A'}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {history.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence>
                      {history.map((entry) => (
                        <motion.div
                          key={entry._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Card className="border-primary/20 bg-background shadow-sm hover:shadow-md transition-all duration-300">
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
                                      hour12: true,
                                    })}
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      entry.adjustment > 0
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}
                                  >
                                    {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <span className="font-medium text-secondary mr-2">Adjusted By:</span>
                                    <span className="truncate">
                                      {entry.adjustedBy?.firstName && entry.adjustedBy?.lastName
                                        ? `${entry.adjustedBy.firstName} ${entry.adjustedBy.lastName}`
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-secondary mr-2">Previous Stock:</span>
                                    <span>{entry.previousStock ?? 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-secondary mr-2">New Stock:</span>
                                    <span>{entry.newStock ?? 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-secondary mr-2">Reason:</span>
                                    <span className="capitalize truncate">{entry.reason || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No stock adjustments found
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </LoadingOverlay>
      </motion.div>
    </>
  );
};

export default InventoryHistory;