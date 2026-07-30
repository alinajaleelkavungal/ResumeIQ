import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json()

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing oldName or newName' }, { status: 400 })
    }

    // Update job descriptions
    const updatedJobs = await prisma.jobDescription.updateMany({
      where: { company: oldName },
      data: { company: newName }
    })
    
    // Also update Candidates with this company
    const updatedCands = await prisma.candidate.updateMany({
      where: { company: oldName },
      data: { company: newName }
    })

    // Update Company model
    try {
      await prisma.company.update({
        where: { name: oldName },
        data: { name: newName }
      })
    } catch (e) {
      console.error("Company model update issue:", e)
    }

    return NextResponse.json({ success: true, jobsUpdated: updatedJobs.count, candidatesUpdated: updatedCands.count })
  } catch (error: any) {
    console.error('Failed to rename company:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
