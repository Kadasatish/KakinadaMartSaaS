export const DEFAULT_TENANT_ID = 'kakinadamart'
const ADMIN_TENANT_KEY = 'kakinadamart-admin-tenant'

export function setAdminTenant(tenantId) {
  if (tenantId) sessionStorage.setItem(ADMIN_TENANT_KEY, tenantId)
}

export function getAdminTenant() {
  return sessionStorage.getItem(ADMIN_TENANT_KEY) || DEFAULT_TENANT_ID
}

export function getCartKey(tenantId) {
  return `kakinadamart-cart:${tenantId || DEFAULT_TENANT_ID}`
}
