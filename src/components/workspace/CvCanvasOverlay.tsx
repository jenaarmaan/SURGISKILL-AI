import React, { useRef, useEffect } from 'react';
import { CVTrackingFrame } from '../../types/index.ts';

interface CvCanvasOverlayProps {
  frame: CVTrackingFrame | null;
  width?: number;
  height?: number;
  showKinematics?: boolean;
  showWoundLandmarks?: boolean;
  showNeedlePose?: boolean;
  isCalibrating?: boolean;
  onCalibrationClick?: (x: number, y: number) => void;
}

export const CvCanvasOverlay: React.FC<CvCanvasOverlayProps> = ({
  frame,
  width = 800,
  height = 500,
  showKinematics = true,
  showWoundLandmarks = true,
  showNeedlePose = true,
  isCalibrating = false,
  onCalibrationClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear overlay
    ctx.clearRect(0, 0, width, height);

    if (!frame) return;

    // 1. Draw Calibrated Grid if calibrating
    if (isCalibrating) {
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.2)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 2. Draw Wound Incision & Landmarks
    if (showWoundLandmarks && frame.detections.incisionVector) {
      const [[x1, y1], [x2, y2]] = frame.detections.incisionVector;
      const sx1 = x1 * width;
      const sy1 = y1 * height;
      const sx2 = x2 * width;
      const sy2 = y2 * height;

      // Incision midline
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();

      // Wound margin boundary box
      if (frame.detections.woundBoundingBox) {
        const [bx, by, bw, bh] = frame.detections.woundBoundingBox;
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(bx * width, by * height, bw * width, bh * height);
        ctx.setLineDash([]);

        // Label
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#14b8a6';
        ctx.fillText('WOUND MARGIN (50mm Incision)', bx * width, by * height - 6);
      }

      // Millimeter tick marks along incision
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      const numTicks = 10;
      for (let i = 0; i <= numTicks; i++) {
        const tx = sx1 + (sx2 - sx1) * (i / numTicks);
        const ty = sy1 + (sy2 - sy1) * (i / numTicks);
        ctx.beginPath();
        ctx.moveTo(tx, ty - 4);
        ctx.lineTo(tx, ty + 4);
        ctx.stroke();
      }
    }

    // 3. Draw Needle Pose & Arc
    if (showNeedlePose && frame.detections.needleTip) {
      const [nx, ny] = frame.detections.needleTip;
      const tipX = nx * width;
      const tipY = ny * height;

      // Needle Tip Point
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair on needle tip
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tipX - 10, tipY);
      ctx.lineTo(tipX + 10, tipY);
      ctx.moveTo(tipX, tipY - 10);
      ctx.lineTo(tipX, tipY + 10);
      ctx.stroke();

      // Needle Arc Curvature visualization
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tipX + 18, tipY + 12, 22, Math.PI * 1.1, Math.PI * 1.9, false);
      ctx.stroke();

      // Grasp Point Fraction label
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#bae6fd';
      ctx.fillText(`NEEDLE TIP (Grasp: 67%)`, tipX + 14, tipY - 8);
    }

    // 4. Draw Instrument Driver Position
    if (frame.detections.driverJawPosition) {
      const [dx, dy] = frame.detections.driverJawPosition;
      const jx = dx * width;
      const jy = dy * height;

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(jx, jy, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText('NEEDLE DRIVER', jx + 12, jy + 4);
    }

    // 5. Draw Bite Width Caliper if active
    if (
      showKinematics &&
      frame.liveMeasurements.entryBiteWidthMm &&
      frame.detections.activeEntryMarker
    ) {
      const [ex, ey] = frame.detections.activeEntryMarker;
      const px = ex * width;
      const py = ey * height;
      const incisionY = (frame.detections.incisionVector ? frame.detections.incisionVector[0][1] : 0.5) * height;

      // Caliper measurement bracket
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, incisionY);
      ctx.stroke();

      // Horizontal bracket caps
      ctx.beginPath();
      ctx.moveTo(px - 5, py);
      ctx.lineTo(px + 5, py);
      ctx.moveTo(px - 5, incisionY);
      ctx.lineTo(px + 5, incisionY);
      ctx.stroke();

      // Measurement tag
      const biteMm = frame.liveMeasurements.entryBiteWidthMm;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(px + 8, py - 4, 75, 18);
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = '#052e16';
      ctx.fillText(`${biteMm.toFixed(1)} mm BITE`, px + 12, py + 9);
    }

    // 6. Draw Entry Angle Indicator if present
    if (frame.liveMeasurements.needleEntryAngleDeg && frame.detections.needleTip) {
      const [nx, ny] = frame.detections.needleTip;
      const tx = nx * width;
      const ty = ny * height;
      const angle = frame.liveMeasurements.needleEntryAngleDeg;

      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = angle >= 80 && angle <= 100 ? '#4ade80' : '#f87171';
      ctx.fillText(`ANGLE: ${angle.toFixed(1)}° (Target: 90°)`, tx - 45, ty - 22);
    }
  }, [frame, width, height, showKinematics, showWoundLandmarks, showNeedlePose, isCalibrating]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCalibrating || !onCalibrationClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onCalibrationClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleCanvasClick}
      className={`absolute inset-0 h-full w-full pointer-events-auto ${
        isCalibrating ? 'cursor-crosshair' : 'cursor-default'
      }`}
    />
  );
};
