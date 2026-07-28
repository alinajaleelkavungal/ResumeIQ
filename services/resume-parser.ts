import fs from 'fs'
import path from 'path'

export interface ParsedResume {
  rawText: string
  // Extend this structure as needed later
}

export async function parsePdf(fileUrl: string): Promise<ParsedResume> {
  const filePath = path.join(process.cwd(), fileUrl)
  
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found')
  }

  // Placeholder for PyMuPDF / pdf-parse logic
  // For now, returning dummy text
  const dummyText = `This is a dummy extracted text from the PDF at ${fileUrl}.
In the future, this will be replaced with actual PDF extraction logic (e.g., pdf-parse or PyMuPDF if shifted to Python).`
  
  return {
    rawText: dummyText
  }
}

export async function parseDocx(fileUrl: string): Promise<ParsedResume> {
  const filePath = path.join(process.cwd(), fileUrl)

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found')
  }

  // Placeholder for python-docx / mammoth logic
  // For now, returning dummy text
  const dummyText = `This is a dummy extracted text from the DOCX at ${fileUrl}.
In the future, this will be replaced with actual DOCX extraction logic (e.g., mammoth).`

  return {
    rawText: dummyText
  }
}

export async function processResumeFile(fileUrl: string, fileType: string): Promise<ParsedResume> {
  if (fileType === 'application/pdf') {
    return parsePdf(fileUrl)
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    fileType === 'application/msword'
  ) {
    return parseDocx(fileUrl)
  }
  
  throw new Error('Unsupported file type')
}
