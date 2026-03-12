import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload a frame photo to the `frame-images` bucket.
 *
 * @param {File} file - The image File object to upload.
 * @returns {Promise<string>} The public URL of the uploaded image.
 * @throws {Error} If the upload fails.
 */
export async function uploadFrameImage(file) {
  const ext      = file.name.split('.').pop()
  const filename = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('frame-images')
    .upload(filename, file, { upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage
    .from('frame-images')
    .getPublicUrl(filename)

  return data.publicUrl
}
