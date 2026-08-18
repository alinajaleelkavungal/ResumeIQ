'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Briefcase, LayoutGrid, Calendar, Home } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/candidates', icon: Home },
    { name: 'Sectors', href: '/sectors', icon: LayoutGrid },
  ]
  const bottomNavItems = [
    { name: 'Age', href: '/age', icon: Calendar },
    { name: 'Experience', href: '/experience', icon: Briefcase },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col p-4 shadow-sm">
      <div className="mb-8 px-4 mt-2">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">ResumeIQ CRM</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}


        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
