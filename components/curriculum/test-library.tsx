"use client";

import React from "react";
import { Input } from "@testComponents/components/ui/input";
import { Button } from "@testComponents/components/ui/button";
import { Label } from "@testComponents/components/ui/label";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import { DraggableTestItem } from "./draggable-test-item";
import { Search, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@testComponents/components/ui/select";

export function TestLibrary() {
  const {
    testLibraryFilters,
    updateTestLibraryFilters,
    getFilteredTests,
  } = useCurriculumStore();

  const filteredTests = getFilteredTests();

  const handleSearchChange = (value: string) => {
    updateTestLibraryFilters({ searchQuery: value });
  };

  const handleTypeFilter = (value: string) => {
    updateTestLibraryFilters({ type: value === "all" ? undefined : value });
  };

  const handleDifficultyFilter = (value: string) => {
    updateTestLibraryFilters({ difficulty: value === "all" ? undefined : value });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div>
          <Label htmlFor="test-search" className="text-sm font-medium">
            Search Tests
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="test-search"
              placeholder="Search by title, ID, or description..."
              value={testLibraryFilters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="test-type-filter" className="text-xs font-medium">Skill</Label>
            <Select
              value={testLibraryFilters.type || "all"}
              onValueChange={handleTypeFilter}
            >
              <SelectTrigger id="test-type-filter" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                <SelectItem value="listening">Listening</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="speaking">Speaking</SelectItem>
                <SelectItem value="grammar">Grammar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="test-difficulty-filter" className="text-xs font-medium">Level</Label>
            <Select
              value={testLibraryFilters.difficulty || "all"}
              onValueChange={handleDifficultyFilter}
            >
              <SelectTrigger id="test-difficulty-filter" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredTests.length} tests found</span>
          {(testLibraryFilters.searchQuery || testLibraryFilters.type || testLibraryFilters.difficulty) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateTestLibraryFilters({ searchQuery: "", type: undefined, difficulty: undefined })}
              className="h-6 px-2 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 space-y-2  max-h-[600px] overflow-y-auto">
        {filteredTests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {testLibraryFilters.searchQuery || testLibraryFilters.type || testLibraryFilters.difficulty
                ? "No tests match your filters"
                : "No tests available"}
            </p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <DraggableTestItem
              key={test.id}
              test={test}
            />
          ))
        )}
      </div>
    </div>
  );
}