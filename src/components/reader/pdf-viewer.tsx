"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { updateReadingProgress } from "@/app/actions/library";
import { useDebouncedCallback } from "use-debounce";

// Worker config
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  userEmail: string;
  listingId: string;
  initialPage?: number;
}

export function PdfViewer({ url, userEmail, listingId, initialPage = 1 }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage || 1);
  const [loading, setLoading] = useState(true);

  const saveProgress = useDebouncedCallback((page: number) => {
    updateReadingProgress(listingId, page);
  }, 1000);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const changePage = (newPage: number) => {
    setPageNumber(newPage);
    saveProgress(newPage);
  };

  const goToPrevPage = () => changePage(Math.max(pageNumber - 1, 1));
  const goToNextPage = () => changePage(Math.min(pageNumber + 1, numPages));

  return (
    <div
      className="flex flex-col items-center bg-gray-50 min-h-screen py-8 select-none"
      onContextMenu={(e) => e.preventDefault()} // Disable right click
    >
      <div className="relative shadow-lg border border-gray-200 bg-white">

        {loading && (
             <div className="flex items-center justify-center w-[600px] h-[800px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
             </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
             <div className="flex items-center justify-center w-[600px] h-[800px]">
                Chargement du document...
             </div>
          }
          error={
             <div className="flex items-center justify-center w-[600px] h-[800px] text-red-500">
                Erreur lors du chargement du fichier.
             </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={600}
            renderTextLayer={false} // Disable text selection/copy
            renderAnnotationLayer={false}
            className="border-b"
          />
        </Document>

        {/* Watermark Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-20 rotate-45">
             <div className="text-4xl font-bold text-gray-500 whitespace-nowrap">
                {userEmail} • Pensezy Edition • {new Date().toLocaleDateString()}
             </div>
        </div>
         {/* Grid Watermark repeated */}
         <div className="absolute inset-0 z-10 pointer-events-none opacity-5 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="whitespace-nowrap text-sm text-black mb-16 transform -rotate-12">
                     {userEmail} - Propriété exclusive - Ne pas distribuer - {userEmail}
                </div>
            ))}
         </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50">
        <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="rounded-full"
        >
            <ChevronLeft className="w-5 h-5" />
        </Button>

        <span className="font-medium text-gray-900 min-w-[80px] text-center">
            {pageNumber} / {numPages || '--'}
        </span>

        <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="rounded-full"
        >
            <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
