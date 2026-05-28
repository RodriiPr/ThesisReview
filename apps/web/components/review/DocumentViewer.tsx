'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerProps {
  advanceId: string;
}

export function DocumentViewer({ advanceId }: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<{ numPages: number; getPage: (n: number) => Promise<unknown> } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: previewData, isLoading } = useQuery({
    queryKey: ['advance-preview-url', advanceId],
    queryFn: () => apiClient.get(`/advances/${advanceId}/preview-url`).then((r) => r.data),
  });

  useEffect(() => {
    if (!previewData?.url) return;

    let isMounted = true;
    interface PdfJsLib {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (url: string) => {
        promise: Promise<{
          numPages: number;
          getPage: (n: number) => Promise<unknown>;
        }>;
      };
    }

    const loadPdf = async () => {
      try {
        const win = window as unknown as {
          pdfjsLib?: PdfJsLib;
          'pdfjs-dist/build/pdf'?: PdfJsLib;
        };
        const pdfjsLib = win.pdfjsLib || win['pdfjs-dist/build/pdf'];
        
        if (!pdfjsLib) {
          return new Promise<PdfJsLib>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
              const lib = win.pdfjsLib;
              if (lib) {
                lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(lib);
              }
            };
            document.head.appendChild(script);
          });
        }

        if (pdfjsLib.GlobalWorkerOptions.workerSrc !== 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const loadingTask = pdfjsLib.getDocument(previewData.url);
        const doc = await loadingTask.promise;
        
        if (isMounted) {
          setPdfDoc(doc as { numPages: number; getPage: (n: number) => Promise<unknown> });
          setTotalPages(doc.numPages);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
    return () => { isMounted = false; };
  }, [previewData?.url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || isRendering) return;

    const renderPage = async () => {
      setIsRendering(true);
      const page = (await pdfDoc.getPage(currentPage)) as {
        getViewport: (opts: { scale: number }) => { height: number; width: number };
        render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: { height: number; width: number } }) => { promise: Promise<void> };
      };
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
      setIsRendering(false);
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, isRendering]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Cargando documento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-600 min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 ml-1">{Math.round(scale * 100)}%</span>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`/api/advances/${advanceId}/download`}
            className="text-xs text-[#185FA5] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Descargar
          </a>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center p-4 relative">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        <canvas ref={canvasRef} className="shadow-lg" />
      </div>
    </div>
  );
}
