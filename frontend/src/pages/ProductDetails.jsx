import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading product details...</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  return (
    <div className="py-8">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Marketplace</Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 flex flex-col items-center justify-center bg-gray-50">
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
              alt={product.name} 
              className="max-h-96 object-contain rounded-lg shadow-sm"
            />
          </div>
          <div className="md:w-1/2 p-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                  {product.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-gray-500 text-sm mb-4">By {product.providerId?.name || 'Unknown Provider'}</p>
              </div>
            </div>

            <div className="flex space-x-6 mb-6">
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                <p className="text-xs text-green-700 font-medium">Equipora Trust Score</p>
                <p className="text-2xl font-bold text-green-700">{product.trustScore}/100</p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">Condition Score</p>
                <p className="text-2xl font-bold text-blue-700">{product.conditionScore}/100</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                <li className="text-sm"><span className="font-medium text-gray-500">Brand:</span> {product.brand}</li>
                <li className="text-sm"><span className="font-medium text-gray-500">Model:</span> {product.model}</li>
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key} className="text-sm capitalize"><span className="font-medium text-gray-500">{key}:</span> {value}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">${product.pricePerDay}</p>
                  <p className="text-sm text-gray-500">per day</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Security Deposit</p>
                  <p className="text-sm text-gray-500">${product.securityDeposit}</p>
                </div>
              </div>
              
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Request to Rent
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
