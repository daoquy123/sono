"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DebtListSkeleton } from "./DebtListSkeleton"

interface Debt {
  id: string
  debtor_name: string
  amount: number
  description: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

interface DebtListProps {
  debts: Debt[]
  isAdmin: boolean
  loading?: boolean
  onTogglePaid: (debt: Debt) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (debt: Debt) => void
}

export function DebtList({ debts, isAdmin, loading = false, onTogglePaid, onDelete, onEdit }: DebtListProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all")

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const matchesSearch = debt.debtor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           debt.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterStatus === "all" ||
                           (filterStatus === "paid" && debt.is_paid) ||
                           (filterStatus === "unpaid" && !debt.is_paid)
      
      return matchesSearch && matchesFilter
    })
  }, [debts, searchTerm, filterStatus])

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id)
      toast({
        title: "Thành công!",
        description: "Đã xóa khoản nợ.",
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể xóa khoản nợ. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleTogglePaid = async (debt: Debt) => {
    try {
      await onTogglePaid(debt)
      toast({
        title: "Thành công!",
        description: `Đã ${debt.is_paid ? "đánh dấu chưa trả" : "đánh dấu đã trả"} cho ${debt.debtor_name}.`,
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <DebtListSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filterStatus} onValueChange={(value: "all" | "paid" | "unpaid") => setFilterStatus(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="unpaid">Chưa trả</SelectItem>
              <SelectItem value="paid">Đã trả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Hiển thị {filteredDebts.length} trong tổng số {debts.length} khoản nợ
      </div>

      {/* Debt List */}
      {filteredDebts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            {searchTerm || filterStatus !== "all" ? (
              <div>
                <p className="text-lg font-medium">Không tìm thấy kết quả</p>
                <p className="text-sm">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">Chưa có dữ liệu nợ nào</p>
                <p className="text-sm">Bắt đầu bằng cách thêm khoản nợ mới</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((debt) => (
            <div
              key={debt.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Checkbox
                    checked={debt.is_paid}
                    onCheckedChange={() => handleTogglePaid(debt)}
                    aria-label={`Đánh dấu ${debt.debtor_name} ${debt.is_paid ? 'chưa trả' : 'đã trả'}`}
                  />
                )}
                <div>
                  <h3 className="font-medium">{debt.debtor_name}</h3>
                  {debt.description && (
                    <p className="text-sm text-gray-600">{debt.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Tạo: {new Date(debt.created_at).toLocaleDateString("vi-VN")}
                    {debt.updated_at !== debt.created_at && (
                      <span> • Cập nhật: {new Date(debt.updated_at).toLocaleDateString("vi-VN")}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-bold ${debt.is_paid ? "text-green-600" : "text-red-600"}`}>
                    {debt.amount.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <Badge variant={debt.is_paid ? "default" : "destructive"}>
                    {debt.is_paid ? "Đã trả" : "Chưa trả"}
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(debt)}
                      aria-label={`Chỉnh sửa ${debt.debtor_name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(debt.id)}
                      aria-label={`Xóa ${debt.debtor_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 