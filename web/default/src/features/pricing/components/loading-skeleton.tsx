import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton() {
  return (
    <div className='space-y-5'>
      <div className='space-y-1.5'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-4 w-52' />
      </div>
      <Skeleton className='h-10 w-full rounded-lg' />
      <FilterBarSkeleton />
      <ListContentSkeleton />
    </div>
  )
}

function ListContentSkeleton() {
  return (
    <div className='divide-y overflow-hidden rounded-xl border'>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className='flex items-start gap-4 px-4 py-3.5'>
          <Skeleton className='size-9 shrink-0 rounded-lg' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-48' />
            <Skeleton className='h-3.5 w-full max-w-md' />
            <div className='flex gap-3'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-12' />
            </div>
          </div>
          <div className='hidden space-y-1.5 sm:block'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-16' />
          </div>
        </div>
      ))}
    </div>
  )
}

function FilterBarSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          {[80, 90, 75, 85, 70].map((width, i) => (
            <Skeleton
              key={i}
              className='h-8 rounded-lg'
              style={{ width: `${width}px` }}
            />
          ))}
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-24 rounded-lg' />
          <Skeleton className='h-8 w-20 rounded-lg' />
        </div>
      </div>
      <Skeleton className='h-5 w-24' />
    </div>
  )
}
