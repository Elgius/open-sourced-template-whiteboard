"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pen, Eraser, Type, Square, Circle, MousePointer } from "lucide-react";
import type { Tool } from "../app/whiteboard/page";

interface ToolPaletteProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  strokeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export function ToolPalette({
  currentTool,
  onToolChange,
  strokeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
}: ToolPaletteProps) {
  const tools = [
    { id: "select" as Tool, icon: MousePointer, label: "Select" },
    { id: "pen" as Tool, icon: Pen, label: "Pen" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
    { id: "text" as Tool, icon: Type, label: "Text" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
  ];

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
  ];

  const strokeWidths = [1, 2, 4, 6, 8, 12];

  return (
    <div className="flex flex-col gap-2">
      {/* Tools */}
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={currentTool === tool.id ? "default" : "ghost"}
          size="sm"
          className="w-12 h-12 p-0"
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
        </Button>
      ))}

      <Separator className="my-2" />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-5 h-5 rounded border-2 ${
              strokeColor === color ? "border-gray-800" : "border-gray-300"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={`Color: ${color}`}
          />
        ))}
      </div>

      <Separator className="my-2" />

      {/* Stroke Width */}
      <div className="flex flex-col gap-1">
        {strokeWidths.map((width) => (
          <button
            key={width}
            className={`w-12 h-6 flex items-center justify-center rounded ${
              strokeWidth === width ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
            onClick={() => onStrokeWidthChange(width)}
            title={`Stroke width: ${width}px`}
          >
            <div
              className="rounded-full bg-black"
              style={{
                width: `${Math.min(width, 8)}px`,
                height: `${Math.min(width, 8)}px`,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
