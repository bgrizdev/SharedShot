import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
    }

    // Convert URL path to filesystem path
    // imageUrl format: /uploads/event-slug/filename.jpg
    const filepath = join(process.cwd(), 'public', imageUrl)

    try {
      await unlink(filepath)
      return NextResponse.json({ message: 'File deleted successfully' })
    } catch (fileError: any) {
      // File might not exist or already deleted
      if (fileError.code === 'ENOENT') {
        return NextResponse.json({ message: 'File already deleted or not found' })
      }
      throw fileError
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}