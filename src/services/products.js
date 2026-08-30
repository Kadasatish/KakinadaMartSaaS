import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase'

const demoProducts = [
  { id: 'demo-1', name: 'Demo Product 1', price: 99, active: true },
  { id: 'demo-2', name: 'Demo Product 2', price: 149, active: true }
]

export async function getProducts(tenantId) {
  if (!db) return demoProducts
  if (!tenantId) throw new Error('Store tenant is missing.')
  const snapshot = await getDocs(query(collection(db, 'products'), where('tenantId', '==', tenantId)))
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export async function saveProduct(product, tenantId) {
  if (!db) throw new Error('Firebase is not configured yet.')
  if (!tenantId) throw new Error('Admin tenant is missing.')
  const id = product.id || doc(collection(db, 'products')).id
  await setDoc(doc(db, 'products', id), {
    name: product.name,
    price: Number(product.price),
    active: product.active !== false,
    tenantId,
    imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls.filter(Boolean) : [],
    createdAt: product.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })
  return id
}

export async function removeProduct(id) {
  if (!db) throw new Error('Firebase is not configured yet.')
  await deleteDoc(doc(db, 'products', id))
}
