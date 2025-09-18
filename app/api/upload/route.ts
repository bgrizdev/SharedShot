import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const files = data.getAll('files') as File[]
    const eventSlug = data.get('eventSlug') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 })
    }

    if (!eventSlug) {
      return NextResponse.json({ error: 'No event slug provided' }, { status: 400 })
    }

    // Ensure directory exists
    const { mkdir } = await import('fs/promises')
    const dir = join(process.cwd(), 'public', 'uploads', eventSlug)
    await mkdir(dir, { recursive: true })

    const uploadedImages = []

    // Process each file
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create unique filename with .jpg extension (since we're converting to JPEG)
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const originalName = file.name.split('.')[0] // Remove original extension
      const filename = `${timestamp}-${randomSuffix}-${originalName}.jpg`
      const filepath = join(process.cwd(), 'public', 'uploads', eventSlug, filename)

      // Optimize image with sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        }) // Max 1920x1080, maintain aspect ratio
        .webp({ 
          quality: 80,      
          lossless: true,  
          nearLossless: false 
        }) // Convert to webp with 85% quality
        .toBuffer()

      // Write the optimized file
      await writeFile(filepath, optimizedBuffer)

      const imageUrl = `/uploads/${eventSlug}/${filename}`
      uploadedImages.push(imageUrl)
    }
    
    return NextResponse.json({ 
      message: `${uploadedImages.length} files uploaded successfully`,
      imageUrls: uploadedImages
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
  }
}