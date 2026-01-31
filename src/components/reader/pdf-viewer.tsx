"use client";

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, Maximize, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { updateReadingProgress } from "@/app/actions/library";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";

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
  const [pageWidth, setPageWidth] = useState(600);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive width calculation
  useEffect(() => {
    const calculateWidth = () => {
      const width = window.innerWidth;
      // Mobile: use almost full width with padding
      // Tablet: use 80% of width
      // Desktop: use 600px max
      if (width < 640) {
        setPageWidth(width - 32); // 16px padding on each side
      } else if (width < 1024) {
        setPageWidth(Math.min(width * 0.8, 600));
      } else {
        setPageWidth(600);
      }
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

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

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle swipe gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && pageNumber < numPages) {
      goToNextPage();
    }
    if (isRightSwipe && pageNumber > 1) {
      goToPrevPage();
    }
  };

  const actualWidth = pageWidth * scale;

  return (
    <div
      className="flex flex-col items-center bg-gray-900 min-h-screen select-none"
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile Header */}
      <header className="md:hidden w-full bg-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/library" className="text-white flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <span className="text-white text-sm font-medium">
          {pageNumber} / {numPages || '--'}
        </span>
        <button onClick={toggleFullscreen} className="text-white p-2">
          <Maximize className="w-5 h-5" />
        </button>
      </header>

      {/* PDF Container */}
      <div className="flex-1 flex items-center justify-center py-4 md:py-8 overflow-auto w-full">
        <div className="relative shadow-2xl bg-white rounded-lg overflow-hidden">
          {loading && (
            <div
              className="flex items-center justify-center bg-gray-100"
              style={{ width: pageWidth, height: pageWidth * 1.4 }}
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            </div>
          )}

          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div
                className="flex items-center justify-center bg-gray-100 text-gray-600"
                style={{ width: pageWidth, height: pageWidth * 1.4 }}
              >
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-900" />
                  <p className="text-sm">Chargement...</p>
                </div>
              </div>
            }
            error={
              <div
                className="flex items-center justify-center bg-red-50 text-red-600"
                style={{ width: pageWidth, height: pageWidth * 1.4 }}
              >
                <div className="text-center p-4">
                  <p className="font-medium">Erreur de chargement</p>
                  <p className="text-sm mt-1">Impossible de charger le fichier.</p>
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={actualWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Watermark Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-15 rotate-[-30deg]">
            <div className="text-2xl md:text-4xl font-bold text-gray-600 whitespace-nowrap">
              {userEmail}
            </div>
          </div>

          {/* Grid Watermark */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="whitespace-nowrap text-xs md:text-sm text-black mb-12 md:mb-16 transform -rotate-12">
                {userEmail} - Pensezy Edition - {userEmail}
              </div>
            ))}
          </div>

          {/* Touch areas for page navigation on mobile */}
          <div className="absolute inset-0 z-20 md:hidden flex">
            <button
              className="w-1/3 h-full opacity-0 active:opacity-10 active:bg-white"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            />
            <div className="w-1/3" /> {/* Center - no action */}
            <button
              className="w-1/3 h-full opacity-0 active:opacity-10 active:bg-white"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            />
          </div>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl px-4 py-3 items-center gap-2 z-50">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
        </Link>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5} className="rounded-full">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-gray-500 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 2} className="rounded-full">
          <ZoomIn className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <span className="font-medium text-gray-900 min-w-[80px] text-center text-sm">
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

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="rounded-full">
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 px-4 py-3 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="rounded-full text-white hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${numPages > 0 ? (pageNumber / numPages) * 100 : 0}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-1">
              Glissez pour tourner les pages
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="rounded-full text-white hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
