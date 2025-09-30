import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// POST /api/events/[slug]/collaborators - Add a collaborator to an event
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { userEmail, requesterId } = await request.json()

    if (!userEmail || !requesterId) {
      return NextResponse.json(
        { success: false, error: 'User email and requester ID are required' },
        { status: 400 }
      )
    }

    // Check if event exists and requester is the owner
    const event = await prisma.event.findUnique({
      where: { slug }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.ownerId !== requesterId) {
      return NextResponse.json(
        { success: false, error: 'Only event owner can add collaborators' },
        { status: 403 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already a collaborator
    const existingCollaborator = await prisma.eventCollaborator.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id
        }
      }
    })

    if (existingCollaborator) {
      return NextResponse.json(
        { success: false, error: 'User is already a collaborator' },
        { status: 400 }
      )
    }

    // Add collaborator
    await prisma.eventCollaborator.create({
      data: {
        eventId: event.id,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Collaborator added successfully'
    })
  } catch (error) {
    console.error('Error adding collaborator:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add collaborator' },
      { status: 500 }
    )
  }
}