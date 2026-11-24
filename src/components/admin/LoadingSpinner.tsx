import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay' | 'card';
}

export default function LoadingSpinner({ 
  message = 'جاري التحميل...', 
  size = 'md', 
  variant = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    default: 'flex items-center justify-center gap-3 p-4',
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50',
    card: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-8 shadow-2xl'
  };

  const messageSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={containerClasses[variant]}>
      <div className="relative">
        {/* Main spinner */}
        <Loader2 
          className={`${sizeClasses[size]} text-blue-400 animate-spin`}
        />
        
        {/* Glow effect */}
        <div className={`
          absolute inset-0 ${sizeClasses[size]} 
          bg-gradient-to-r from-blue-500 to-cyan-500 
          rounded-full blur-lg opacity-50 animate-pulse
        `} />
        
        {/* Outer ring */}
        <div className={`
          absolute inset-0 ${sizeClasses[size]} 
          border-2 border-blue-500/30 border-t-transparent 
          rounded-full animate-spin
          animation-delay-150
        `} />
      </div>
      
      {message && (
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className={`${messageSizeClasses[size]} text-blue-300 font-medium animate-pulse`}>
            {message}
          </span>
        </div>
      )}
    </div>
  );
}

// Loading skeleton components for different content types
export function ProjectCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 animate-pulse">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -skew-x-12 animate-shimmer" />
      
      {/* Header skeleton */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-700/50 rounded w-3/4" />
          <div className="h-4 bg-slate-700/30 rounded w-full" />
        </div>
        <div className="w-24 h-20 bg-slate-700/50 rounded-lg" />
      </div>
      
      {/* Badges skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-6 bg-slate-700/50 rounded px-3 w-20" />
        <div className="h-6 bg-slate-700/30 rounded px-3 w-16" />
      </div>
      
      {/* Technologies skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-slate-700/50 rounded w-16" />
        <div className="flex gap-2">
          <div className="h-5 bg-slate-700/30 rounded px-2 w-12" />
          <div className="h-5 bg-slate-700/30 rounded px-2 w-16" />
          <div className="h-5 bg-slate-700/30 rounded px-2 w-14" />
        </div>
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-2 pt-4 border-t border-slate-700/50">
        <div className="h-8 bg-slate-700/50 rounded flex-1" />
        <div className="h-8 bg-slate-700/30 rounded flex-1" />
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 animate-pulse">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -skew-x-12 animate-shimmer" />
      
      {/* Header skeleton */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-700/50 rounded w-3/4" />
          <div className="h-4 bg-slate-700/30 rounded w-full" />
        </div>
      </div>
      
      {/* Categories skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-6 bg-slate-700/50 rounded px-3 w-20" />
        <div className="h-6 bg-slate-700/30 rounded px-3 w-16" />
      </div>
      
      {/* Price skeleton */}
      <div className="mb-6">
        <div className="h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-lg" />
      </div>
      
      {/* Features skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-slate-700/50 rounded w-16" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/30 rounded w-full" />
          <div className="h-4 bg-slate-700/30 rounded w-5/6" />
          <div className="h-4 bg-slate-700/30 rounded w-4/5" />
        </div>
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-2 pt-4 border-t border-slate-700/50">
        <div className="h-8 bg-slate-700/50 rounded flex-1" />
        <div className="h-8 bg-slate-700/30 rounded flex-1" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-8 animate-pulse">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -skew-x-12 animate-shimmer" />
      
      {/* Header skeleton */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 bg-slate-700/50 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-slate-700/50 rounded w-3/4" />
          <div className="h-5 bg-slate-700/30 rounded w-1/2" />
        </div>
      </div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-slate-700/20 border border-slate-600/30 rounded-xl">
            <div className="h-8 bg-slate-700/50 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-700/30 rounded w-full" />
          </div>
        ))}
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-4">
        <div className="h-10 bg-slate-700/50 rounded px-4 w-20" />
        <div className="h-10 bg-slate-700/30 rounded px-4 w-16" />
        <div className="h-10 bg-slate-700/30 rounded px-4 w-16" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-lg">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-slate-700/50 rounded" />
        ))}
      </div>
      
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-lg animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-slate-700/30 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
