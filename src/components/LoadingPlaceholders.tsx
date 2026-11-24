import { Skeleton } from "./ui/skeleton";

export const HeroSkeleton = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 w-fit">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
            <Skeleton className="w-full h-full rounded-full" />
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
            <Skeleton className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-10 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const FeaturedProjectsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg p-4 space-y-4 animate-pulse"
      >
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-10 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const ServicesGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 space-y-6 animate-pulse"
      >
        <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
        <div className="text-center space-y-3">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-5 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, featureIdx) => (
            <div key={featureIdx} className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const CTAFormSkeleton = () => (
  <div className="grid lg:grid-cols-2 gap-0 min-h-[560px]">
    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-12 space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-40" />
    </div>

    <div className="p-12 bg-card/90 backdrop-blur-xl space-y-6 border-l border-white/10">
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-14 rounded-xl" />
    </div>
  </div>
);

export const ProjectsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 space-y-4 animate-pulse"
      >
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
