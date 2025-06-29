"use client";

import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { WhiteboardPage } from "../app/whiteboard/page";

interface PageNavigatorProps {
  pages: WhiteboardPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function PageNavigator({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onDeletePage,
  onPreviousPage,
  onNextPage,
}: PageNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Navigation arrows */}
      <Button
        onClick={onPreviousPage}
        disabled={currentPageIndex === 0}
        variant="outline"
        size="sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        onClick={onNextPage}
        disabled={currentPageIndex === pages.length - 1}
        variant="outline"
        size="sm"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Page indicator */}
      <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
        Page {currentPageIndex + 1} of {pages.length}
      </span>

      {/* Page thumbnails - show only if more than 3 pages */}
      {pages.length > 3 && (
        <div className="flex items-center gap-1 ml-2">
          <ScrollArea className="w-40">
            <div className="flex gap-1">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => onPageChange(index)}
                  className={`
                    min-w-8 h-6 text-xs rounded border flex items-center justify-center
                    ${
                      index === currentPageIndex
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Add page button */}
      <Button onClick={onAddPage} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1 hover:cursor-pointer" />
        Add Page
      </Button>

      {/* Delete page button - only show if more than 1 page */}
      {pages.length > 1 && (
        <Button
          onClick={() => onDeletePage(currentPageIndex)}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
