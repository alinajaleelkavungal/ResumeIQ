import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json()

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing oldName or newName' }, { status: 400 })
    }

    const updated = await prisma.jobDescription.updateMany({
      where: { company: oldName },
      data: { company: newName }
    })

    return NextResponse.json({ success: true, count: updated.count })
  } catch (error: any) {
    console.error('Failed to rename company:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
