"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface Debt {
  id: string
  debtor_name: string
  amount: number
  description: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      
      setDebts(data || [])
    } catch (err) {
      console.error("Error fetching debts:", err)
      setError("Không thể tải danh sách nợ")
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nợ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const addDebt = useCallback(async (debtData: {
    debtor_name: string
    amount: number
    description: string
  }) => {
    try {
      // Optimistic update
      const optimisticDebt: Debt = {
        id: `temp-${Date.now()}`,
        ...debtData,
        is_paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      setDebts(prev => [optimisticDebt, ...prev])

      const { data, error } = await supabase
        .from("debts")
        .insert([debtData])
        .select()
        .single()

      if (error) throw error

      // Replace optimistic update with real data
      setDebts(prev => prev.map(debt => 
        debt.id === optimisticDebt.id ? data : debt
      ))

      toast({
        title: "Thành công!",
        description: "Đã thêm khoản nợ mới",
      })

      return data
    } catch (err) {
      // Revert optimistic update on error
      setDebts(prev => prev.filter(debt => !debt.id.startsWith('temp-')))
      
      console.error("Error adding debt:", err)
      toast({
        title: "Lỗi",
        description: "Không thể thêm khoản nợ",
        variant: "destructive",
      })
      throw err
    }
  }, [supabase, toast])

  const updateDebt = useCallback(async (id: string, updates: {
    debtor_name: string
    amount: number
    description: string
  }) => {
    try {
      // Optimistic update
      setDebts(prev => prev.map(debt => 
        debt.id === id 
          ? { ...debt, ...updates, updated_at: new Date().toISOString() }
          : debt
      ))

      const { error } = await supabase
        .from("debts")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Thành công!",
        description: "Đã cập nhật thông tin nợ",
      })
    } catch (err) {
      // Revert optimistic update on error
      await fetchDebts()
      
      console.error("Error updating debt:", err)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin nợ",
        variant: "destructive",
      })
      throw err
    }
  }, [supabase, toast, fetchDebts])

  const togglePaidStatus = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setDebts(prev => prev.map(debt => 
        debt.id === id 
          ? { ...debt, is_paid: !debt.is_paid, updated_at: new Date().toISOString() }
          : debt
      ))

      const { error } = await supabase
        .from("debts")
        .update({
          is_paid: !debts.find(d => d.id === id)?.is_paid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      const debt = debts.find(d => d.id === id)
      if (debt) {
        toast({
          title: "Thành công!",
          description: `Đã ${debt.is_paid ? "đánh dấu chưa trả" : "đánh dấu đã trả"} cho ${debt.debtor_name}`,
        })
      }
    } catch (err) {
      // Revert optimistic update on error
      await fetchDebts()
      
      console.error("Error toggling paid status:", err)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
      throw err
    }
  }, [supabase, toast, fetchDebts, debts])

  const deleteDebt = useCallback(async (id: string) => {
    try {
      const debtToDelete = debts.find(d => d.id === id)
      
      // Optimistic update
      setDebts(prev => prev.filter(debt => debt.id !== id))

      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Thành công!",
        description: "Đã xóa khoản nợ",
      })
    } catch (err) {
      // Revert optimistic update on error
      await fetchDebts()
      
      console.error("Error deleting debt:", err)
      toast({
        title: "Lỗi",
        description: "Không thể xóa khoản nợ",
        variant: "destructive",
      })
      throw err
    }
  }, [supabase, toast, fetchDebts, debts])

  // Calculate statistics
  const stats = {
    totalDebt: debts.reduce((sum, debt) => sum + debt.amount, 0),
    unpaidDebt: debts.filter(debt => !debt.is_paid).reduce((sum, debt) => sum + debt.amount, 0),
    paidDebt: debts.filter(debt => debt.is_paid).reduce((sum, debt) => sum + debt.amount, 0),
    totalCount: debts.length,
    unpaidCount: debts.filter(debt => !debt.is_paid).length,
    paidCount: debts.filter(debt => debt.is_paid).length,
  }

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  return {
    debts,
    loading,
    error,
    stats,
    fetchDebts,
    addDebt,
    updateDebt,
    togglePaidStatus,
    deleteDebt,
  }
} 