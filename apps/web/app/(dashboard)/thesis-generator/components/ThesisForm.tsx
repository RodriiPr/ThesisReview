'use client';

import { useState } from 'react';
import { LINEAS_INVESTIGACION, THESIS_CHAPTERS, CHAPTER_LABELS, type GenerateThesisDto, type ThesisChapter } from '../types/thesis.types';

interface Props {
  onSubmit: (dto: GenerateThesisDto) => void;
  loading: boolean;
}

export default function ThesisForm({ onSubmit, loading }: Props) {
  const [title, setTitle] = useState('');
  const [authorsInput, setAuthorsInput] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [lineOfResearch, setLineOfResearch] = useState<string>(LINEAS_INVESTIGACION[0]);
  const [city, setCity] = useState('Lima');
  const [year, setYear] = useState(new Date().getFullYear());
  const [documentType, setDocumentType] = useState<'PROJECT' | 'REPORT'>('PROJECT');
  const [outputPdf, setOutputPdf] = useState(true);
  const [outputDocx, setOutputDocx] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<ThesisChapter[]>(['introduction', 'bibliography', 'annexes']);

  const toggleChapter = (ch: ThesisChapter) => {
    setSelectedChapters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const authors = authorsInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const formats: ('PDF' | 'DOCX')[] = [];
    if (outputPdf) formats.push('PDF');
    if (outputDocx) formats.push('DOCX');

    onSubmit({
      title,
      authors,
      advisor,
      lineOfResearch,
      city: city || undefined,
      year,
      documentType,
      outputFormats: formats,
      chapters: selectedChapters,
    });
  };

  const isValid = title && authorsInput && advisor && selectedChapters.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Tesis *</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          placeholder="Ingrese el título completo del proyecto de tesis"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autor(es) *</label>
          <input
            value={authorsInput}
            onChange={(e) => setAuthorsInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            placeholder="Nombres separados por coma"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Separe varios autores con coma</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asesor *</label>
          <input
            value={advisor}
            onChange={(e) => setAdvisor(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
            placeholder="Dr./Mg. Nombre Completo"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Línea de Investigación</label>
          <select
            value={lineOfResearch}
            onChange={(e) => setLineOfResearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          >
            {LINEAS_INVESTIGACION.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as 'PROJECT' | 'REPORT')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          >
            <option value="PROJECT">Proyecto de Tesis</option>
            <option value="REPORT">Informe de Proyecto</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          />
        </div>

        <div className="w-20">
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={2020}
            max={2030}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Salida</label>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
              <input type="checkbox" checked={outputPdf} onChange={(e) => setOutputPdf(e.target.checked)} className="rounded" />
              PDF
            </label>
            <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
              <input type="checkbox" checked={outputDocx} onChange={(e) => setOutputDocx(e.target.checked)} className="rounded" />
              Word
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Capítulos a generar</label>
        <div className="grid grid-cols-1 gap-1.5">
          {THESIS_CHAPTERS.map((ch) => (
            <label
              key={ch}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer hover:border-[#185FA5] transition-colors has-[:checked]:border-[#185FA5] has-[:checked]:bg-blue-50"
            >
              <input
                type="checkbox"
                checked={selectedChapters.includes(ch)}
                onChange={() => toggleChapter(ch)}
                className="rounded"
              />
              {CHAPTER_LABELS[ch]}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-[#185FA5] hover:bg-[#144d8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generando...' : 'Generar Proyecto de Tesis'}
      </button>
    </form>
  );
}
