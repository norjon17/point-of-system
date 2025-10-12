import React, { createContext, useContext, useState } from "react"
import { useMedia } from "../hooks/media"

// Sidebar context
interface SidebarContextType {
  isSidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

// THIS CONTEXT IS WORKING FINE, PLEASE DO NOT CHANGE OTHER FUNCTION
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mediaMinMD } = useMedia()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!mediaMinMD)

  // Sync with mediaMinMD whenever it changes
  React.useEffect(() => {
    setIsSidebarOpen(!mediaMinMD)
  }, [mediaMinMD])

  const setSidebarOpen = (value: boolean) => {
    setIsSidebarOpen(value)
  }

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

// Custom hook to use sidebar context
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
