'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, UploadCloud, ChevronRight, X, Loader2, Code, Stethoscope, Settings, Plus, FileText, ChevronDown, CheckCircle, AlertCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'

interface CandidateDatabaseProps {
  initialCandidates: any[]
}

export default function CandidateDatabase({ initialCandidates }: CandidateDatabaseProps) {
  const router = useRouter()
  const [candidates, setCandidates] = useState(initialCandidates)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
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
    
    // Seed with manual empty sectors
    manualSectors.forEach(name => {
      counts[name] = 0
    })

    // Count from candidates
    candidates.forEach(c => {
      if (c.category && c.category !== 'Uncategorized') {
        counts[c.category] = (counts[c.category] || 0) + 1
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
  }, [candidates, manualSectors])

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.skills && c.skills.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeCategory ? (c.category || 'Uncategorized') === activeCategory : true
    return matchesSearch && matchesCategory
  })

  // Upload Logic
  const onDropFile = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setProgress(0)

    for (let i = 0; i < acceptedFiles.length; i++) {
      const formData = new FormData()
      formData.append('file', acceptedFiles[i])

      try {
        const res = await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const data = await res.json()
          
          setAnalyzing(true)
          await fetch('/api/resume/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId: data.resume.id })
          })

          setAnalyzing(false)
          setEmbedding(true)
          await fetch('/api/resume/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId: data.resume.id })
          })

        }
      } catch (err) {
        console.error("Upload failed", err)
      }
      
      setEmbedding(false)
      setProgress(Math.round(((i + 1) / acceptedFiles.length) * 100))
    }

    setUploading(false)
    setAnalyzing(false)
    setEmbedding(false)
    setProgress(0)
    
    setTimeout(() => {
      window.location.reload()
    }, 1000)

  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onDropFile,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    }
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const getStatusStyle = (status: string) => {
    if (status?.toLowerCase() === 'rejected') return 'bg-red-100 text-red-700'
    if (status?.toLowerCase().includes('interview')) return 'bg-green-100 text-green-700'
    return 'bg-green-100 text-green-700' 
  }

  // --- Sector Management Logic ---
  
  const handleAddSectorSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    const val = newSectorName.trim();
    if (val && !sectors.find(s => s.name.toLowerCase() === val.toLowerCase())) {
      setManualSectors(prev => [...prev, val])
    }
    setNewSectorName('')
    setIsAddingSector(false)
  }

  const handleDeleteSector = async (e: React.MouseEvent, sectorName: string) => {
    e.stopPropagation()
    
    // Optimistic UI Update
    setManualSectors(prev => prev.filter(s => s !== sectorName))
    setCandidates(prev => prev.map(c => 
      c.category === sectorName ? { ...c, category: 'Uncategorized' } : c
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
        c.category === oldVal ? { ...c, category: val } : c
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

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col space-y-8 bg-white min-h-screen font-sans">
      
      {/* Top Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Search by name, skill, or sector" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-[#2a2a2a] border-none rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none shadow-sm text-sm"
          />
        </div>
        <button 
          onClick={open}
          className="flex items-center px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] rounded-lg text-white font-medium transition-colors shadow-sm"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          Upload CV
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center ${
          isDragActive ? 'border-green-500 bg-green-50' : 'border-green-300 bg-green-50/30'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploading || analyzing || embedding ? (
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2 text-green-800 font-medium">
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {embedding ? 'Creating Vector Embeddings...' : 
                 analyzing ? 'AI Analyzing Resume...' : 
                 'Uploading...'}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-green-600 mb-3" />
            <p className="text-gray-600 font-medium text-[15px]">
              Drag & drop CVs here, or click Upload — AI will read and sort them into a sector automatically
            </p>
          </>
        )}
      </div>

      {/* Sectors */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sectors</h2>
        <div className="flex flex-wrap gap-4">
          {sectors.map((sector) => (
            <div 
              key={sector.name}
              onClick={() => {
                if (editingSector !== sector.name) {
                  setActiveCategory(activeCategory === sector.name ? null : sector.name)
                }
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropToSector(e, sector.name)}
              className={`group relative p-5 rounded-xl border cursor-pointer transition-colors w-full sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] min-w-[200px] ${
                activeCategory === sector.name 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-[#F9FAF9] border-green-100 hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              
              {editingSector === sector.name ? (
                <div className="flex flex-col h-full justify-center">
                  <input 
                    autoFocus
                    type="text"
                    value={editSectorName}
                    onChange={(e) => setEditSectorName(e.target.value)}
                    onKeyDown={handleEditSectorSubmit}
                    onBlur={handleEditSectorSubmit}
                    className="w-full bg-white border border-green-300 rounded-md px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <sector.icon className="w-6 h-6 text-green-600 pointer-events-none" />
                    <span className="text-2xl font-bold text-gray-900 pointer-events-none">{sector.count}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 leading-tight pointer-events-none">
                    {sector.name}
                  </h3>

                  {/* Edit / Delete Icons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => startEditingSector(e, sector.name)}
                      className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-blue-500"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteSector(e, sector.name)}
                      className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isAddingSector ? (
             <div className="p-5 rounded-xl border border-dashed border-green-400 bg-green-50 w-full sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] min-w-[200px]">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Sector name..."
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  onKeyDown={handleAddSectorSubmit}
                  onBlur={handleAddSectorSubmit}
                  className="w-full bg-white border border-green-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <p className="text-[10px] text-gray-500 mt-2 text-center">Press Enter to save</p>
             </div>
          ) : (
            <div 
              onClick={() => setIsAddingSector(true)}
              className="p-5 rounded-xl border border-dashed border-green-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors w-full sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] min-w-[200px]"
            >
              <Plus className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-500">Add sector</span>
            </div>
          )}
        </div>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-end mt-4">
        <h2 className="text-lg font-bold text-gray-900">
          {activeCategory || 'All Candidates'} · {filteredCandidates.length} resumes
        </h2>
        
        <div className="relative min-w-[200px]">
          <div className="flex items-center justify-between w-full pl-4 pr-3 py-2 bg-[#2a2a2a] rounded-lg text-gray-300 text-sm cursor-pointer">
            <span>Sort: Newest</span>
            <ChevronDown className="w-4 h-4 text-green-600" />
          </div>
        </div>
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
            >
              <div 
                className="flex items-center gap-4 flex-1"
                onClick={() => router.push(`/candidates/${candidate.id}`)}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-green-700 font-semibold bg-green-100 flex-shrink-0">
                  {getInitials(candidate.name)}
                </div>

                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors">{candidate.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="text-gray-400">Auto-tagged:</span>
                    <span className="font-medium text-gray-700">{candidate.category || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-8 justify-end flex-1"
                onClick={() => router.push(`/candidates/${candidate.id}`)}
              >
                <div className="flex items-center text-gray-500 text-sm min-w-[120px]">
                  <ArrowDownCircle className="w-4 h-4 mr-1.5 text-gray-400" />
                  {formattedDate}
                </div>

                <div className="text-sm italic text-gray-500 min-w-[150px] max-w-[200px] truncate hidden md:block">
                  "{candidate.professionalSummary ? candidate.professionalSummary.substring(0, 30) + '...' : 'Candidate profile'}"
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusStyle(candidate.recruitmentStage)}`}>
                    {candidate.recruitmentStage || 'New'}
                  </span>
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
  )
}
