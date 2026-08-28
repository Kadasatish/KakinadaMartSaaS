import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const ORDER_STATUSES = ['new', 'confirmed', 'packed', 'delivered', 'cancelled']

export async function createOrder({ customer, items, total }) {
  if (!db) throw new Error('Firebase is not configured yet.')

  return addDoc(collection(db, 'orders'), {
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

export async function getOrders() {
  if (!db) throw new Error('Firebase is not configured yet.')
  const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function updateOrderStatus(id, status) {
  if (!db) throw new Error('Firebase is not configured yet.')
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid order status.')
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() })
}
