import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { candidateId: params.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, activities })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
