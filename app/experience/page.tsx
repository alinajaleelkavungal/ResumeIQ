import prisma from '@/lib/prisma'
import ExperienceGroupList from './ExperienceGroupList'

export const dynamic = 'force-dynamic'

export default async function ExperiencePage() {
  // Use raw SQL to bypass the outdated Prisma Client which drops newly added columns
  const candidatesRaw = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM Candidate ORDER BY createdAt DESC`)
  
  const candidates = candidatesRaw.map(c => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt)
  }))
  
  return (
    <div className="w-full min-h-screen bg-white">
      <ExperienceGroupList initialCandidates={candidates} />
    </div>
  )
}
