import prisma from '@/lib/prisma'
import CompaniesManager from './CompaniesManager'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const jobs = await prisma.jobDescription.findMany({
    select: { company: true }
  })
  
  return (
    <div className="w-full min-h-screen bg-white">
      <CompaniesManager initialJobs={jobs} />
    </div>
  )
}
