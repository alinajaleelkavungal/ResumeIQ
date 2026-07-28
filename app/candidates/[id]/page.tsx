import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Mail, Phone, MapPin, Briefcase, Award, FolderGit2, BookOpen, UserCircle, Star, MessageCircle } from 'lucide-react'
import ChatBox from '@/components/chat/ChatBox'
import CandidateWorkflow from '@/components/CandidateWorkflow'

export default async function CandidateProfilePage({ params }: { params: { id: string } }) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
    include: { resumes: true }
  })

  if (!candidate) {
    notFound()
  }

  const parseJson = (val: string | null) => {
    try {
      return val ? JSON.parse(val) : []
    } catch {
      return []
    }
  }

  const skills = parseJson(candidate.skills)
  const education = parseJson(candidate.education)
  const experience = parseJson(candidate.experience)
  const projects = parseJson(candidate.projects)
  const certifications = parseJson(candidate.certifications)
  const languages = parseJson(candidate.languages)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-[#161616] min-h-screen text-gray-200">
      {/* Header Section */}
      <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{candidate.name}</h1>
            <div className="mt-4 space-y-2">
              {candidate.email && (
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  {candidate.email}
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  {candidate.phone}
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  {candidate.location}
                </div>
              )}
            </div>
          </div>
          <div className="text-right space-y-2">
            {candidate.recommendedRole && (
              <div className="inline-flex items-center bg-[#0F3B6A] text-blue-300 px-4 py-2 rounded-lg font-medium border border-[#164b85]">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Recommended: {candidate.recommendedRole}
              </div>
            )}
            {candidate.experienceLevel && (
              <div className="block text-gray-400 font-medium">
                Level: {candidate.experienceLevel}
              </div>
            )}
          </div>
        </div>

        {candidate.professionalSummary && (
          <div className="mt-8 pt-6 border-t border-[#333]">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <UserCircle className="w-5 h-5 mr-2 text-blue-400" />
              Professional Summary
            </h2>
            <p className="text-gray-400 leading-relaxed">{candidate.professionalSummary}</p>
          </div>
        )}
      </div>

      {/* RAG Chat specific to this candidate */}
      <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] overflow-hidden">
        <div className="bg-[#1A1A1A] border-b border-[#333] px-6 py-4 flex items-center">
          <MessageCircle className="w-5 h-5 text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-blue-300">Ask AI About {candidate.name.split(' ')[0]}</h2>
        </div>
        <div className="p-1 bg-[#161616]">
          <ChatBox candidateId={candidate.id} placeholder="e.g., Summarize this candidate's strongest skills..." />
        </div>
      </div>

      {/* Recruitment Workflow (Notes, Interviews, Timeline) */}
      <CandidateWorkflow candidateId={candidate.id} currentStage={candidate.recruitmentStage} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Experience */}
          {experience.length > 0 && (
            <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp: string, idx: number) => (
                  <div key={idx} className="border-l-2 border-[#444] pl-4 py-1">
                    <p className="text-gray-400">{exp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu: string, idx: number) => (
                  <div key={idx} className="border-l-2 border-[#444] pl-4 py-1">
                    <p className="text-gray-400">{edu}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FolderGit2 className="w-5 h-5 mr-2 text-blue-400" />
                Projects
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                {projects.map((proj: string, idx: number) => (
                  <li key={idx}>{proj}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, idx: number) => (
                  <span key={idx} className="bg-[#2A2A2A] text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-[#444]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-400" />
                Certifications
              </h2>
              <ul className="space-y-3">
                {certifications.map((cert: string, idx: number) => (
                  <li key={idx} className="text-gray-400 text-sm border-l-2 border-blue-500 pl-3">
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-[#333] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang: string, idx: number) => (
                  <span key={idx} className="bg-[#0F3B6A] text-blue-300 border border-[#164b85] px-3 py-1 rounded-lg text-sm font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
