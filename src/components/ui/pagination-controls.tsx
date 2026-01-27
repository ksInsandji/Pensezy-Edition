"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function PaginationControls({ totalCount, pageSize }: { totalCount: number, pageSize: number }) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      <Link href={createPageURL(currentPage - 1)} aria-disabled={currentPage <= 1} className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}>
        <Button variant="outline" size="icon" disabled={currentPage <= 1}>
            <ChevronLeft className="w-4 h-4" />
        </Button>
      </Link>

      <span className="text-sm text-gray-600 font-medium">
        Page {currentPage} sur {totalPages}
      </span>

      <Link href={createPageURL(currentPage + 1)} aria-disabled={currentPage >= totalPages} className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}>
        <Button variant="outline" size="icon" disabled={currentPage >= totalPages}>
            <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
