import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// POST /api/events/[slug]/images - Add images to an event
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { imageUrls } = await request.json()

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return NextResponse.json(
        { success: false, error: 'Image URLs array is required' },
        { status: 400 }
      )
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { slug }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Create image records
    const imageRecords = await Promise.all(
      imageUrls.map(async (url: string) => {
        const filename = url.split('/').pop() || 'unknown'
        return prisma.eventImage.create({
          data: {
            url,
            filename,
            eventId: event.id
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      images: imageRecords
    })
  } catch (error) {
    console.error('Error adding images:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add images' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[slug]/images - Delete an image from an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Find and delete the image
    const deletedImage = await prisma.eventImage.deleteMany({
      where: {
        url: imageUrl,
        event: { slug }
      }
    })

    if (deletedImage.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}