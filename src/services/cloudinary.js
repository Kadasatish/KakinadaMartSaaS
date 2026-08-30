const CLOUD_NAME = 'jwpwq08y'
const UPLOAD_PRESET = 'kakinadamart'

export async function uploadImage(file) {
  if (!file) throw new Error('Please choose an image.')
  if (!file.type.startsWith('image/')) throw new Error('Only image files are supported.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.')

  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: data
  })

  const result = await response.json()
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Image upload failed.')
  }

  return result.secure_url
}
