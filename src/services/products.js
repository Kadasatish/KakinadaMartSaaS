import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const demoProducts = [
  { id: 'demo-1', name: 'Demo Product 1', price: 99, active: true },
  { id: 'demo-2', name: 'Demo Product 2', price: 149, active: true }
]

export async function getProducts() {
  if (!db) return demoProducts
  const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function saveProduct(product) {
  if (!db) throw new Error('Firebase is not configured yet.')
  const id = product.id || doc(collection(db, 'products')).id
  await setDoc(doc(db, 'products', id), {
    name: product.name,
    price: Number(product.price),
    active: product.active !== false,
    createdAt: product.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })
  return id
}

export async function removeProduct(id) {
  if (!db) throw new Error('Firebase is not configured yet.')
  await deleteDoc(doc(db, 'products', id))
}
