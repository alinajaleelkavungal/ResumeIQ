import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json()

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing oldName or newName' }, { status: 400 })
    }

    const updated = await prisma.candidate.updateMany({
      where: { category: oldName },
      data: { category: newName }
    })

    return NextResponse.json({ success: true, count: updated.count })
  } catch (error: any) {
    console.error('Failed to rename sector:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
