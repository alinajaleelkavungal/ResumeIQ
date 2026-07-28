import prisma from '@/lib/prisma'
import CandidateDatabase from '@/components/CandidateDatabase'

export const dynamic = 'force-dynamic'

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { resumes: true }
  })

  return (
    <div className="w-full min-h-screen bg-white">
      <CandidateDatabase initialCandidates={candidates} />
    </div>
  )
}
