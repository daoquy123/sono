"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DebtListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="w-[140px] h-10" />
      </div>

      {/* Results count Skeleton */}
      <Skeleton className="w-48 h-4" />

      {/* Debt items Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-48 h-3" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 