import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Missing company name' }, { status: 400 })
    }

    const newCompany = await prisma.company.create({
      data: { name }
    })

    return NextResponse.json({ success: true, company: newCompany })
  } catch (error: any) {
    // Ignore unique constraint violation if they add a company that already exists
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Company already exists' })
    }
    console.error('Failed to add company:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
