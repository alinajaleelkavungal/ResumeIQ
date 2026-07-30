import prisma from '@/lib/prisma'
import SectorsManager from './SectorsManager'

export const dynamic = 'force-dynamic'

export default async function SectorsPage() {
  const candidates = await prisma.candidate.findMany({
    select: { category: true }
  })
  
  const savedSectors = await prisma.sector.findMany({
    select: { name: true }
  })
  
  return (
    <div className="w-full min-h-screen bg-white">
      <SectorsManager 
        initialCandidates={candidates} 
        savedSectors={savedSectors.map(s => s.name)} 
      />
    </div>
  )
}
