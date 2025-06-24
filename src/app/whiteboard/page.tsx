"use client";

import { useState } from "react";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";
import { ToolPalette } from "@/components/tool-pallete";
import { DrawingManager } from "@/components/drawing-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, FolderOpen } from "lucide-react";

export interface Drawing {
  id: string;
  name: string;
  data: string;
  created_at: string;
  updated_at: string;
}

export interface DrawingElement {
  type: "path" | "text" | "rectangle" | "circle";
  id: string;
  data: any;
  style: {
    color: string;
    strokeWidth: number;
    fill?: string;
  };
}

export type Tool =
  | "pen"
  | "eraser"
  | "text"
  | "rectangle"
  | "circle"
  | "select";

export default function WhiteboardApp() {
  const [currentTool, setCurrentTool] = useState<Tool>("pen");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [showDrawingManager, setShowDrawingManager] = useState(false);

  const saveDrawing = async () => {
    try {
      const drawingData = JSON.stringify(elements);
      const drawingName =
        currentDrawing?.name || `Drawing ${new Date().toLocaleString()}`;

      const response = await fetch("/api/drawings", {
        method: currentDrawing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentDrawing?.id,
          name: drawingName,
          data: drawingData,
        }),
      });

      if (response.ok) {
        const savedDrawing = await response.json();
        setCurrentDrawing(savedDrawing);
        alert("Drawing saved successfully!");
      }
    } catch (error) {
      console.error("Error saving drawing:", error);
      alert("Failed to save drawing");
    }
  };

  const loadDrawing = (drawing: Drawing) => {
    try {
      const parsedElements = JSON.parse(drawing.data);
      setElements(parsedElements);
      setCurrentDrawing(drawing);
      setShowDrawingManager(false);
    } catch (error) {
      console.error("Error loading drawing:", error);
      alert("Failed to load drawing");
    }
  };

  const newDrawing = () => {
    setElements([]);
    setCurrentDrawing(null);
    setShowDrawingManager(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            {currentDrawing?.name || "Untitled Whiteboard"}
          </h1>
          <div className="flex gap-2">
            <Button onClick={newDrawing} variant="outline" size="sm">
              New
            </Button>
            <Button onClick={saveDrawing} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={() => setShowDrawingManager(true)}
              variant="outline"
              size="sm"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Open
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Tool Palette */}
        <div className="w-16 bg-white border-r p-2">
          <ToolPalette
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            strokeColor={strokeColor}
            onColorChange={setStrokeColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <WhiteboardCanvas
            tool={currentTool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            elements={elements}
            onElementsChange={setElements}
          />
        </div>
      </div>

      {/* Drawing Manager Modal */}
      {showDrawingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 p-6">
            <DrawingManager
              onLoadDrawing={loadDrawing}
              onClose={() => setShowDrawingManager(false)}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
