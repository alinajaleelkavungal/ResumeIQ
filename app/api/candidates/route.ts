import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, candidates })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
