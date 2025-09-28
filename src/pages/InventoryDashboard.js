// src/pages/InventoryDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InventoryDashboard = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('/api/products').then((res) => {
      setProducts(res.data);
      const uniqueCategories = [...new Set(res.data.map(p => p.category))];
      setCategories(uniqueCategories);
    });
  }, []);

  const handleRestock = async (productId) => {
    const quantity = prompt('Enter quantity to add:');
    if (quantity) {
      await axios.post(`/api/products/${productId}/restock`, { quantity: parseInt(quantity) });
      const updated = await axios.get('/api/products');
      setProducts(updated.data);
    }
  };

  const handleEdit = (product) => {
    const name = prompt('Edit product name:', product.name);
    const category = prompt('Edit category:', product.category);
    const price = prompt('Edit price:', product.price);
    const stock = prompt('Edit stock:', product.stock);
    if (name && category && price && stock) {
      axios.put(`/api/products/${product._id}`, {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
      }).then(() => {
        axios.get('/api/products').then((res) => setProducts(res.data));
      });
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios.delete(`/api/products/${productId}`).then(() => {
        axios.get('/api/products').then((res) => setProducts(res.data));
      });
    }
  };

  const filtered = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === '' || p.category === categoryFilter)
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const lowStockProducts = filtered.filter(p => p.stock <= 5);

  return (
    <div className="inventory-dashboard">
      <h2>Inventory Dashboard</h2>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '10px', marginRight: '10px' }}
      />

      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <table border="1" cellPadding="8" style={{ marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Restock</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((product) => (
            <tr key={product._id} style={{ backgroundColor: product.stock <= 5 ? '#ffe6e6' : 'white' }}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>₹{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleRestock(product._id)}>Add Stock</button>
              </td>
              <td>
                <button onClick={() => handleEdit(product)}>Edit</button>
              </td>
              <td>
                <button onClick={() => handleDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '10px' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{ margin: '2px', backgroundColor: currentPage === page ? '#ddd' : 'white' }}
          >
            {page}
          </button>
        ))}
      </div>

      {lowStockProducts.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: 'red' }}>Low Stock Alerts</h3>
          <ul>
            {lowStockProducts.map(p => (
              <li key={p._id}>{p.name} has only {p.stock} left in stock!</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
