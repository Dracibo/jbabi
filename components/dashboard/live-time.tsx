"use client";

import { useEffect, useState } from "react";

export function LiveTime() {
  const [t, setT] = useState<string>("—");
  useEffect(() => {
    const tick = () => {
      const now = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan",
      });
      setT(now);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-xs hidden md:inline" style={{ color: "var(--muted)" }}>Abidjan · CI · <span className="num">{t}</span></span>;
}
