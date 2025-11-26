import { Link } from 'react-router-dom';

function HomePage() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  return (
    <div className="w-100 min-vh-100 d-flex flex-column bg-light" style={{paddingTop: 80, paddingBottom: 60}}>
      {/* Hero Section */}
      <div className="container text-center mb-5">
        <h1 className="display-3 fw-bold mb-3 text-primary">Inventory Control System</h1>
        <p className="lead mb-4" style={{maxWidth: 900, margin: '0 auto'}}>
          Welcome to a modern inventory management solution for small businesses and organizations.
        </p>
        <p className="text-muted mb-5" style={{fontSize: '1.1rem'}}>
          Easily track products, suppliers, purchase orders, invoices, and receive low stock alerts—all in one place.
        </p>
        
        <div className="d-flex justify-content-center gap-3 mb-5">
          {token ? (
            <Link to="/dashboard">
              <button className="btn btn-success btn-lg px-5 py-3 shadow">
                Go to Dashboard{user && user.name ? ` (${user.name})` : ''}
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn-primary btn-lg px-5 py-3 shadow">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-outline-secondary btn-lg px-5 py-3">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mb-5">
        <h2 className="text-center mb-4 fw-bold">Key Features</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{fontSize: '3rem'}}>📦</div>
                <h5 className="card-title fw-bold">Product Management</h5>
                <p className="card-text text-muted">
                  Add, edit, and track all your products with SKU, categories, pricing, and stock levels.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{fontSize: '3rem'}}>🚚</div>
                <h5 className="card-title fw-bold">Supplier Tracking</h5>
                <p className="card-text text-muted">
                  Manage supplier information and link products to their respective suppliers for easy ordering.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{fontSize: '3rem'}}>📋</div>
                <h5 className="card-title fw-bold">Purchase Orders</h5>
                <p className="card-text text-muted">
                  Create purchase orders and mark them as received to automatically update inventory stock.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{fontSize: '3rem'}}>🧾</div>
                <h5 className="card-title fw-bold">Invoice Generation</h5>
                <p className="card-text text-muted">
                  Generate invoices for customers with automatic stock deduction and payment tracking.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{fontSize: '3rem'}}>⚠️</div>
                <h5 className="card-title fw-bold">Low Stock Alerts</h5>
                <p className="card-text text-muted">
                  Get notified when products fall below reorder levels to prevent stock-outs.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{fontSize: '3rem'}}>🔒</div>
                <h5 className="card-title fw-bold">Secure Access</h5>
                <p className="card-text text-muted">
                  User authentication with JWT tokens ensures your inventory data stays protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mb-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2 className="fw-bold mb-4">Why Choose Our System?</h2>
            <ul className="list-unstyled">
              <li className="mb-3">
                <span className="text-primary fw-bold me-2">✓</span>
                <strong>Easy to Use:</strong> Simple interface designed for everyone
              </li>
              <li className="mb-3">
                <span className="text-primary fw-bold me-2">✓</span>
                <strong>Real-Time Updates:</strong> Instant stock level changes
              </li>
              <li className="mb-3">
                <span className="text-primary fw-bold me-2">✓</span>
                <strong>No Hidden Costs:</strong> Straightforward inventory management
              </li>
              <li className="mb-3">
                <span className="text-primary fw-bold me-2">✓</span>
                <strong>Comprehensive Reports:</strong> Track all transactions and stock movements
              </li>
              <li className="mb-3">
                <span className="text-primary fw-bold me-2">✓</span>
                <strong>Scalable:</strong> Grows with your business needs
              </li>
            </ul>
          </div>
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-3">Quick Stats Dashboard</h5>
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="p-3 bg-light rounded">
                      <h3 className="text-primary mb-0">📊</h3>
                      <small className="text-muted">Real-time Monitoring</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="p-3 bg-light rounded">
                      <h3 className="text-success mb-0">💹</h3>
                      <small className="text-muted">Sales Tracking</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <h3 className="text-warning mb-0">📈</h3>
                      <small className="text-muted">Stock Analytics</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <h3 className="text-info mb-0">🎯</h3>
                      <small className="text-muted">Order Management</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container text-center mb-5">
        <div className="card shadow-lg border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <div className="card-body p-5 text-white">
            <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
            <p className="lead mb-4">
              Take control of your inventory today. Sign up now and streamline your business operations.
            </p>
            {!token && (
              <Link to="/register">
                <button className="btn btn-light btn-lg px-5 py-3 shadow">
                  Create Your Account
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
