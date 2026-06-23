import { NextResponse } from 'next/server'
import { ApiError, apiError, requireAuth } from '@/lib/api/security'
import { equipmentUploadSchema } from '@/lib/api/validations'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/** Equipment detection with JWT auth and secure file upload validation */
export async function POST(request: Request) {
  try {
    await requireAuth()
    const { maxSizeBytes, allowedTypes } = equipmentUploadSchema.parse({})
    const formData = await request.formData()
    const file = formData.get('image')

    if (!file || !(file instanceof Blob)) {
      throw new ApiError(400, 'No image uploaded')
    }

    if (file.size > maxSizeBytes) {
      throw new ApiError(400, `File too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`)
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!allowedTypes.includes(mimeType)) {
      throw new ApiError(400, 'Invalid file type. Allowed: JPEG, PNG, WebP')
    }

    if (file instanceof File && file.name && !hasAllowedExtension(file.name)) {
      throw new ApiError(400, 'Invalid file extension')
    }

    // Not implemented yet — returns empty list so the client falls back to manual pick
    const detected: string[] = []

    return NextResponse.json({
      data: {
        detected,
        message:
          detected.length > 0
            ? 'Equipment detected from image'
            : 'Auto-detection unavailable — select equipment manually.',
        fallback: 'manual',
      },
    })
  } catch (err) {
    return apiError(err)
  }
}
