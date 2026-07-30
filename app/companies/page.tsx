import prisma from '@/lib/prisma'
import CompaniesManager from './CompaniesManager'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const jobs = await prisma.jobDescription.findMany({
    select: { company: true }
  })
  const candidates = await prisma.candidate.findMany({
    select: { company: true }
  })
  
  const savedCompanies = await prisma.company.findMany({
    select: { name: true }
  })
  
  return (
    <div className="w-full min-h-screen bg-white">
      <CompaniesManager 
        initialJobs={jobs}
        initialCandidates={candidates} 
        savedCompanies={savedCompanies.map(c => c.name)} 
      />
    </div>
  )
}
