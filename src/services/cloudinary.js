const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET)

export async function uploadProductImage(file, tenantId, side = 'main') {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Add the Cloudinary cloud name and unsigned upload preset.')
  }
  if (!(file instanceof File)) throw new Error('Please select an image file.')
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.')
  if (!tenantId) throw new Error('Admin tenant is missing.')

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', `kakinadamart/${tenantId}/products`)
  body.append('context', `tenantId=${tenantId}|side=${side}`)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body
  })

  const result = await response.json()
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Image upload failed.')
  }
  return result.secure_url
}
