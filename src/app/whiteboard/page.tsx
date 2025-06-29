"use client";

import { useState, useEffect } from "react";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";
import { ToolPalette } from "@/components/tool-pallete";
import { DrawingManager } from "@/components/drawing-manager";
import { SaveDialog } from "@/components/save-dialog";
import { PageNavigator } from "@/components/page-navigator";
import { PageOverview } from "@/components/page-overview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, FolderOpen, Layout } from "lucide-react";

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
  data: {
    points?: { x: number; y: number }[];
    text?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
  };
  style: {
    color: string;
    strokeWidth: number;
    fill?: string;
  };
}

export interface WhiteboardPage {
  id: string;
  elements: DrawingElement[];
}

export interface WhiteboardData {
  pages: WhiteboardPage[];
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

  // Multi-page state
  const [pages, setPages] = useState<WhiteboardPage[]>([
    { id: "1", elements: [] },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [showDrawingManager, setShowDrawingManager] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPageOverview, setShowPageOverview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get current page elements
  const currentElements = pages[currentPageIndex]?.elements || [];

  // Update current page elements
  const setCurrentElements = (elements: DrawingElement[]) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        elements,
      };
      return newPages;
    });
  };

  // Page management functions
  const addNewPage = () => {
    const newPage: WhiteboardPage = {
      id: Date.now().toString(),
      elements: [],
    };
    setPages((prevPages) => [...prevPages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = (pageIndex: number) => {
    if (pages.length <= 1) return; // Don't delete the last page

    if (confirm("Are you sure you want to delete this page?")) {
      setPages((prevPages) =>
        prevPages.filter((_, index) => index !== pageIndex)
      );

      // Adjust current page index if necessary
      if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      } else if (currentPageIndex >= pages.length - 1) {
        setCurrentPageIndex(pages.length - 2);
      }
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const saveDrawing = async (drawingName: string) => {
    setIsSaving(true);
    try {
      const whiteboardData: WhiteboardData = { pages };
      const drawingData = JSON.stringify(whiteboardData);

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
        setShowSaveDialog(false);
        alert("Drawing saved successfully!");
      } else {
        throw new Error("Failed to save drawing");
      }
    } catch (error) {
      console.error("Error saving drawing:", error);
      alert("Failed to save drawing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCancel = () => {
    setShowSaveDialog(false);
  };

  const loadDrawing = (drawing: Drawing) => {
    try {
      const parsedData = JSON.parse(drawing.data);

      // Handle backward compatibility - if data is array of elements, convert to pages format
      if (Array.isArray(parsedData)) {
        const legacyElements = parsedData as DrawingElement[];
        setPages([{ id: "1", elements: legacyElements }]);
      } else {
        // New format with pages
        const whiteboardData = parsedData as WhiteboardData;
        setPages(whiteboardData.pages || [{ id: "1", elements: [] }]);
      }

      setCurrentPageIndex(0);
      setCurrentDrawing(drawing);
      setShowDrawingManager(false);
    } catch (error) {
      console.error("Error loading drawing:", error);
      alert("Failed to load drawing");
    }
  };

  const newDrawing = () => {
    setPages([{ id: "1", elements: [] }]);
    setCurrentPageIndex(0);
    setCurrentDrawing(null);
    setShowDrawingManager(false);
  };

  // Keyboard shortcuts for page navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            goToPreviousPage();
            break;
          case "ArrowRight":
            e.preventDefault();
            goToNextPage();
            break;
          case "n":
            e.preventDefault();
            addNewPage();
            break;
          case "s":
            e.preventDefault();
            handleSaveClick();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageIndex, pages.length]);

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
            <Button onClick={handleSaveClick} variant="outline" size="sm">
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
            <Button
              onClick={() => setShowPageOverview(true)}
              variant="outline"
              size="sm"
            >
              <Layout className="w-4 h-4 mr-2" />
              Pages
            </Button>
          </div>
        </div>

        {/* Page Navigation */}
        <PageNavigator
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPageChange={setCurrentPageIndex}
          onAddPage={addNewPage}
          onDeletePage={deletePage}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
        />
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
        <div className="flex-1 relative flex">
          <div className="flex-1">
            <WhiteboardCanvas
              tool={currentTool}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              elements={currentElements}
              onElementsChange={setCurrentElements}
            />
          </div>

          {/* Page Overview Sidebar */}
          {showPageOverview && (
            <PageOverview
              pages={pages}
              currentPageIndex={currentPageIndex}
              onPageChange={setCurrentPageIndex}
              onAddPage={addNewPage}
              onDeletePage={deletePage}
              onClose={() => setShowPageOverview(false)}
            />
          )}
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

      {/* Save Dialog */}
      {showSaveDialog && (
        <SaveDialog
          currentName={currentDrawing?.name || ""}
          onSave={saveDrawing}
          onCancel={handleSaveCancel}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
