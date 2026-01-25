"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export function ProductFilters() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`/marketplace?${params.toString()}`);
  }, 300);

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type && type !== "all") {
        params.set("type", type);
    } else {
        params.delete("type");
    }
    replace(`/marketplace?${params.toString()}`);
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      {/* Search */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un livre, un auteur..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("q")?.toString()}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        <button
            onClick={() => handleTypeChange("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!searchParams.get("type") ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
            Tous
        </button>
        <button
            onClick={() => handleTypeChange("physical")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${searchParams.get("type") === 'physical' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
            Livres Physiques
        </button>
        <button
            onClick={() => handleTypeChange("digital")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${searchParams.get("type") === 'digital' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
            E-books
        </button>
      </div>
    </div>
  );
}
