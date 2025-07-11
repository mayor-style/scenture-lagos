import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, FolderTree, Edit, Eye, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import ProductService from '../../services/admin/product.service';

const CategoryTree = ({ onSelectCategory, selectedCategoryId, showActions = true }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    const fetchCategoryTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ProductService.getCategoryTree();
        console.log('API Response:', response); // Log for debugging
        const data = Array.isArray(response.data) ? response.data : [];
        setCategories(data);

        // Auto-expand all nodes initially
        const expanded = {};
        const expandAll = (nodes) => {
          if (!Array.isArray(nodes)) {
            console.error('Expected an array for nodes, got:', nodes);
            return;
          }
          nodes.forEach(node => {
            expanded[node._id] = true;
            if (node.children && node.children.length > 0) {
              expandAll(node.children);
            }
          });
        };
        expandAll(data);
        setExpandedNodes(expanded);
      } catch (err) {
        console.error('Error fetching category tree:', err);
        setError(err.message || 'Failed to fetch category tree');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryTree();
  }, []);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const renderCategoryNode = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes[category._id];
    const isSelected = selectedCategoryId === category._id;

    return (
      <div key={category._id} className="category-tree-node">
        <div
          className={`flex items-center py-1 ${isSelected ? 'bg-primary/10 rounded' : ''}`}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(category._id)}
              className="w-6 h-6 flex items-center justify-center text-secondary/70 hover:text-secondary"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-6 h-6" />
          )}

          <div
            className={`flex-1 flex items-center cursor-pointer px-2 py-1 rounded hover:bg-slate-100 ${isSelected ? 'font-medium text-primary' : 'text-secondary'}`}
            onClick={() => onSelectCategory && onSelectCategory(category._id)}
          >
            <span className="truncate">{category.name}</span>
            {category.productCount > 0 && (
              <span className="ml-2 text-xs text-secondary/70">({category.productCount})</span>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                <Link to={`/admin/categories/${category._id}`} title="View Category">
                  <Eye size={14} />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                <Link to={`/admin/categories/${category._id}/edit`} title="Edit Category">
                  <Edit size={14} />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                <Link to="/admin/categories/new" state={{ parentId: category._id }} title="Add Subcategory">
                  <Plus size={14} />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="category-tree-children">
            {category.children.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <LoadingState message="Loading category tree..." className="py-8" />;
  if (error) return <ErrorState message={error} className="py-8" />;
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-secondary/70">
        <FolderTree size={32} className="mx-auto mb-2 text-slate-300" />
        <p>No categories found</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/admin/categories/new">
            <Plus size={14} className="mr-1" />
            Add Category
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="category-tree">
      {categories.map(category => renderCategoryNode(category))}
    </div>
  );
};

export default CategoryTree;