import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET /api/events - Get all events for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } }
        ]
      },
      include: {
        images: true,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      events
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const { name, ownerId } = await request.json()

    if (!name || !ownerId) {
      return NextResponse.json(
        { success: false, error: 'Name and owner ID are required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    
    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug }
    })

    if (existingEvent) {
      // Add timestamp to make it unique
      const uniqueSlug = `${slug}-${Date.now()}`
      const event = await prisma.event.create({
        data: {
          name,
          slug: uniqueSlug,
          ownerId,
          isPublic: true
        }
      })
      return NextResponse.json({ success: true, event })
    }

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        ownerId,
        isPublic: true
      }
    })

    return NextResponse.json({
      success: true,
      event
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}