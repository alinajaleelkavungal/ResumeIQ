'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [embedding, setEmbedding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
    setMessage(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    }
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setMessage(null)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('file', files[i])

      try {
        const res = await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const data = await res.json()
          
          setAnalyzing(true)
          // Call analyze
          await fetch('/api/resume/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId: data.resume.id })
          })

          setAnalyzing(false)
          setEmbedding(true)
          // Call embed
          await fetch('/api/resume/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId: data.resume.id })
          })

          successCount++
        } else {
          errorCount++
        }
      } catch (err) {
        errorCount++
      }
      
      setEmbedding(false)
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setUploading(false)
    setAnalyzing(false)
    setEmbedding(false)
    if (errorCount === 0) {
      setMessage({ type: 'success', text: `Successfully uploaded ${successCount} resume(s)!` })
      setFiles([])
      // Redirect to candidates after a short delay
      setTimeout(() => router.push('/candidates'), 2000)
    } else {
      setMessage({ type: 'error', text: `Uploaded ${successCount} successfully, but ${errorCount} failed.` })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Resumes</h1>
        <p className="text-gray-500 mt-2">Upload candidate resumes (PDF or DOCX) to automatically extract their profile.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Drag & drop files here</h3>
        <p className="text-sm text-gray-500 mt-2">or click to browse from your computer</p>
        <p className="text-xs text-gray-400 mt-4">Supported formats: PDF, DOCX (Max 10MB per file)</p>
      </div>

      {files.length > 0 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-4">Selected Files ({files.length})</h4>
          <ul className="space-y-3">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={uploading}
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>

          {(uploading || analyzing || embedding) && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2 text-gray-600 font-medium">
                <span>
                  {embedding ? 'Creating Vector Embeddings...' : 
                   analyzing ? 'AI Analyzing Resume...' : 
                   'Uploading Resume...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={uploadFiles}
              disabled={uploading || analyzing || embedding}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {uploading || analyzing || embedding ? 'Processing...' : 'Upload & Process Resumes'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}
    </div>
  )
}
