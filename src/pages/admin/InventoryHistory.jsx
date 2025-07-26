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

// Animation variants for Framer Motion
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

/**
 * @component InventoryHistory
 * @description Displays the stock adjustment history for a specific product.
 * Fetches product details and its stock adjustment history based on the product ID from the URL.
 */
const InventoryHistory = () => {
    const { id } = useParams(); // Get product ID from URL parameters
    const { addToast } = useToast();
    const [history, setHistory] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * @function fetchProductAndHistory
     * @description Fetches the product details and its stock adjustment history concurrently.
     * Uses useCallback to memoize the function, preventing unnecessary re-renders.
     */
    const fetchProductAndHistory = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear any previous errors
        try {
            // Use Promise.all to fetch product data and history concurrently for efficiency
            const [productData, historyData] = await Promise.all([
                InventoryService.getInventoryItem(id),
                InventoryService.getInventoryHistory(id)
            ]);

            // Set product data, or null if not found
            setProduct(productData || null);
            // Ensure historyData.history is an array before setting state
            setHistory(Array.isArray(historyData?.history) ? historyData.history : []);

            // If product data is not found, throw an error to trigger the error state
            if (!productData?._id) {
                throw new Error('Product not found or invalid ID.');
            }

        } catch (err) {
            // Extract a user-friendly error message
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load product data or history.';
            setError(errorMessage);
            addToast(errorMessage, 'error'); // Display a toast notification for the error
        } finally {
            setLoading(false); // Set loading to false once data fetching is complete (or error occurs)
        }
    }, [id, addToast]); // Dependencies for useCallback: id and addToast

    // Effect hook to call fetchProductAndHistory when the component mounts or dependencies change
    useEffect(() => {
        fetchProductAndHistory();
    }, [fetchProductAndHistory]); // Dependency array includes the memoized fetch function

    // Render loading state while data is being fetched
    if (loading) {
        return <LoadingOverlay loading text="Loading Stock History..." className="min-h-screen" />;
    }

    // Render error state if an error occurred during data fetching
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
                {/* Dynamically set page title based on product name */}
                <title>{product?.name ? `${product.name} Stock History` : 'Stock History'} | Scenture Lagos Admin</title>
            </Helmet>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 max-w-7xl space-y-6"
            >
                {/* Back button to navigate to the main inventory page */}
                <motion.div variants={itemVariants}>
                    <Button as={Link} to="/admin/inventory" variant="outline" aria-label="Back to inventory">
                      <Link to="/admin/inventory" className='flex items-center'>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                        </Link>
                    </Button>
                </motion.div>

                {/* Card displaying product details and history title */}
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
                                // Grid layout for history entries
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                        {history.map((entry) => (
                                            <motion.div
                                                key={entry._id} // Use unique ID for key
                                                variants={itemVariants}
                                                layout // Enable layout animations for smooth reordering
                                            >
                                                <Card className="border-primary/20 bg-background shadow-sm hover:shadow-md h-full">
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            {/* Display adjusted date and time */}
                                                            <div className="text-sm font-medium text-secondary">
                                                                {new Date(entry.adjustedAt).toLocaleString('en-NG', {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </div>
                                                            {/* Display adjustment quantity with color coding */}
                                                            <span
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    entry.adjustment > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                                }`}
                                                            >
                                                                {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
                                                            </span>
                                                        </div>
                                                        {/* Details of the adjustment */}
                                                        <div className="space-y-1.5 text-sm text-muted-foreground">
                                                            <div>
                                                                <span className="font-medium text-secondary">By:</span>{' '}
                                                                {/* Display adjustedBy user's name */}
                                                                {entry.adjustedBy ? `${entry.adjustedBy.firstName} ${entry.adjustedBy.lastName}` : 'N/A'}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-secondary">Reason:</span>{' '}
                                                                {/* Display reason, capitalized */}
                                                                <span className="capitalize">{entry.reason || 'N/A'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-secondary">Stock Change:</span>{' '}
                                                                {/* Display previous and new stock quantities */}
                                                                {entry.previousStock ?? 'N/A'} &rarr; {entry.newStock ?? 'N/A'}
                                                            </div>
                                                            {/* Display variant SKU if applicable */}
                                                            {entry.variantId && (
                                                                <div>
                                                                    <span className="font-medium text-secondary">Variant SKU:</span>{' '}
                                                                    {/* Assuming you might want to fetch variant SKU here or it's implicitly part of the product */}
                                                                    {/* For now, we don't have variant SKU directly in history entry, but if it were, this is where it'd go */}
                                                                    {/* You might need to adjust your backend's stockAdjustments schema or populate it if you want variant details here */}
                                                                    {/* For now, we'll just indicate it's a variant adjustment without specific variant SKU */}
                                                                    <span className="italic">(Variant Adjustment)</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // Message when no history is found
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