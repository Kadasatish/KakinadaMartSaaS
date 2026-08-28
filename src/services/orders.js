import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

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
