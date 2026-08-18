'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, UploadCloud, ChevronRight, X, Loader2, Code, Stethoscope, Settings, Plus, FileText, ChevronDown, CheckCircle, AlertCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import UploadModal from './UploadModal'
import EditCandidateModal from './EditCandidateModal'

interface CandidateDatabaseProps {
  initialCandidates: any[]
  availableCompanies?: string[]
  savedSectors?: string[]
}

export default function CandidateDatabase({ initialCandidates, availableCompanies = [], savedSectors = [] }: CandidateDatabaseProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSector = searchParams.get('sector')

  const [candidates, setCandidates] = useState(initialCandidates)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(urlSector || null)
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  // Edit Modal State
  const [editingCandidate, setEditingCandidate] = useState<any>(null)
  
  // Sector Add States
  const [isAddingSector, setIsAddingSector] = useState(false)
  const [newSectorName, setNewSectorName] = useState('')
  const [manualSectors, setManualSectors] = useState<string[]>([])
  
  // Sector Edit States
  const [editingSector, setEditingSector] = useState<string | null>(null)
  const [editSectorName, setEditSectorName] = useState('')
  
  // Upload states
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [embedding, setEmbedding] = useState(false)
  const [progress, setProgress] = useState(0)

  // Calculate sector statistics
  const sectors = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Seed with saved sectors from DB
    savedSectors.forEach(name => {
      counts[name] = 0
    })

    // Seed with manual empty sectors (optimistic UI)
    manualSectors.forEach(name => {
      counts[name] = 0
    })

    // Count from candidates
    candidates.forEach(c => {
      const sectorToCount = c.sector || c.category // Fallback for old data
      if (sectorToCount && sectorToCount !== 'Uncategorized') {
        counts[sectorToCount] = (counts[sectorToCount] || 0) + 1
      }
    })
    
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      icon: name.toLowerCase().includes('software') || name.toLowerCase().includes('developer') ? Code :
            name.toLowerCase().includes('health') || name.toLowerCase().includes('medical') ? Stethoscope :
            name.toLowerCase().includes('mechanic') || name.toLowerCase().includes('engineer') ? Settings :
            FileText
    }))
  }, [candidates, manualSectors, savedSectors])

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.skills && c.skills.toLowerCase().includes(search.toLowerCase()))
    
    // Filter by activeCategory (which maps to sector now)
    const matchesCategory = activeCategory ? (c.sector === activeCategory || c.category === activeCategory) : true
    return matchesSearch && matchesCategory
  })

  const openUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const getStatusStyle = (status: string) => {
    if (status?.toLowerCase() === 'rejected') return 'bg-red-100 text-red-700'
    if (status?.toLowerCase().includes('interview')) return 'bg-green-100 text-green-700'
    return 'bg-green-100 text-green-700' 
  }

  // --- Sector Management Logic ---
  
  const handleAddSectorSubmit = async (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    const val = newSectorName.trim();
    if (val && !sectors.find(s => s.name.toLowerCase() === val.toLowerCase())) {
      // Optimistic
      setManualSectors(prev => [...prev, val])
      setNewSectorName('')
      setIsAddingSector(false)
      
      try {
        await fetch('/api/sector/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: val })
        })
        router.refresh()
      } catch (err) {
        console.error("Failed to add sector", err)
      }
    } else {
      setNewSectorName('')
      setIsAddingSector(false)
    }
  }

  const handleDeleteSector = async (e: React.MouseEvent, sectorName: string) => {
    e.stopPropagation()
    
    // Optimistic UI Update
    setManualSectors(prev => prev.filter(s => s !== sectorName))
    setCandidates(prev => prev.map(c => 
      (c.sector === sectorName || c.category === sectorName) ? { ...c, sector: null, category: 'Uncategorized' } : c
    ))
    if (activeCategory === sectorName) setActiveCategory(null)

    try {
      await fetch('/api/sector/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectorName })
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to delete sector", err)
    }
  }

  const startEditingSector = (e: React.MouseEvent, sectorName: string) => {
    e.stopPropagation()
    setEditingSector(sectorName)
    setEditSectorName(sectorName)
  }

  const handleEditSectorSubmit = async (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    const val = editSectorName.trim();
    const oldVal = editingSector;
    
    setEditingSector(null)
    
    if (val && oldVal && val !== oldVal) {
      // Optimistic UI Update
      setManualSectors(prev => {
        if (prev.includes(oldVal)) {
          return prev.map(s => s === oldVal ? val : s)
        } else {
          return [...prev, val]
        }
      })
      
      setCandidates(prev => prev.map(c => 
        (c.sector === oldVal || c.category === oldVal) ? { ...c, sector: val, category: val } : c
      ))
      
      if (activeCategory === oldVal) setActiveCategory(val)

      try {
        await fetch('/api/sector/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldName: oldVal, newName: val })
        })
        router.refresh()
      } catch (err) {
        console.error("Failed to rename sector", err)
      }
    }
  }

  // --- Drag and Drop Candidate Logic ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, candidateId: string) => {
    e.dataTransfer.setData("candidateId", candidateId)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() 
  }

  const handleDropToSector = async (e: React.DragEvent<HTMLDivElement>, sectorName: string) => {
    e.preventDefault()
    const candidateId = e.dataTransfer.getData("candidateId")
    if (!candidateId) return

    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, category: sectorName } : c
    ))

    try {
      await fetch('/api/candidate/update-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, category: sectorName })
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to update candidate sector", err)
    }
  }
  
  // --- Candidate Deletion & Company Assignment ---
  
  const handleDeleteCandidate = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;

    // Optimistic delete
    setCandidates(prev => prev.filter(c => c.id !== candidateId))

    try {
      await fetch('/api/candidate/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId })
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to delete candidate", err)
    }
  }

  // Removed handleCompanyChange

  return (
    <>
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={() => router.refresh()} 
      />
      <EditCandidateModal 
        isOpen={!!editingCandidate} 
        onClose={() => setEditingCandidate(null)} 
        onSuccess={() => router.refresh()} 
        candidate={editingCandidate}
      />
      <div className="p-8 max-w-5xl mx-auto h-full flex flex-col space-y-8 bg-white min-h-screen font-sans">
      
      {/* Top Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, skill, or sector" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition-all"
          />
        </div>
        <button 
          onClick={openUploadModal}
          className="flex items-center px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] rounded-lg text-white font-medium transition-colors shadow-sm"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          Upload CV
        </button>
      </div>

      {/* Upload Banner */}
      <div 
        onClick={openUploadModal}
        className="relative border-2 border-dashed border-green-300 bg-green-50/30 hover:bg-green-50 cursor-pointer rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center"
      >
        <UploadCloud className="h-8 w-8 text-green-600 mb-3" />
        <p className="text-gray-600 font-medium text-[15px]">
          Click here to upload CVs and fill Candidate Intake Forms
        </p>
      </div>



      {/* List Header */}
      <div className="flex justify-between items-end mt-4">
        <h2 className="text-lg font-bold text-gray-900">
          {activeCategory || 'All Candidates'} · {filteredCandidates.length} resumes
        </h2>
      </div>

      {/* Candidate List */}
      <div className="flex flex-col gap-3 pb-20">
        {filteredCandidates.map((candidate) => {
          const date = new Date(candidate.createdAt)
          const formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true })}`
          
          return (
            <div 
              key={candidate.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, candidate.id)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
              onClick={() => router.push(`/candidates/${candidate.id}`)}
            >
              <div 
                className="flex items-center gap-4 flex-1"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-green-700 font-semibold bg-green-100 flex-shrink-0">
                  {getInitials(candidate.name)}
                </div>

                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors">{candidate.name}</h3>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {candidate.sector && (
                      <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">{candidate.sector}</span>
                    )}
                    {candidate.category && (
                      <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">{candidate.category}</span>
                    )}
                    {candidate.yearsOfExperience && (
                      <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">{candidate.yearsOfExperience}</span>
                    )}
                    {candidate.age && (
                      <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-600">{candidate.age} yrs</span>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCandidate(candidate);
                      }}
                      className="ml-1 text-gray-400 hover:text-green-600 flex items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-4 justify-end flex-1"
              >
                {/* Removed Company Dropdown */}
                {/* Date / Time */}
                <div className="flex items-center text-gray-500 text-sm min-w-[120px]">
                  <ArrowDownCircle className="w-4 h-4 mr-1.5 text-gray-400" />
                  {formattedDate}
                </div>

                {/* Stage tag */}
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusStyle(candidate.recruitmentStage)}`}>
                    {candidate.recruitmentStage || 'New'}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                   <button 
                     onClick={(e) => handleDeleteCandidate(e, candidate.id)}
                     className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                     title="Delete Candidate"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>

              </div>
            </div>
          )
        })}

        {filteredCandidates.length === 0 && (
          <div className="text-center py-20 border border-gray-200 rounded-xl text-gray-500 bg-gray-50">
            No candidates found.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
