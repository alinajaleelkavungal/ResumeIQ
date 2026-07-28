import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: 'Missing companyName' }, { status: 400 })
    }

    const updated = await prisma.jobDescription.updateMany({
      where: { company: companyName },
      data: { company: null }
    })

    return NextResponse.json({ success: true, count: updated.count })
  } catch (error: any) {
    console.error('Failed to delete company:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
