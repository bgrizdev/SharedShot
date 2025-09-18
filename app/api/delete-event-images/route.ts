import { NextRequest, NextResponse } from 'next/server'
import { rmdir } from 'fs/promises'
import { join } from 'path'

export async function DELETE(request: NextRequest) {
  try {
    const { eventSlug } = await request.json()

    if (!eventSlug) {
      return NextResponse.json({ error: 'No event slug provided' }, { status: 400 })
    }

    // Delete the entire event directory
    const eventDir = join(process.cwd(), 'public', 'uploads', eventSlug)

    try {
      await rmdir(eventDir, { recursive: true })
      return NextResponse.json({ message: 'Event images directory deleted successfully' })
    } catch (fileError: any) {
      // Directory might not exist or already deleted
      if (fileError.code === 'ENOENT') {
        return NextResponse.json({ message: 'Event directory already deleted or not found' })
      }
      throw fileError
    }
  } catch (error) {
    console.error('Error deleting event directory:', error)
    return NextResponse.json({ error: 'Failed to delete event directory' }, { status: 500 })
  }
}