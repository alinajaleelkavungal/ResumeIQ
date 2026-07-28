import prisma from '@/lib/prisma'
import SectorsManager from './SectorsManager'

export const dynamic = 'force-dynamic'

export default async function SectorsPage() {
  const candidates = await prisma.candidate.findMany({
    select: { category: true }
  })
  
  return (
    <div className="w-full min-h-screen bg-white">
      <SectorsManager initialCandidates={candidates} />
    </div>
  )
}
