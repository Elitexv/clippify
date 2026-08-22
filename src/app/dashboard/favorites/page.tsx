import { Heart } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Favorites</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Clips and creators you&apos;ve saved for later.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={Heart}
          title="No favorites yet"
          text="Tap the heart icon on any clip or creator profile to save it here."
        />
      </div>
    </div>
  );
}
