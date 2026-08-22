import { Upload } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Video</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Turn your raw footage into clips buyers can license.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={Upload}
          title="Upload flow is on the way"
          text="Drag-and-drop uploads, auto-generated thumbnails, and pricing tools will live here."
        />
      </div>
    </div>
  );
}
