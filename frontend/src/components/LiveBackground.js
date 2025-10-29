import React, { useRef, useEffect } from 'react';

const LiveBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodeCount = 30;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 3 + Math.random() * 2,
    }));

    let cycle = [];
    let cycleTimer = 0;
    const cycleDuration = 2500; // ms

    const pickCycle = () => {
      // Pick 3 distinct nodes to form a visual deadlock cycle
      const idxs = new Set();
      while (idxs.size < 3) {
        idxs.add(Math.floor(Math.random() * nodeCount));
      }
      cycle = Array.from(idxs);
      cycleTimer = cycleDuration;
    };

    let lastTime = performance.now();
    const connectThreshold = 140; // px

    const draw = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      // Fade background
      ctx.fillStyle = 'rgba(10, 14, 25, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gentle gradient overlay
      const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grd.addColorStop(0, 'rgba(102, 126, 234, 0.05)');
      grd.addColorStop(1, 'rgba(118, 75, 162, 0.05)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update positions
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Draw edges
      ctx.lineWidth = 1;
      nodes.forEach((a, i) => {
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < connectThreshold) {
            const alpha = Math.max(0.08, 1 - dist / connectThreshold);
            ctx.strokeStyle = `rgba(102, 126, 234, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });

      // Occasionally show a red cycle (deadlock hint)
      if (cycleTimer > 0 && cycle.length === 3) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(244, 67, 54, 0.85)';
        const [i1, i2, i3] = cycle;
        const c1 = nodes[i1], c2 = nodes[i2], c3 = nodes[i3];
        ctx.beginPath(); ctx.moveTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c3.x, c3.y); ctx.lineTo(c1.x, c1.y); ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(244, 67, 54, 0.85)';
        ctx.font = '12px Arial';
        ctx.fillText('deadlock cycle', (c1.x + c2.x + c3.x) / 3 + 8, (c1.y + c2.y + c3.y) / 3 + 8);
        cycleTimer -= dt;
      } else if (Math.random() < 0.01) {
        pickCycle();
      }

      // Draw nodes (safe/waiting/deadlocked hint)
      nodes.forEach((n, idx) => {
        let color = 'rgba(76, 175, 80, 0.9)'; // safe
        if (cycle.includes(idx)) color = 'rgba(244, 67, 54, 0.95)'; // deadlocked
        else if (Math.random() < 0.02) color = 'rgba(255, 152, 0, 0.9)'; // waiting hint
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="live-background" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default LiveBackground;