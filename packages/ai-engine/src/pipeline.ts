import type { AnalysisResult, PipelineOptions } from './types.js';
import { extractText } from './extractor.js';
import { buildAnalysisPrompt, buildReferenceExtractionPrompt } from './prompts.js';
import { mockAnalyze } from './mock-analyzer.js';

export class AnalysisPipeline {
  private readonly maxGrade: number;
  private readonly openaiKey: string | undefined;
  private readonly model: string;

  constructor(options: PipelineOptions = {}) {
    this.openaiKey = options.openaiKey;
    this.maxGrade = options.maxGrade ?? 20;
    this.model = options.model ?? 'gpt-4o-mini';
  }

  async extractText(buffer: Buffer, fileType: 'pdf' | 'docx'): Promise<string> {
    return extractText(buffer, fileType);
  }

  async analyze(
    advanceText: string,
    templateSchema: object,
    templateText: string,
    advanceType: string,
  ): Promise<AnalysisResult> {
    const start = Date.now();

    if (!this.openaiKey) {
      return mockAnalyze(advanceText, this.maxGrade);
    }

    try {
      return await this.analyzeWithOpenAI(advanceText, templateSchema, templateText, advanceType, start);
    } catch (err) {
      console.warn('[AnalysisPipeline] OpenAI call failed, falling back to mock:', (err as Error).message);
      return mockAnalyze(advanceText, this.maxGrade);
    }
  }

  private async analyzeWithOpenAI(
    advanceText: string,
    templateSchema: object,
    templateText: string,
    advanceType: string,
    start: number,
  ): Promise<AnalysisResult> {
    const { ChatOpenAI } = await import('@langchain/openai');

    const llm = new ChatOpenAI({
      apiKey: this.openaiKey,
      modelName: this.model,
      temperature: 0.2,
      maxTokens: 2048,
    });

    const prompt = buildAnalysisPrompt(advanceText, templateSchema, templateText, advanceType);
    const response = await llm.invoke(prompt);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('OpenAI response did not contain valid JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      scores: { structure: number; content: number; form: number; originality: number };
      executiveSummary: string;
      findings: Array<{
        sectionRef: string;
        pageRef?: number | null;
        severity: string;
        description: string;
        correctionSteps: string;
        exampleImprovement: string;
        recommendation: string;
      }>;
    };

    const s = parsed.scores;
    const overall = Math.round(s.structure * 0.3 + s.content * 0.4 + s.form * 0.2 + s.originality * 0.1);
    const grade = parseFloat(((overall / 100) * this.maxGrade).toFixed(1));

    const validSeverities = new Set(['CRITICAL', 'MAJOR', 'MINOR', 'SUGGESTION']);

    return {
      scores: {
        structure: Math.round(Math.min(100, Math.max(0, s.structure))),
        content: Math.round(Math.min(100, Math.max(0, s.content))),
        form: Math.round(Math.min(100, Math.max(0, s.form))),
        originality: Math.round(Math.min(100, Math.max(0, s.originality))),
        overall,
      },
      grade,
      executiveSummary: parsed.executiveSummary ?? '',
      findings: (parsed.findings ?? []).map((f) => ({
        sectionRef: f.sectionRef ?? 'General',
        pageRef: f.pageRef ?? undefined,
        severity: (validSeverities.has(f.severity) ? f.severity : 'MINOR') as 'CRITICAL' | 'MAJOR' | 'MINOR' | 'SUGGESTION',
        description: f.description ?? '',
        correctionSteps: f.correctionSteps ?? '',
        exampleImprovement: f.exampleImprovement ?? '',
        recommendation: f.recommendation ?? '',
      })),
      processingMs: Date.now() - start,
    };
  }

  async extractReferences(text: string): Promise<Array<{
    rawText: string;
    title: string;
    authors: string;
    year: number | null;
    doi: string | null;
    journal: string | null;
  }>> {
    if (!this.openaiKey) {
      return [];
    }

    try {
      const { ChatOpenAI } = await import('@langchain/openai');
      const llm = new ChatOpenAI({ apiKey: this.openaiKey, modelName: this.model, temperature: 0 });
      const prompt = buildReferenceExtractionPrompt(text);
      const response = await llm.invoke(prompt);
      const content = typeof response.content === 'string' ? response.content : '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      return JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openaiKey) {
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    const { OpenAIEmbeddings } = await import('@langchain/openai');
    const embeddings = new OpenAIEmbeddings({
      apiKey: this.openaiKey,
      modelName: 'text-embedding-3-small',
    });
    return embeddings.embedQuery(text.substring(0, 8000));
  }
}
