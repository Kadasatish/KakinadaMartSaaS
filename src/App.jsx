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
import { DEFAULT_TENANT_ID, ADMIN_URL_IDENTITIES, SUPER_ADMIN_URL_IDENTITY } from './tenant'

const defaultAdminSlug = ADMIN_URL_IDENTITIES[DEFAULT_TENANT_ID].slug
const superAdminSlug = SUPER_ADMIN_URL_IDENTITY.slug

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/store/${DEFAULT_TENANT_ID}`} replace />} />
      <Route path="/store/:tenantId" element={<CustomerHome />} />
      <Route path="/store/:tenantId/cart" element={<Cart />} />
      <Route path="/store/:tenantId/checkout" element={<Checkout />} />

      {/* Stable, identity-based admin URLs. */}
      <Route path="/admin/:adminSlug/login" element={<AdminLogin />} />
      <Route path="/admin/:adminSlug" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
      <Route path="/admin/login" element={<Navigate to={`/admin/${defaultAdminSlug}/login`} replace />} />
      <Route path="/admin" element={<Navigate to={`/admin/${defaultAdminSlug}`} replace />} />

      {/* Stable super-admin URL. */}
      <Route path="/super-admin/:superAdminSlug/login" element={<SuperAdminLogin />} />
      <Route path="/super-admin/:superAdminSlug" element={<SuperAdminGuard><SuperAdminDashboard /></SuperAdminGuard>} />
      <Route path="/super-admin/login" element={<Navigate to={`/super-admin/${superAdminSlug}/login`} replace />} />
      <Route path="/super-admin" element={<Navigate to={`/super-admin/${superAdminSlug}`} replace />} />

      <Route path="*" element={<Navigate to={`/store/${DEFAULT_TENANT_ID}`} replace />} />
    </Routes>
  )
}
