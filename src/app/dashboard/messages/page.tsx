import { MessageSquare } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Chat with editors, creators, and brands.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={MessageSquare}
          title="Inbox is on the way"
          text="Direct messaging between buyers, creators, and editors will live here."
        />
      </div>
    </div>
  );
}
