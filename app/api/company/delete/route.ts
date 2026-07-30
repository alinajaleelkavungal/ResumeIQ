import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: 'Missing companyName' }, { status: 400 })
    }

    const updatedJobs = await prisma.jobDescription.updateMany({
      where: { company: companyName },
      data: { company: null }
    })
    
    const updatedCands = await prisma.candidate.updateMany({
      where: { company: companyName },
      data: { company: null }
    })

    try {
      await prisma.company.delete({
        where: { name: companyName }
      })
    } catch (e) {
      console.error("Company model delete issue:", e)
    }

    return NextResponse.json({ success: true, jobsUpdated: updatedJobs.count, candidatesUpdated: updatedCands.count })
  } catch (error: any) {
    console.error('Failed to delete company:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
