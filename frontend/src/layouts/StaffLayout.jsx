import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import StaffHeader from '../components/layout/StaffHeader'
import StaffSidebar from '../components/layout/StaffSidebar'

const StaffLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block fixed left-0 top-0 w-64 h-full bg-white shadow-sm z-30">
        <StaffSidebar />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-64 h-full bg-white shadow-lg">
            <StaffSidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content - With left margin for desktop sidebar */}
      <div className="lg:ml-64">
        <StaffHeader
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StaffLayout
