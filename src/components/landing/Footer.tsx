import { Globe, Play } from "lucide-react";

const columns = [
  {
    title: "Marketplace",
    links: ["Browse Clips", "Hire Editors", "Collections", "Popular Creators"],
  },
  {
    title: "For Creators",
    links: ["Become a Clipper", "Creator Dashboard", "Resources", "Payouts"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Licenses"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] pt-16 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500">
                <Play className="h-4 w-4 fill-black text-black" />
              </span>
              <span className="text-lg font-semibold text-white">Clippifi</span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              The marketplace for premium video clips and top video editors.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[TikTokIcon, InstagramIcon, YoutubeIcon, XIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-400/40 hover:text-yellow-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 transition-colors duration-200 hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 py-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-500">© 2026 Clippifi. All rights reserved.</p>
          <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-white">
            <Globe className="h-4 w-4" /> English
          </button>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 2.2c2.7 0 3 0 4 .1 1 0 1.7.2 2 .4a4 4 0 0 1 1.5 1 4 4 0 0 1 1 1.4c.2.4.4 1 .4 2.1.1 1 .1 1.3.1 4s0 3-.1 4c0 1-.2 1.7-.4 2a4 4 0 0 1-1 1.5 4 4 0 0 1-1.5 1c-.3.2-1 .4-2 .4-1.1.1-1.4.1-4 .1s-3 0-4-.1c-1 0-1.7-.2-2-.4a4 4 0 0 1-1.5-1 4 4 0 0 1-1-1.5c-.2-.3-.4-1-.4-2-.1-1-.1-1.3-.1-4s0-3 .1-4c0-1 .2-1.7.4-2a4 4 0 0 1 1-1.5 4 4 0 0 1 1.5-1c.3-.1 1-.3 2-.4 1-.1 1.3-.1 4-.1zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"
      />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M10 15l5.19-3L10 9v6zm11-3c0 2.5-.3 4-.3 4a2.9 2.9 0 0 1-2 2s-2.7.3-6.7.3-6.7-.3-6.7-.3a2.9 2.9 0 0 1-2-2s-.3-1.5-.3-4 .3-4 .3-4a2.9 2.9 0 0 1 2-2S8 5.7 12 5.7s6.7.3 6.7.3a2.9 2.9 0 0 1 2 2s.3 1.5.3 4z"
      />
    </svg>
  );
}
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M16.6 5.82a4.28 4.28 0 0 1-3.14-3.66h-3.1v13.44a2.6 2.6 0 1 1-1.83-2.48V9.9a5.9 5.9 0 1 0 5 5.82V9.5a7.5 7.5 0 0 0 4 1.17V7.57a4.3 4.3 0 0 1-1-1.75z"
      />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M18.9 2H22l-7.5 8.6L23 22h-7l-5.4-6.7L4.4 22H1.3l8-9.2L1 2h7.2l4.9 6.2L18.9 2zm-1.2 18h1.7L7.4 4H5.6l12.1 16z"
      />
    </svg>
  );
}
