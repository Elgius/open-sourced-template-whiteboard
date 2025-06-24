"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, X } from "lucide-react";
import type { Drawing } from "../app/whiteboard/page";

interface DrawingManagerProps {
  onLoadDrawing: (drawing: Drawing) => void;
  onClose: () => void;
}

export function DrawingManager({
  onLoadDrawing,
  onClose,
}: DrawingManagerProps) {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const response = await fetch("/api/drawings");
      if (response.ok) {
        const data = await response.json();
        setDrawings(data);
      }
    } catch (error) {
      console.error("Error fetching drawings:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDrawing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drawing?")) return;

    try {
      const response = await fetch(`/api/drawings?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDrawings(drawings.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Error deleting drawing:", error);
    }
  };

  const filteredDrawings = drawings.filter((drawing) =>
    drawing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Open Drawing</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Search drawings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <ScrollArea className="h-64">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredDrawings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No drawings found" : "No drawings saved yet"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDrawings.map((drawing) => (
              <div
                key={drawing.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onLoadDrawing(drawing)}
                >
                  <div className="font-medium">{drawing.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(drawing.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteDrawing(drawing.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
