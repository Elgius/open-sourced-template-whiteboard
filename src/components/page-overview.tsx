"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Eye, Trash2, Plus } from "lucide-react";
import type { WhiteboardPage } from "../app/whiteboard/page";

interface PageOverviewProps {
  pages: WhiteboardPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onClose: () => void;
}

export function PageOverview({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onDeletePage,
  onClose,
}: PageOverviewProps) {
  const handlePageClick = (index: number) => {
    onPageChange(index);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onDeletePage(index);
  };

  return (
    <div className="w-80 bg-white border-l h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Page Overview</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {pages.map((page, index) => (
            <Card
              key={page.id}
              className={`
                p-3 cursor-pointer transition-all hover:shadow-md
                ${
                  index === currentPageIndex
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }
              `}
              onClick={() => handlePageClick(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Page {index + 1}</span>
                <div className="flex items-center gap-1">
                  {index === currentPageIndex && (
                    <Eye className="w-3 h-3 text-blue-500" />
                  )}
                  {pages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={(e) => handleDeleteClick(e, index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Thumbnail placeholder - could be enhanced with actual canvas preview */}
              <div className="w-full h-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-xs text-gray-500">
                  {page.elements.length} elements
                </div>
              </div>
            </Card>
          ))}

          {/* Add new page card */}
          <Card
            className="p-3 cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
            onClick={onAddPage}
          >
            <div className="flex items-center justify-center h-20">
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                <span className="text-xs text-gray-500">Add New Page</span>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+←/→
            </kbd>{" "}
            Navigate pages
          </div>
          <div>
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+N
            </kbd>{" "}
            New page
          </div>
          <div>
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+S
            </kbd>{" "}
            Save
          </div>
        </div>
      </div>
    </div>
  );
}
