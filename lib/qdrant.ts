import { QdrantClient } from '@qdrant/js-client-rest'

const url = process.env.QDRANT_URL || 'http://localhost:6333'
const apiKey = process.env.QDRANT_API_KEY || ''

export const qdrantClient = new QdrantClient({ url, apiKey })

export const COLLECTION_NAME = 'resume_embeddings'

// 768 is the default for text-embedding-004
export const VECTOR_SIZE = 768 

export async function initQdrantCollection() {
  try {
    const collections = await qdrantClient.getCollections()
    const exists = collections.collections.some((c: any) => c.name === COLLECTION_NAME)

    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine'
        }
      })
      console.log(`Created Qdrant collection: ${COLLECTION_NAME}`)
    }
  } catch (error) {
    console.error('Failed to initialize Qdrant collection:', error)
  }
}
