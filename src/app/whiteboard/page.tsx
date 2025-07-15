"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";
import { ToolPalette } from "@/components/tool-pallete";
import { DrawingManager } from "@/components/drawing-manager";
import { SaveDialog } from "@/components/save-dialog";
import { PageNavigator } from "@/components/page-navigator";
import { PageOverview } from "@/components/page-overview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save, FolderOpen, Layout, X } from "lucide-react";

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

  // Autosave state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<"open" | "addPage" | null>(
    null
  );
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

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

  // Check for unsaved changes before performing an action
  const checkUnsavedChanges = (action: "open" | "addPage") => {
    if (hasUnsavedChanges()) {
      setPendingAction(action);
      setShowSaveWarning(true);
      return false;
    }
    return true;
  };

  // Page management functions
  const addNewPage = () => {
    if (!checkUnsavedChanges("addPage")) return;

    executeAddNewPage();
  };

  const executeAddNewPage = () => {
    const newPage: WhiteboardPage = {
      id: Date.now().toString(),
      elements: [],
    };
    setPages((prevPages) => [...prevPages, newPage]);
    setCurrentPageIndex(pages.length);

    // Autosave when creating and switching to new page
    if (currentDrawing) {
      autoSave();
    }

    // Track activity for the page switch
    trackActivity();
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
      // Autosave before switching pages
      if (currentDrawing) {
        autoSave();
      }
      setCurrentPageIndex(currentPageIndex - 1);
      trackActivity();
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      // Autosave before switching pages
      if (currentDrawing) {
        autoSave();
      }
      setCurrentPageIndex(currentPageIndex + 1);
      trackActivity();
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

  // Helper function to check if there's content worth saving
  const hasContent = useCallback(() => {
    return pages.some((page) => page.elements.length > 0);
  }, [pages]);

  // Helper function to check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!hasContent()) return false;

    // If we have content but no current drawing, it's unsaved
    if (!currentDrawing) return true;

    // If we have a current drawing, check if content has changed since last save
    // This is a simplified check - in a real app you might want to track dirty state more precisely
    return hasContent();
  }, [hasContent, currentDrawing]);

  // Autosave function - saves existing drawings or prompts for name if untitled
  const autoSave = useCallback(async () => {
    if (isSaving || isAutoSaving) {
      return;
    }

    // If we have a current drawing, save it
    if (currentDrawing) {
      setIsAutoSaving(true);
      try {
        const whiteboardData: WhiteboardData = { pages };
        const drawingData = JSON.stringify(whiteboardData);

        const response = await fetch("/api/drawings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentDrawing.id,
            name: currentDrawing.name,
            data: drawingData,
          }),
        });

        if (response.ok) {
          const updatedDrawing = await response.json();
          setCurrentDrawing(updatedDrawing);
          setLastAutoSave(new Date());
        } else {
          console.error("Autosave failed:", response.statusText);
        }
      } catch (error) {
        console.error("Autosave error:", error);
      } finally {
        setIsAutoSaving(false);
      }
    } else if (hasContent() && !showNamePrompt && !showSaveDialog) {
      // If we have content but no saved drawing, prompt user to name it
      setShowNamePrompt(true);
    }
  }, [
    currentDrawing,
    pages,
    isSaving,
    isAutoSaving,
    hasContent,
    showNamePrompt,
    showSaveDialog,
  ]);

  // Track user activity and reset inactivity timer
  const trackActivity = useCallback(() => {
    lastActivityRef.current = new Date();

    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for 2 minutes of inactivity
    autosaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2 * 60 * 1000); // 2 minutes
  }, [autoSave]);

  const handleSaveCancel = () => {
    setShowSaveDialog(false);
    // Clear pending action if user cancels save dialog
    if (pendingAction) {
      setPendingAction(null);
    }
  };

  const handleNamePromptSave = async (drawingName: string) => {
    setShowNamePrompt(false);
    await saveDrawing(drawingName);
  };

  const handleSaveDialogComplete = async (drawingName: string) => {
    await saveDrawing(drawingName);

    // If there was a pending action after save, proceed with it
    if (pendingAction) {
      const actionToProceed = pendingAction;
      setPendingAction(null);

      if (actionToProceed === "open") {
        setShowDrawingManager(true);
      } else if (actionToProceed === "addPage") {
        executeAddNewPage();
      }
    }
  };

  const handleNamePromptCancel = () => {
    setShowNamePrompt(false);
    // Reset the activity timer since user declined to name the drawing
    trackActivity();
  };

  const handleOpenClick = () => {
    if (!checkUnsavedChanges("open")) return;

    setShowDrawingManager(true);
  };

  const handleSaveWarningResponse = async (
    action: "save" | "continue" | "cancel"
  ) => {
    if (action === "cancel") {
      setShowSaveWarning(false);
      setPendingAction(null);
      return;
    }

    if (action === "save") {
      // Try to save first
      if (currentDrawing) {
        try {
          await autoSave();
          // After successful autosave, proceed with the pending action
          const actionToProceed = pendingAction;
          setShowSaveWarning(false);
          setPendingAction(null);

          if (actionToProceed === "open") {
            setShowDrawingManager(true);
          } else if (actionToProceed === "addPage") {
            executeAddNewPage();
          }
          return;
        } catch (error) {
          console.error("Error saving drawing:", error);
          alert("Failed to save drawing");
          return;
        }
      } else {
        // If no current drawing, show save dialog
        // Close the warning dialog and show save dialog
        setShowSaveWarning(false);
        setShowSaveDialog(true);
        return; // Don't proceed yet, wait for save dialog completion
      }
    }

    // Proceed with the pending action (for "continue" action)
    const actionToProceed = pendingAction;
    setShowSaveWarning(false);
    setPendingAction(null);

    if (actionToProceed === "open") {
      setShowDrawingManager(true);
    } else if (actionToProceed === "addPage") {
      executeAddNewPage();
    }
  };

  const loadDrawing = async (drawing: Drawing) => {
    try {
      // Autosave current drawing before switching
      if (currentDrawing) {
        await autoSave();
      }

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

      // Start activity tracking for the new drawing
      trackActivity();
    } catch (error) {
      console.error("Error loading drawing:", error);
      alert("Failed to load drawing");
    }
  };

  const newDrawing = async () => {
    // Autosave current drawing before creating new one
    if (currentDrawing) {
      await autoSave();
    }

    setPages([{ id: "1", elements: [] }]);
    setCurrentPageIndex(0);
    setCurrentDrawing(null);
    setShowDrawingManager(false);

    // Clear autosave timer since we don't have a drawing to save
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
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

      // Track any keyboard activity
      trackActivity();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageIndex, pages.length, trackActivity]);

  // Track activity when elements change (drawing/editing)
  useEffect(() => {
    if (currentElements.length > 0) {
      trackActivity();
    }
  }, [currentElements, trackActivity]);

  // Track activity when tool/color/stroke changes
  useEffect(() => {
    trackActivity();
  }, [currentTool, strokeColor, strokeWidth, trackActivity]);

  // Track activity when switching pages
  useEffect(() => {
    trackActivity();
  }, [currentPageIndex, trackActivity]);

  // Initialize activity tracking when component mounts or drawing changes
  useEffect(() => {
    if (currentDrawing) {
      trackActivity();
    } else {
      // Clear timer when no drawing is loaded
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    }
  }, [currentDrawing, trackActivity]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Name Prompt Dialog Component
  const NamePromptDialog = () => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSave = () => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setError("Please enter a name for your whiteboard");
        return;
      }

      if (trimmedName.length > 255) {
        setError("Name must be less than 255 characters");
        return;
      }

      setError("");
      handleNamePromptSave(trimmedName);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleNamePromptCancel();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Name Required</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNamePromptCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Please give your whiteboard a name to enable autosave.
              </p>
              <label
                htmlFor="whiteboard-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Whiteboard Name
              </label>
              <Input
                id="whiteboard-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyPress}
                placeholder="Enter a name for your whiteboard..."
                disabled={isSaving}
                autoFocus
              />
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleNamePromptCancel}
                disabled={isSaving}
              >
                Skip
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Enable Autosave
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Save Warning Dialog Component
  const SaveWarningDialog = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-orange-600">
                Unsaved Changes
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                You have unsaved changes that will be lost if you continue. What
                would you like to do?
              </p>
            </div>

            <div className="flex gap-2 justify-end flex-col">
              <Button
                variant="outline"
                onClick={() => handleSaveWarningResponse("continue")}
                disabled={isSaving}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Continue Without Saving
              </Button>
              <Button
                onClick={() => handleSaveWarningResponse("save")}
                // disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              {currentDrawing?.name || "Untitled Whiteboard"}
            </h1>
            {/* Autosave status indicator */}
            {currentDrawing && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {isAutoSaving ? (
                  <span className="text-blue-600">Saving...</span>
                ) : lastAutoSave ? (
                  <span>Last saved: {lastAutoSave.toLocaleTimeString()}</span>
                ) : null}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={newDrawing} variant="outline" size="sm">
              New
            </Button>
            <Button onClick={handleSaveClick} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleOpenClick} variant="outline" size="sm">
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
          onSave={pendingAction ? handleSaveDialogComplete : saveDrawing}
          onCancel={handleSaveCancel}
          isLoading={isSaving}
        />
      )}

      {/* Name Prompt Dialog for Autosave */}
      {showNamePrompt && <NamePromptDialog />}

      {/* Save Warning Dialog */}
      {showSaveWarning && <SaveWarningDialog />}
    </div>
  );
}
