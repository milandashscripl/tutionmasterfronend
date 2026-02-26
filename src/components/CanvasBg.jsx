import { useRef, useEffect } from "react";

export default function CanvasBg({ style }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = canvas.clientWidth);
    let h = (canvas.height = canvas.clientHeight);

    const chips = [];
    const colors = ["#f7e9c9", "#e9d7b7", "#d6c89f", "#f1e6d0"];

    for (let i = 0; i < 18; i++) {
      chips.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 6 + Math.random() * 18,
        vx: -0.3 + Math.random() * 0.6,
        vy: -0.3 + Math.random() * 0.6,
        c: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let raf;

    const onResize = () => {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    };

    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      chips.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r);
        g.addColorStop(0, "rgba(255,255,255,0.02)");
        g.addColorStop(0.4, p.c + "cc");
        g.addColorStop(1, p.c + "88");
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="auth-canvas" style={style} />;
}
