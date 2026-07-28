import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { saveFile } from '@/lib/storage'
import { processResumeFile } from '@/services/resume-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and DOCX are allowed.' }, { status: 400 })
    }

    // Generate a unique filename
    const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Save file
    const fileUrl = await saveFile(file, uniqueFileName)

    // Placeholder: Process resume file to get raw text
    const { rawText } = await processResumeFile(fileUrl, file.type)

    // Create a Candidate record (placeholder values since AI analysis is not done yet)
    const candidateName = file.name.split('.')[0] || 'Unknown Candidate'
    
    const candidate = await prisma.candidate.create({
      data: {
        name: candidateName,
        email: null,
      }
    })

    // Create the Resume record
    const resume = await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        processingStatus: 'PENDING',
        extractedText: rawText,
      }
    })

    return NextResponse.json({
      success: true,
      candidate,
      resume
    }, { status: 201 })
  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 })
  }
}
