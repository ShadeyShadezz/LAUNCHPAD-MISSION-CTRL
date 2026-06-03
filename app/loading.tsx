import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="lmc-page flex items-center justify-center">
      <div className="lmc-surface px-10 py-12 flex flex-col items-center gap-4 text-center">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="text-lg font-semibold text-foreground">Verifying Mission Credentials...</span>
      </div>
    </div>
  );
}
