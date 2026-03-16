import { Suspense } from "react";
import TrackResultClient from "./TrackResultClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackResultPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-medium animate-pulse">
              Verifying authenticity…
            </p>
          </div>
        </div>
      }
    >
      <TrackResultClient id={decodeURIComponent(id)} />
    </Suspense>
  );
}
