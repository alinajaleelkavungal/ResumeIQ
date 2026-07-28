import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateRagAnswer } from '@/services/rag-service'

export async function POST(request: NextRequest) {
  try {
    const { question, candidateId } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required and must be a string' }, { status: 400 })
    }

    // Call the RAG pipeline
    const ragResponse = await generateRagAnswer(question, candidateId)

    // Store conversation history asynchronously (don't await it to keep response fast)
    prisma.chatHistory.create({
      data: {
        question,
        answer: ragResponse.answer,
        candidateId: candidateId || null
      }
    }).catch(err => console.error('Failed to save chat history', err))

    return NextResponse.json(ragResponse)

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
