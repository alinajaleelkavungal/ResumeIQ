import ai from '@/lib/gemini'

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: 'embedding-001',
      contents: text
    })
    
    // The response returns an array of embeddings, usually we just need the first one
    if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
      return response.embeddings[0].values
    }
    
    throw new Error('No embedding values returned')
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}
