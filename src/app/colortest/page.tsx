"use client";

import { useEffect, useState } from "react";

const COLORS = ["#FF00FF", "#00FF00", "#FF6600", "#0066FF", "#FF0066"];

export default function ColorTest() {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    // Set initial
    document.documentElement.style.backgroundColor = COLORS[0];
    document.body.style.backgroundColor = COLORS[0];

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", COLORS[0]);

    const interval = setInterval(() => {
      setColorIndex((i) => {
        const next = (i + 1) % COLORS.length;
        // Update EVERYTHING — body bg, html bg, and theme-color
        document.documentElement.style.backgroundColor = COLORS[next];
        document.body.style.backgroundColor = COLORS[next];
        const m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute("content", COLORS[next]);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: COLORS[colorIndex],
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.3s",
      // Extend into safe area
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <h1 style={{ fontSize: 48, fontWeight: "bold", color: "#000" }}>
        {COLORS[colorIndex]}
      </h1>
      <p style={{ fontSize: 24, color: "#000", marginTop: 16 }}>
        Status bar should match ☝️
      </p>
      <p style={{ fontSize: 16, color: "#333", marginTop: 8 }}>
        Cycling every 2 seconds
      </p>
    </div>
  );
}
