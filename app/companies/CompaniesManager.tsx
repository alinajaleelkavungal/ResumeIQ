'use client'

import { useState, useMemo } from 'react'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CompaniesManager({ initialJobs, initialCandidates = [], savedCompanies = [] }: { initialJobs: { company: string | null }[], initialCandidates?: { company: string | null }[], savedCompanies?: string[] }) {
  const router = useRouter()
  const [jobs, setJobs] = useState(initialJobs)
  
  const [isAddingCompany, setIsAddingCompany] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [manualCompanies, setManualCompanies] = useState<string[]>([])
  
  const [editingCompany, setEditingCompany] = useState<string | null>(null)
  const [editCompanyName, setEditCompanyName] = useState('')

  const companies = useMemo(() => {
    const counts: Record<string, number> = {}
    
    savedCompanies.forEach(name => { counts[name] = 0 })
    manualCompanies.forEach(name => { counts[name] = 0 })
    
    initialJobs.forEach(j => {
      if (j.company && j.company !== 'Unassigned') {
        counts[j.company] = (counts[j.company] || 0) + 1
      }
    })
    
    initialCandidates.forEach(c => {
      if (c.company && c.company !== 'Unassigned') {
         counts[c.company] = (counts[c.company] || 0) + 1
      }
    })
    
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }))
  }, [initialJobs, initialCandidates, manualCompanies, savedCompanies])

  const handleAddCompanySubmit = async (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const val = newCompanyName.trim();
    if (val && !companies.find(c => c.name.toLowerCase() === val.toLowerCase())) {
      setManualCompanies(prev => [...prev, val])
      setNewCompanyName('')
      setIsAddingCompany(false)
      
      try {
        await fetch('/api/company/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: val })
        })
        router.refresh()
      } catch (err) {
        console.error("Failed to add company", err)
      }
    } else {
      setNewCompanyName('')
      setIsAddingCompany(false)
    }
  }

  const handleDeleteCompany = async (companyName: string) => {
    setManualCompanies(prev => prev.filter(c => c !== companyName))
    // We don't have setJobs locally anymore since we rely on server refresh for simplicity
    // just optimism on manual

    try {
      await fetch('/api/company/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to delete company", err)
    }
  }

  const handleEditCompanySubmit = async (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const val = editCompanyName.trim();
    const oldVal = editingCompany;
    setEditingCompany(null)
    
    if (val && oldVal && val !== oldVal) {
      setManualCompanies(prev => prev.includes(oldVal) ? prev.map(c => c === oldVal ? val : c) : [...prev, val])

      try {
        await fetch('/api/company/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldName: oldVal, newName: val })
        })
        router.refresh()
      } catch (err) {
        console.error("Failed to rename company", err)
      }
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Management</h1>
        <p className="text-gray-500 mt-2">Create, rename, or delete companies and clients.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {companies.map((company) => (
          <div 
            key={company.name}
            className="group relative p-6 rounded-xl border border-gray-200 bg-white w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)]"
          >
            {editingCompany === company.name ? (
              <div className="flex flex-col h-full justify-center">
                <input 
                  autoFocus
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  onKeyDown={handleEditCompanySubmit}
                  onBlur={handleEditCompanySubmit}
                  className="w-full bg-white border border-green-300 rounded-md px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <Building2 className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-gray-900">{company.count}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 leading-tight">
                  {company.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Resumes & Jobs</p>

                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingCompany(company.name)
                      setEditCompanyName(company.name)
                    }}
                    className="p-1.5 bg-gray-50 rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-blue-500"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCompany(company.name)}
                    className="p-1.5 bg-gray-50 rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {isAddingCompany ? (
           <div className="p-6 rounded-xl border border-dashed border-green-400 bg-green-50 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)]">
              <input 
                autoFocus
                type="text"
                placeholder="New company name..."
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyDown={handleAddCompanySubmit}
                onBlur={handleAddCompanySubmit}
                className="w-full bg-white border border-green-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-3 text-center">Press Enter to save</p>
           </div>
        ) : (
          <div 
            onClick={() => setIsAddingCompany(true)}
            className="p-6 rounded-xl border border-dashed border-green-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] min-h-[120px]"
          >
            <Plus className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-500">Create New Company</span>
          </div>
        )}
      </div>
    </div>
  )
}
