'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-muted rounded-md", className)} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      {/* Hero Card Skeleton */}
      <Skeleton className="h-64 w-full rounded-[32px]" />

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Accounts Carousel Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="min-w-[280px] h-48 rounded-[40px]" />
          ))}
        </div>
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-[32px]" />
        <Skeleton className="h-64 rounded-[32px]" />
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32 md:pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-5 w-24 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccountsSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32 md:pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-56 rounded-[32px]" />
        ))}
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32 md:pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((section) => (
          <div key={section} className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
