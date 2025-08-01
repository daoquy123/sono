"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const debtSchema = z.object({
  debtor_name: z.string().min(1, "Tên người nợ không được để trống"),
  amount: z.string().min(1, "Số tiền không được để trống").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Số tiền phải lớn hơn 0"
  ),
  description: z.string().optional(),
})

type DebtFormData = z.infer<typeof debtSchema>

interface DebtFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: DebtFormData) => Promise<void>
  initialData?: {
    debtor_name: string
    amount: string
    description: string
  }
  title: string
  description: string
  submitText: string
}

export function DebtForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  submitText,
}: DebtFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: initialData || {
      debtor_name: "",
      amount: "",
      description: "",
    },
  })

  const handleFormSubmit = async (data: DebtFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast({
        title: "Thành công!",
        description: "Thông tin nợ đã được cập nhật.",
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="debtor_name">Tên người nợ</Label>
            <Input
              id="debtor_name"
              {...register("debtor_name")}
              placeholder="Nhập tên người nợ"
              aria-describedby="debtor_name-error"
            />
            {errors.debtor_name && (
              <p id="debtor_name-error" className="text-sm text-red-600 mt-1">
                {errors.debtor_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="amount">Số tiền (VNĐ)</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount")}
              placeholder="Nhập số tiền"
              aria-describedby="amount-error"
            />
            {errors.amount && (
              <p id="amount-error" className="text-sm text-red-600 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Mô tả về khoản nợ"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 