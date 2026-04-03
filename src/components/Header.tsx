"use client";

interface HeaderProps {
  artistCount: number;
}

export default function Header({ artistCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink text-paper border-b-[3px] border-accent">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight">
              Konstrundan{" "}
              <span className="text-accent">&rsquo;26</span>
            </h1>
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-warm">
              Östra Skåne &middot; 3–12 april
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs text-warm">
            <span className="text-accent text-lg font-bold">{artistCount}</span>{" "}
            konstnärer
          </div>
        </div>
      </div>
    </header>
  );
}
