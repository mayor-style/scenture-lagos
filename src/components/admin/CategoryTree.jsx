// src/components/admin/CategoryTree.jsx (Refactored)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { ChevronRight, ChevronDown, FolderTree, Edit, Eye, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState'; // You used LoadingState in your import
import ErrorState from '../ui/ErrorState';
import ProductService from '../../services/admin/product.service';

const CategoryTree = ({ onSelectCategory, selectedCategoryId, showActions = true }) => {
    // UI state for expanded nodes remains
    const [expandedNodes, setExpandedNodes] = useState({});

    // --- 1. Fetch data with useQuery ---
    const { 
        data: categoryTreeResponse, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['categoryTree'],
        queryFn: () => ProductService.getCategoryTree(),
    });

    // The service already returns { data: [...] }, so we access it here
    const categories = categoryTreeResponse?.data || [];

    // --- 2. Use a separate useEffect to handle logic after data is fetched ---
    useEffect(() => {
        // Only run this if we have categories to process
        if (categories.length > 0) {
            const expanded = {};
            const expandAll = (nodes) => {
                nodes.forEach(node => {
                    expanded[node._id] = true;
                    if (node.children && node.children.length > 0) {
                        expandAll(node.children);
                    }
                });
            };
            expandAll(categories);
            setExpandedNodes(expanded);
        }
    }, [categories]); // This effect now correctly depends on the fetched data

    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    // --- 3. Use isLoading and isError from useQuery for rendering ---
    if (isLoading) return <LoadingState message="Loading category tree..." className="py-8" />;
    if (isError) return <ErrorState message={error.message} className="py-8" />;

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

  if (isLoading) return <LoadingState message="Loading category tree..." className="py-8" />;
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