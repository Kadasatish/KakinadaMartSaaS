import { Navigate, Route, Routes } from 'react-router-dom'
import CustomerHome from './customer/CustomerHome'
import Cart from './customer/Cart'
import Checkout from './customer/Checkout'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import { AdminGuard } from './admin/AdminGuard'
import SuperAdminLogin from './superadmin/SuperAdminLogin'
import SuperAdminDashboard from './superadmin/SuperAdminDashboard'
import { SuperAdminGuard } from './superadmin/SuperAdminGuard'
import { DEFAULT_TENANT_ID } from './tenant'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/store/${DEFAULT_TENANT_ID}`} replace />} />
      <Route path="/store/:tenantId" element={<CustomerHome />} />
      <Route path="/store/:tenantId/cart" element={<Cart />} />
      <Route path="/store/:tenantId/checkout" element={<Checkout />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route path="/super-admin" element={<SuperAdminGuard><SuperAdminDashboard /></SuperAdminGuard>} />
      <Route path="*" element={<Navigate to={`/store/${DEFAULT_TENANT_ID}`} replace />} />
    </Routes>
  )
}
