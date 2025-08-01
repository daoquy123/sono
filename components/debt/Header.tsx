"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, DollarSign } from "lucide-react"

interface User {
  id: string
  email: string
  is_admin: boolean
}

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Quản lý nợ</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={user?.is_admin ? "default" : "secondary"}>
              {user?.is_admin ? "Admin" : "User"}
            </Badge>
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 