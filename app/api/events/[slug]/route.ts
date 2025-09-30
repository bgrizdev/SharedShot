import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/events/[slug] - Get a single event by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { createdAt: 'desc' }
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[slug] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user owns the event
    const event = await prisma.event.findUnique({
      where: { slug }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this event' },
        { status: 403 }
      )
    }

    // Delete the event (cascade will handle images and collaborators)
    await prisma.event.delete({
      where: { slug }
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}