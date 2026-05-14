"use client";

import { useEffect, useRef } from "react";

interface OrbCanvasProps {
  size?: number;
}

// 밝은 배경용 AI Orb. 캔버스 기반 다층 그라데이션 + 펄스 + 회전.
// 원본 CodePen의 어두운 배경용 "lighter" 블렌드 대신 "source-over" + 톤다운 색상으로 조정.
export function OrbCanvas({ size = 200 }: OrbCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const pi = Math.PI;
    const points = 12;
    const canvasSize = size;
    const baseOrbRadius = canvasSize * 0.34;

    let currentOrbRadius = baseOrbRadius;
    let tick = 0;
    let animationId = 0;

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = canvasSize + "px";
    canvas.style.height = canvasSize + "px";
    ctx.scale(dpr, dpr);

    const center = { x: canvasSize / 2, y: canvasSize / 2 };

    function random(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    type Point = {
      x: number;
      y: number;
      radian: number;
      range: number;
      phase: number;
    };

    const circles: Point[][] = [];
    for (let idx = 0; idx < 4; idx++) {
      const swingpoints: Point[] = [];
      for (let i = 0; i < points; i++) {
        const radian = ((pi * 2) / points) * i;
        swingpoints.push({
          x: center.x + baseOrbRadius * Math.cos(radian),
          y: center.y + baseOrbRadius * Math.sin(radian),
          radian: radian,
          range: random(5, 15),
          phase: random(0, pi * 2),
        });
      }
      circles.push(swingpoints);
    }

    function createGradient(
      angle: number,
      colorStops: Array<{ position: number; color: string }>,
      x: number,
      y: number,
      radius: number
    ) {
      const angleRad = ((angle - 90) * Math.PI) / 180;
      const startX = x - Math.cos(angleRad) * radius;
      const startY = y - Math.sin(angleRad) * radius;
      const endX = x + Math.cos(angleRad) * radius;
      const endY = y + Math.sin(angleRad) * radius;
      const gradient = ctx!.createLinearGradient(startX, startY, endX, endY);
      colorStops.forEach((stop) => {
        gradient.addColorStop(stop.position / 100, stop.color);
      });
      return gradient;
    }

    function drawCurve(pts: Point[], fillStyle: CanvasGradient | string) {
      ctx!.fillStyle = fillStyle;
      ctx!.beginPath();
      ctx!.moveTo(
        (pts[pts.length - 1].x + pts[0].x) / 2,
        (pts[pts.length - 1].y + pts[0].y) / 2
      );
      for (let i = 0; i < pts.length; i++) {
        const nextIndex = (i + 1) % pts.length;
        ctx!.quadraticCurveTo(
          pts[i].x,
          pts[i].y,
          (pts[i].x + pts[nextIndex].x) / 2,
          (pts[i].y + pts[nextIndex].y) / 2
        );
      }
      ctx!.closePath();
      ctx!.fill();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // 펄스: 호흡처럼 5% 정도 크기 변화
      const breath = Math.sin(tick * 0.02);
      const pulseScale = 1 + breath * 0.05;
      currentOrbRadius = baseOrbRadius * pulseScale;

      circles.forEach((swingpoints, k) => {
        swingpoints.forEach((point) => {
          point.phase += random(1, 10) * -0.005;
          const phase = 2 * Math.sin(tick / 65);
          const baseRadius = currentOrbRadius + 3;
          const displacement = point.range * phase * Math.sin(point.phase);
          const r = Math.max(
            currentOrbRadius * 0.85,
            Math.min(baseRadius + displacement * 0.8, currentOrbRadius * 1.4)
          );
          point.radian += pi / 360;
          point.x = center.x + r * Math.cos(point.radian);
          point.y = center.y + r * Math.sin(point.radian);
        });

        // [밝은 배경 모드]
        // - source-over: 일반 합성 (밝은 배경에서 자연스럽게 겹쳐 보임)
        // - blur: 부드러운 가장자리
        // - 색상: 우리 브랜드 톤 (파랑 #0066FF, 보라 #6541F2, 핑크 #FF74BC, 청록)
        ctx.globalCompositeOperation = "source-over";
        ctx.filter = "blur(10px)";
        const opacity = 0.32;
        const gradientRadius = currentOrbRadius * 1.3;
        const gradient = createGradient(
          tick / 2 + k * 60,
          [
            { position: 0, color: "rgba(255, 255, 255, 0)" },
            { position: 25, color: `rgba(0, 102, 255, ${opacity})` },
            { position: 50, color: `rgba(101, 65, 242, ${opacity})` },
            { position: 78, color: `rgba(255, 116, 188, ${opacity * 0.55})` },
            { position: 100, color: `rgba(0, 173, 255, ${opacity * 0.45})` },
          ],
          center.x,
          center.y,
          gradientRadius
        );
        drawCurve(swingpoints, gradient);
      });

      tick++;
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [size]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
