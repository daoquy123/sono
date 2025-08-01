"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { useDebts } from "@/hooks/use-debts"
import { Plus, Users } from "lucide-react"
import { Header } from "@/components/debt/Header"
import { StatsCards } from "@/components/debt/StatsCards"
import { DebtList } from "@/components/debt/DebtList"
import { DebtForm } from "@/components/debt/DebtForm"

interface Debt {
  id: string
  debtor_name: string
  amount: number
  description: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  is_admin: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { debts, loading, stats, addDebt, updateDebt, togglePaidStatus, deleteDebt } = useDebts()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin người dùng",
          variant: "destructive",
        })
        return
      }

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        is_admin: profile?.is_admin || false,
      })
    } catch (error) {
      console.error("Error checking user:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi kiểm tra người dùng",
        variant: "destructive",
      })
    }
  }



  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã được đăng xuất khỏi hệ thống",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng xuất",
        variant: "destructive",
      })
    }
  }

  const handleAddDebt = async (data: { debtor_name: string; amount: string; description: string }) => {
    try {
      await addDebt({
        debtor_name: data.debtor_name,
        amount: Number.parseFloat(data.amount),
        description: data.description,
      })
    } catch (error) {
      throw error
    }
  }

  const handleUpdateDebt = async (data: { debtor_name: string; amount: string; description: string }) => {
    if (!editingDebt) return

    try {
      const { error } = await supabase
        .from("debts")
        .update({
          debtor_name: data.debtor_name,
          amount: Number.parseFloat(data.amount),
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingDebt.id)

      if (error) throw error

      setEditingDebt(null)
      await fetchDebts()
    } catch (error) {
      console.error("Error updating debt:", error)
      throw error
    }
  }

  const handleTogglePaid = async (debt: Debt) => {
    if (!user?.is_admin) return

    try {
      const { error } = await supabase
        .from("debts")
        .update({
          is_paid: !debt.is_paid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", debt.id)

      if (error) throw error
      await fetchDebts()
    } catch (error) {
      console.error("Error toggling paid status:", error)
      throw error
    }
  }

  const handleDeleteDebt = async (id: string) => {
    if (!user?.is_admin) return

    try {
      const { error } = await supabase.from("debts").delete().eq("id", id)

      if (error) throw error
      await fetchDebts()
    } catch (error) {
      console.error("Error deleting debt:", error)
      throw error
    }
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0)
  const unpaidDebt = debts.filter((debt) => !debt.is_paid).reduce((sum, debt) => sum + debt.amount, 0)
  const paidDebt = totalDebt - unpaidDebt

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards totalDebt={totalDebt} unpaidDebt={unpaidDebt} paidDebt={paidDebt} />

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Danh sách nợ
                </CardTitle>
                <CardDescription>Quản lý thông tin nợ của mọi người</CardDescription>
              </div>
              {user?.is_admin && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nợ mới
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DebtList
              debts={debts}
              isAdmin={user?.is_admin || false}
              onTogglePaid={handleTogglePaid}
              onDelete={handleDeleteDebt}
              onEdit={setEditingDebt}
            />
          </CardContent>
        </Card>

        {/* Add Debt Form */}
        <DebtForm
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={handleAddDebt}
          title="Thêm nợ mới"
          description="Nhập thông tin người nợ và số tiền"
          submitText="Thêm"
        />

        {/* Edit Debt Form */}
        <DebtForm
          open={!!editingDebt}
          onOpenChange={() => setEditingDebt(null)}
          onSubmit={handleUpdateDebt}
          initialData={
            editingDebt
              ? {
                  debtor_name: editingDebt.debtor_name,
                  amount: editingDebt.amount.toString(),
                  description: editingDebt.description,
                }
              : undefined
          }
          title="Chỉnh sửa thông tin nợ"
          description="Cập nhật thông tin khoản nợ"
          submitText="Cập nhật"
        />
      </div>
    </div>
  )
}
