"use client";

import type React from "react";

import { useRef, useEffect, useState, useCallback } from "react";
import type { DrawingElement, Tool } from "../app/whiteboard/page";

interface WhiteboardCanvasProps {
  tool: Tool;
  strokeColor: string;
  strokeWidth: number;
  elements: DrawingElement[];
  onElementsChange: (elements: DrawingElement[]) => void;
}

export function WhiteboardCanvas({
  tool,
  strokeColor,
  strokeWidth,
  elements,
  onElementsChange,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      ctx.strokeStyle = element.style.color;
      ctx.lineWidth = element.style.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (element.type) {
        case "path":
          if (element.data.points && element.data.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.data.points[0].x, element.data.points[0].y);
            element.data.points.forEach((point: { x: number; y: number }) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case "rectangle":
          if (
            element.data.x !== undefined &&
            element.data.y !== undefined &&
            element.data.width !== undefined &&
            element.data.height !== undefined
          ) {
            ctx.beginPath();
            ctx.rect(
              element.data.x,
              element.data.y,
              element.data.width,
              element.data.height
            );
            ctx.stroke();
          }
          break;
        case "circle":
          if (
            element.data.x !== undefined &&
            element.data.y !== undefined &&
            element.data.radius !== undefined
          ) {
            ctx.beginPath();
            ctx.arc(
              element.data.x,
              element.data.y,
              element.data.radius,
              0,
              2 * Math.PI
            );
            ctx.stroke();
          }
          break;
        case "text":
          if (
            element.data.text &&
            element.data.x !== undefined &&
            element.data.y !== undefined
          ) {
            ctx.font = `${element.style.strokeWidth * 8}px Arial`;
            ctx.fillStyle = element.style.color;
            ctx.fillText(element.data.text, element.data.x, element.data.y);
          }
          break;
      }
    });
  }, [elements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);

    if (tool === "pen") {
      setCurrentPath([pos]);
    } else if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newElement: DrawingElement = {
          type: "text",
          id: Date.now().toString(),
          data: { text, x: pos.x, y: pos.y },
          style: { color: strokeColor, strokeWidth },
        };
        onElementsChange([...elements, newElement]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const pos = getMousePos(e);

    if (tool === "pen") {
      setCurrentPath((prev) => [...prev, pos]);

      // Draw current path in real-time
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && currentPath.length > 0) {
        redrawCanvas();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else if (tool === "eraser") {
      // Erase elements at current position
      const eraserRadius = strokeWidth * 5;
      const remainingElements = elements.filter((element) => {
        if (element.type === "path" && element.data.points) {
          return !element.data.points.some(
            (point: { x: number; y: number }) => {
              const distance = Math.sqrt(
                Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)
              );
              return distance < eraserRadius;
            }
          );
        }
        return true;
      });

      if (remainingElements.length !== elements.length) {
        onElementsChange(remainingElements);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const pos = getMousePos(e);
    setIsDrawing(false);

    if (tool === "pen" && currentPath.length > 1) {
      const newElement: DrawingElement = {
        type: "path",
        id: Date.now().toString(),
        data: { points: [...currentPath, pos] },
        style: { color: strokeColor, strokeWidth },
      };
      onElementsChange([...elements, newElement]);
    } else if (tool === "rectangle") {
      const newElement: DrawingElement = {
        type: "rectangle",
        id: Date.now().toString(),
        data: {
          x: Math.min(startPoint.x, pos.x),
          y: Math.min(startPoint.y, pos.y),
          width: Math.abs(pos.x - startPoint.x),
          height: Math.abs(pos.y - startPoint.y),
        },
        style: { color: strokeColor, strokeWidth },
      };
      onElementsChange([...elements, newElement]);
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
      );
      const newElement: DrawingElement = {
        type: "circle",
        id: Date.now().toString(),
        data: {
          x: startPoint.x,
          y: startPoint.y,
          radius,
        },
        style: { color: strokeColor, strokeWidth },
      };
      onElementsChange([...elements, newElement]);
    }

    setCurrentPath([]);
    setStartPoint(null);
  };

  // Get cursor style based on current tool
  const getCursorClass = () => {
    switch (tool) {
      case "pen":
        return "cursor-pen";
      case "eraser":
        return "cursor-eraser";
      case "text":
        return "cursor-text";
      case "rectangle":
      case "circle":
        return "cursor-crosshair-black";
      case "select":
        return "cursor-pointer";
      default:
        return "cursor-crosshair-black";
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full bg-white ${getCursorClass()}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDrawing(false);
        setCurrentPath([]);
        setStartPoint(null);
      }}
    />
  );
}
