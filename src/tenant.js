export const PLATFORM_NAME = 'KakinadaMart'
export const DEFAULT_TENANT_ID = 'kakinadamart'
const ADMIN_TENANT_KEY = 'kakinadamart-admin-tenant'

// One stable identity map for the whole app. Serial numbers are display identities,
// while tenant IDs remain the internal data partition keys.
export const ADMIN_URL_IDENTITIES = {
  kakinadamart: {
    slug: 'kakinadamart-01',
    name: 'KakinadaMart Admin',
    storeName: 'KakinadaMart',
    number: '01'
  },
  client2: {
    slug: 'client2-02',
    name: 'Client 2 Admin',
    storeName: 'Client 2',
    number: '02'
  }
}

export const SUPER_ADMIN_URL_IDENTITY = {
  slug: 'platform-01',
  name: 'KakinadaMart Super Admin',
  number: '01'
}

export function getAdminIdentityBySlug(slug) {
  return Object.entries(ADMIN_URL_IDENTITIES).find(([, identity]) => identity.slug === slug)?.[0] || ''
}

export function getAdminIdentity(tenantId) {
  return ADMIN_URL_IDENTITIES[tenantId] || {
    slug: `${tenantId}-admin`,
    name: `${tenantId} Admin`,
    storeName: tenantId,
    number: ''
  }
}

export function setAdminTenant(tenantId) {
  if (tenantId) sessionStorage.setItem(ADMIN_TENANT_KEY, tenantId)
}

export function getAdminTenant() {
  return sessionStorage.getItem(ADMIN_TENANT_KEY) || DEFAULT_TENANT_ID
}

export function getCartKey(tenantId) {
  return `kakinadamart-cart:${tenantId || DEFAULT_TENANT_ID}`
}
