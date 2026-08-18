import ai from '@/lib/gemini'
import { Type, Schema } from '@google/genai'

export interface CandidateInfo {
  name: string | null
  email: string | null
  phone: string | null
  location: string | null
  professionalSummary: string | null
  skills: string[]
  education: string[]
  experience: string[]
  projects: string[]
  certifications: string[]
  languages: string[]
  recommendedRole: string | null
  experienceLevel: string | null
  sector: string | null
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Candidate's full name" },
    email: { type: Type.STRING, description: "Candidate's email address" },
    phone: { type: Type.STRING, description: "Candidate's phone number" },
    location: { type: Type.STRING, description: "Candidate's location or address" },
    professionalSummary: { type: Type.STRING, description: "A brief summary of the candidate's professional background" },
    skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of technical and soft skills" },
    education: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of educational degrees and institutions" },
    experience: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of work experience entries" },
    projects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of notable projects" },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of certifications" },
    languages: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of spoken or programming languages" },
    recommendedRole: { type: Type.STRING, description: "Best matching job role based on experience" },
    experienceLevel: { type: Type.STRING, description: "Experience level (e.g., Junior, Mid, Senior, Lead)" },
    sector: { type: Type.STRING, description: "Best matching sector from: Medical, IT, Mechanical, Engineering, Finance, Sales, Marketing, HR, Other" }
  },
  required: ['skills', 'education', 'experience', 'projects', 'certifications', 'languages']
}

export async function analyzeResumeText(rawText: string): Promise<CandidateInfo | null> {
  const prompt = `Analyze the following resume text and extract the candidate's information into a structured JSON format. 
Make sure to extract all relevant skills, education, and experience. Determine the best matching recommendedRole, experienceLevel, and sector.

Resume Text:
${rawText}`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    })

    if (response.text) {
      const parsed = JSON.parse(response.text) as CandidateInfo
      return parsed
    }
    
    return null
  } catch (error) {
    console.error('Failed to analyze resume:', error)
    throw error
  }
}
