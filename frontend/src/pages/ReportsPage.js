import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'profit', 'expiry'
  
  // Inventory Valuation State
  const [inventoryData, setInventoryData] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  
  // Profit/Loss State
  const [profitData, setProfitData] = useState(null);
  const [profitLoading, setProfitLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Expiry State
  const [expiryData, setExpiryData] = useState(null);
  const [expiryLoading, setExpiryLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Load initial data
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventoryValuation();
    } else if (activeTab === 'profit') {
      fetchProfitLoss();
    } else if (activeTab === 'expiry') {
      fetchExpiredProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchInventoryValuation = async () => {
    setInventoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/inventory-valuation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setInventoryData(data);
      } else {
        alert(data.error || 'Failed to load inventory valuation');
      }
    } catch (err) {
      console.error('Inventory valuation fetch error:', err);
      alert('Network error loading inventory valuation');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchProfitLoss = async () => {
    setProfitLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/api/reports/profit-loss`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProfitData(data);
      } else {
        alert(data.error || 'Failed to load profit/loss analysis');
      }
    } catch (err) {
      console.error('Profit/loss fetch error:', err);
      alert('Network error loading profit/loss analysis');
    } finally {
      setProfitLoading(false);
    }
  };

  const fetchExpiredProducts = async () => {
    setExpiryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/expired-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setExpiryData(data);
      } else {
        alert(data.error || 'Failed to load expired products');
      }
    } catch (err) {
      console.error('Expired products fetch error:', err);
      alert('Network error loading expired products');
    } finally {
      setExpiryLoading(false);
    }
  };

  const handleProfitLossFilter = (e) => {
    e.preventDefault();
    fetchProfitLoss();
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4">Business Reports</h1>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Valuation
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'profit' ? 'active' : ''}`}
            onClick={() => setActiveTab('profit')}
          >
            Profit/Loss Analysis
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'expiry' ? 'active' : ''}`}
            onClick={() => setActiveTab('expiry')}
          >
            Expiry Tracking
          </button>
        </li>
      </ul>

      {/* Inventory Valuation Tab */}
      {activeTab === 'inventory' && (
        <div>
          {inventoryLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : inventoryData ? (
            <>
              {/* Summary Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Total Products</h6>
                      <h3 className="card-title">{inventoryData.summary.totalProducts}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Total Items</h6>
                      <h3 className="card-title">{inventoryData.summary.totalItems}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Cost Value</h6>
                      <h3 className="card-title">₹{inventoryData.summary.totalCostValue}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Selling Value</h6>
                      <h3 className="card-title">₹{inventoryData.summary.totalSellingValue}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Potential Profit</h6>
                      <h3 className="card-title text-success">₹{inventoryData.summary.potentialProfit}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Profit Margin</h6>
                      <h3 className="card-title text-primary">{inventoryData.summary.profitMargin}%</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="card">
                <div className="card-header">
                  <h5>Product-wise Valuation</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Cost Price</th>
                          <th>Selling Price</th>
                          <th>Cost Value</th>
                          <th>Selling Value</th>
                          <th>Potential Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.products.map(p => (
                          <tr key={p._id}>
                            <td>{p.sku}</td>
                            <td>{p.name}</td>
                            <td>{p.quantity}</td>
                            <td>₹{p.costPrice.toFixed(2)}</td>
                            <td>₹{p.sellingPrice.toFixed(2)}</td>
                            <td>₹{p.costValue.toFixed(2)}</td>
                            <td>₹{p.sellingValue.toFixed(2)}</td>
                            <td className={p.potentialProfit >= 0 ? 'text-success' : 'text-danger'}>
                              ₹{p.potentialProfit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p>No inventory data available.</p>
          )}
        </div>
      )}

      {/* Profit/Loss Analysis Tab */}
      {activeTab === 'profit' && (
        <div>
          {/* Date Filter Form */}
          <form onSubmit={handleProfitLossFilter} className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Filter by Date Range</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary me-2">Apply Filter</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      fetchProfitLoss();
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </form>

          {profitLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : profitData ? (
            <>
              {/* Period Info */}
              <div className="alert alert-info">
                <strong>Period:</strong> {profitData.period.startDate} to {profitData.period.endDate}
              </div>

              {/* Summary Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Total Invoices</h6>
                      <h3 className="card-title">{profitData.summary.totalInvoices}</h3>
                      <small>Paid: {profitData.summary.paidInvoices} | Unpaid: {profitData.summary.unpaidInvoices}</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Total Revenue</h6>
                      <h3 className="card-title">₹{profitData.summary.totalRevenue}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Total Cost</h6>
                      <h3 className="card-title">₹{profitData.summary.totalCost}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Net Profit</h6>
                      <h3 className="card-title">₹{profitData.summary.totalProfit}</h3>
                      <small>Margin: {profitData.summary.profitMargin}%</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="card">
                <div className="card-header">
                  <h5>Top 10 Products by Profit</h5>
                </div>
                <div className="card-body">
                  {profitData.topProducts.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Quantity Sold</th>
                            <th>Revenue</th>
                            <th>Cost</th>
                            <th>Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profitData.topProducts.map((p, idx) => (
                            <tr key={idx}>
                              <td>{p.sku}</td>
                              <td>{p.name}</td>
                              <td>{p.quantitySold}</td>
                              <td>₹{p.revenue.toFixed(2)}</td>
                              <td>₹{p.cost.toFixed(2)}</td>
                              <td className={p.profit >= 0 ? 'text-success' : 'text-danger'}>
                                ₹{p.profit.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No sales data available for this period.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p>No profit/loss data available.</p>
          )}
        </div>
      )}

      {/* Expiry Tracking Tab */}
      {activeTab === 'expiry' && (
        <div>
          {expiryLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : expiryData ? (
            <>
              {/* Summary Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Total Tracked</h6>
                      <h3 className="card-title">{expiryData.summary.totalTracked}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-danger text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Expired</h6>
                      <h3 className="card-title">{expiryData.summary.expired}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Expiring Soon (30d)</h6>
                      <h3 className="card-title">{expiryData.summary.expiringSoon}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2">Valid</h6>
                      <h3 className="card-title">{expiryData.summary.valid}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expired Products */}
              {expiryData.expired.length > 0 && (
                <div className="card mb-4 border-danger">
                  <div className="card-header bg-danger text-white">
                    <h5>⚠️ Expired Products</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Expiry Date</th>
                            <th>Days Overdue</th>
                            <th>Quantity</th>
                            <th>Supplier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiryData.expired.map(p => (
                            <tr key={p._id}>
                              <td>{p.sku}</td>
                              <td>{p.name}</td>
                              <td>{new Date(p.expiryDate).toLocaleDateString()}</td>
                              <td className="text-danger">{Math.abs(p.daysUntilExpiry)} days ago</td>
                              <td>{p.quantity}</td>
                              <td>{p.supplier?.name || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiring Soon */}
              {expiryData.expiringSoon.length > 0 && (
                <div className="card mb-4 border-warning">
                  <div className="card-header bg-warning text-dark">
                    <h5>⏰ Expiring Soon (Next 30 Days)</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Expiry Date</th>
                            <th>Days Until Expiry</th>
                            <th>Quantity</th>
                            <th>Supplier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiryData.expiringSoon.map(p => (
                            <tr key={p._id}>
                              <td>{p.sku}</td>
                              <td>{p.name}</td>
                              <td>{new Date(p.expiryDate).toLocaleDateString()}</td>
                              <td className="text-warning">{p.daysUntilExpiry} days</td>
                              <td>{p.quantity}</td>
                              <td>{p.supplier?.name || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Valid Products */}
              {expiryData.valid.length > 0 && (
                <div className="card border-success">
                  <div className="card-header bg-success text-white">
                    <h5>✅ Valid Products</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Expiry Date</th>
                            <th>Days Until Expiry</th>
                            <th>Quantity</th>
                            <th>Supplier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiryData.valid.map(p => (
                            <tr key={p._id}>
                              <td>{p.sku}</td>
                              <td>{p.name}</td>
                              <td>{new Date(p.expiryDate).toLocaleDateString()}</td>
                              <td className="text-success">{p.daysUntilExpiry} days</td>
                              <td>{p.quantity}</td>
                              <td>{p.supplier?.name || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {expiryData.summary.totalTracked === 0 && (
                <div className="alert alert-info">
                  No products with expiry dates are being tracked yet. Add expiry dates to products in the Dashboard to start tracking.
                </div>
              )}
            </>
          ) : (
            <p>No expiry data available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
