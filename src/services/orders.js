import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase'

export const ORDER_STATUSES = ['new', 'confirmed', 'packed', 'delivered', 'cancelled']

export async function createOrder({ customer, items, total, tenantId }) {
  if (!db) throw new Error('Firebase is not configured yet.')
  if (!tenantId) throw new Error('Store tenant is missing.')

  return addDoc(collection(db, 'orders'), {
    tenantId,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim()
    },
    items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    total: Number(total),
    status: 'new',
    createdAt: serverTimestamp()
  })
}

export async function getOrders(tenantId) {
  if (!db) throw new Error('Firebase is not configured yet.')
  if (!tenantId) throw new Error('Admin tenant is missing.')
  const snapshot = await getDocs(query(collection(db, 'orders'), where('tenantId', '==', tenantId)))
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export async function updateOrderStatus(id, status) {
  if (!db) throw new Error('Firebase is not configured yet.')
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid order status.')
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() })
}
