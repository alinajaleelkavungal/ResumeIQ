export interface ResumeChunk {
  chunkType: 'Professional Summary' | 'Skills' | 'Experience' | 'Projects' | 'Education' | 'General'
  content: string
}

export function chunkResumeText(candidateId: string, extractedText: string, aiData: any): ResumeChunk[] {
  // We can use both the AI-extracted structured data and the raw text to build high-quality chunks.
  // Using the structured JSON guarantees clean, thematic semantic separation.
  
  const chunks: ResumeChunk[] = []

  if (aiData.professionalSummary) {
    chunks.push({
      chunkType: 'Professional Summary',
      content: aiData.professionalSummary
    })
  }

  if (aiData.skills && aiData.skills.length > 0) {
    chunks.push({
      chunkType: 'Skills',
      content: `Skills: ${aiData.skills.join(', ')}`
    })
  }

  if (aiData.experience && aiData.experience.length > 0) {
    aiData.experience.forEach((exp: string) => {
      chunks.push({
        chunkType: 'Experience',
        content: exp
      })
    })
  }

  if (aiData.projects && aiData.projects.length > 0) {
    aiData.projects.forEach((proj: string) => {
      chunks.push({
        chunkType: 'Projects',
        content: proj
      })
    })
  }

  if (aiData.education && aiData.education.length > 0) {
    aiData.education.forEach((edu: string) => {
      chunks.push({
        chunkType: 'Education',
        content: edu
      })
    })
  }
  
  // Fallback if structured data is empty
  if (chunks.length === 0 && extractedText) {
    chunks.push({
      chunkType: 'General',
      content: extractedText.substring(0, 8000) // limit for embedding
    })
  }

  return chunks
}
