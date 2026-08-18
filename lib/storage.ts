import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function saveFile(file: File, uniqueFileName: string): Promise<string> {
  const filePath = path.join(UPLOAD_DIR, uniqueFileName)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  fs.writeFileSync(filePath, buffer)
  
  // Return the file path or URL
  return `/uploads/${uniqueFileName}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const fileName = path.basename(fileUrl)
  const filePath = path.join(UPLOAD_DIR, fileName)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}
