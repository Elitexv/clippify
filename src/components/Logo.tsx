import Image from "next/image";

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-lg ${className}`}>
      <Image
        src="/android-chrome-192x192.png"
        alt=""
        fill
        sizes="48px"
        className="object-cover"
      />
    </span>
  );
}
