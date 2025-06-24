"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, X } from "lucide-react";

interface SaveDialogProps {
  currentName?: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SaveDialog({
  currentName = "",
  onSave,
  onCancel,
  isLoading = false,
}: SaveDialogProps) {
  const [name, setName] = useState(currentName || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a name for your drawing");
      return;
    }

    if (trimmedName.length > 255) {
      setError("Name must be less than 255 characters");
      return;
    }

    setError("");
    onSave(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Save Drawing</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="drawing-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Drawing Name
            </label>
            <Input
              id="drawing-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyPress}
              placeholder="Enter a name for your drawing..."
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
