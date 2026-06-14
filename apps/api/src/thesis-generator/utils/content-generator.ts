export interface ThesisInput {
  title: string;
  authors: string[];
  advisor: string;
  lineOfResearch: string;
  city: string;
  year: number;
  documentType: 'PROJECT' | 'REPORT';
  chapters?: ('introduction' | 'methods' | 'results' | 'discussion' | 'conclusions' | 'bibliography' | 'annexes')[];
}

export interface GeneratedContent {
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  conclusions: string;
  references: string;
  annexes: string;
}

type LlmProvider = { type: 'deepseek'; apiKey: string; model: string };

function detectProvider(): LlmProvider {
  return { type: 'deepseek', apiKey: process.env.DEEPSEEK_API_KEY || '', model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createLlm(provider: LlmProvider): Promise<any> {
  const { ChatDeepSeek } = await import('@langchain/deepseek');
  return new ChatDeepSeek({
    apiKey: provider.apiKey,
    model: provider.model,
    temperature: 0.7,
    maxTokens: 8192,
  });
}

function buildIntroductionPrompt(input: ThesisInput): string {
  return `Eres un académico experto en metodología de la investigación científica. 
Genera el CAPÍTULO I - INTRODUCCIÓN completo para un proyecto de tesis universitario.

DATOS DEL PROYECTO:
- Título: "${input.title}"
- Autor(es): ${input.authors.join(', ')}
- Asesor: ${input.advisor}
- Línea de investigación: ${input.lineOfResearch}
- Tipo: ${input.documentType === 'PROJECT' ? 'Proyecto de Tesis' : 'Informe de Proyecto de Tesis'}

REQUISITOS DEL CONTENIDO:
1. REALIDAD PROBLEMÁTICA (3-4 párrafos): Contextualización del problema a nivel global, regional y local.
2. ANTECEDENTES (4-5 párrafos): Revisión de investigaciones previas relevantes con citas APA.
3. MARCO TEÓRICO (5-6 párrafos): Incluir EXACTAMENTE 3 metodologías o enfoques teóricos estándar del área de ${input.lineOfResearch}.
4. JUSTIFICACIÓN (2-3 párrafos): Relevancia académica, social y económica.
5. PLANTEAMIENTO DEL PROBLEMA (1-2 párrafos): Pregunta de investigación principal bien formulada.
6. HIPÓTESIS (1-2 párrafos): Hipótesis nula y alternativa (o descriptivas según corresponda).
7. OBJETIVO GENERAL (1 párrafo): Objetivo general del estudio.
8. OBJETIVOS ESPECÍFICOS (listado): Mínimo 3 objetivos específicos.
9. LIMITACIONES DEL ESTUDIO (1-2 párrafos): Limitaciones identificadas.

REQUISITOS DE FORMA:
- Texto en prosa CONTINUA, SIN subtítulos internos numerados
- Cada párrafo de 150-250 palabras
- Incluir citas APA en texto con formato (Autor, Año)
- Tono formal y académico
- Mínimo 15 páginas de contenido (aproximadamente 4500-6000 palabras)
- El contenido debe ser académicamente plausible y coherente con el título y línea de investigación
- NO incluir títulos de sección como "Realidad Problemática" dentro del texto, solo fluir naturalmente de un tema a otro
- Las citas en texto deben seguir formato APA estricto

Responde ÚNICAMENTE con el HTML del capítulo, usando etiquetas <p> para cada párrafo, sin etiquetas html/body/head adicionales.`;
}

function buildReferencesPrompt(input: ThesisInput): string {
  return `Genera una lista de AL MENOS 30 referencias bibliográficas en formato APA 7ma edición EXACTO, relacionadas con el tema: "${input.title}" en la línea de investigación: ${input.lineOfResearch}.

REQUISITOS:
- Formato APA 7ma edición EXACTO con sangría francesa
- 80% de los últimos 5 años (2021-${input.year})
- 80% en idioma inglés
- 80% artículos de revistas indexadas (Scopus/WoS)
- Incluir DOI cuando exista
- Orden alfabético por apellido del primer autor
- Mínimo 30 referencias
- Temáticas relevantes al título y línea de investigación

Responde ÚNICAMENTE con una lista HTML (<ul class="references-list">) donde cada <li> sea una referencia en formato APA 7 exacto.`;
}

function buildAnnexesPrompt(input: ThesisInput): string {
  return `Genera los anexos para un proyecto de tesis titulado "${input.title}" en la línea de ${input.lineOfResearch}.

1. ÁRBOL DE PROBLEMAS: Diagrama textual jerárquico que muestre:
   - El problema central en el medio
   - Causas principales en la parte inferior
   - Efectos/consecuencias en la parte superior
   Usa caracteres ASCII para las conexiones (│, ├──, └──)

2. ÁRBOL DE OBJETIVOS: Transformación positiva del árbol de problemas
   - El objetivo central (solución) en el medio
   - Medios (transformación de causas) en la parte inferior
   - Fines (transformación de efectos) en la parte superior

Responde ÚNICAMENTE con:
<div class="annex-title">Anexo A: Árbol de Problemas</div>
<pre class="annex-tree">[árbol de problemas en ASCII]</pre>
<div class="annex-title">Anexo B: Árbol de Objetivos</div>
<pre class="annex-tree">[árbol de objetivos en ASCII]</pre>`;
}

function buildMethodsPrompt(input: ThesisInput): string {
  return `Eres un académico experto en metodología de la investigación científica.
Genera el CAPÍTULO II - MÉTODOS completo para una tesis universitaria.

DATOS DEL PROYECTO:
- Título: "${input.title}"
- Autor(es): ${input.authors.join(', ')}
- Asesor: ${input.advisor}
- Línea de investigación: ${input.lineOfResearch}

ESTRUCTURA REQUERIDA:
1. MATERIALES (2-3 párrafos introductorios)
   a. Objeto de estudio: describir el objeto o fenómeno de estudio
   b. Recursos utilizados (Personal, Bienes, Servicios, Tecnológicos)

2. MÉTODOS
   a. Tipo de investigación: según orientación/finalidad y técnica de contrastación
   b. Nivel de investigación: explicativo, descriptivo, correlacional, etc.
   c. Régimen de investigación: orientado o libre
   d. Diseño de investigación: experimental, cuasiexperimental, no experimental
   e. Población y muestra: describir población y técnica de muestreo
   f. Variables: tipo y operacionalización
   g. Método de procesamiento y análisis de datos
   h. Procedimiento: pasos secuenciales de la investigación
   i. Consideraciones éticas

REQUISITOS:
- Formato académico formal con citas APA
- Texto en prosa continua con párrafos de 150-250 palabras
- Aproximadamente 3000-4000 palabras
- Usar etiquetas <p> para cada párrafo
- Incluir <h2> para secciones principales (2.1, 2.2) y <h3> para sub-secciones

Responde ÚNICAMENTE con el HTML del capítulo, sin etiquetas html/body/head adicionales.`;
}

function buildResultsPrompt(input: ThesisInput): string {
  return `Eres un académico experto en investigación científica.
Genera el CAPÍTULO III - RESULTADOS completo para una tesis universitaria.

DATOS DEL PROYECTO:
- Título: "${input.title}"
- Autor(es): ${input.authors.join(', ')}
- Línea de investigación: ${input.lineOfResearch}

ESTRUCTURA REQUERIDA:
1. Análisis exploratorio de los datos recolectados
2. Preprocesamiento y preparación de los datos
3. Entrenamiento y evaluación de modelos o aplicación de la metodología propuesta
4. Validación de los resultados obtenidos

REQUISITOS:
- Presentar resultados de manera objetiva y descriptiva
- Incluir tablas y descripciones de hallazgos
- Mencionar métricas de evaluación relevantes al área
- Texto académico formal con párrafos de 150-250 palabras
- Aproximadamente 3000-4000 palabras
- Usar etiquetas <p> para párrafos, <h2> para secciones, <table> para tablas

Responde ÚNICAMENTE con el HTML del capítulo, sin etiquetas html/body/head adicionales.`;
}

function buildDiscussionPrompt(input: ThesisInput): string {
  return `Eres un académico experto en investigación científica.
Genera el CAPÍTULO IV - DISCUSIÓN completo para una tesis universitaria.

DATOS DEL PROYECTO:
- Título: "${input.title}"
- Autor(es): ${input.authors.join(', ')}
- Línea de investigación: ${input.lineOfResearch}

ESTRUCTURA REQUERIDA:
1. Interpretación de los resultados obtenidos
2. Comparación con estudios previos y antecedentes
3. Implicaciones teóricas y prácticas de los hallazgos
4. Limitaciones del estudio y su impacto en los resultados

REQUISITOS:
- Analizar y contrastar los resultados con la literatura existente
- Incluir citas APA comparativas
- Texto crítico y reflexivo
- Párrafos de 150-250 palabras
- Aproximadamente 2500-3500 palabras
- Usar etiquetas <p> para cada párrafo

Responde ÚNICAMENTE con el HTML del capítulo, sin etiquetas html/body/head adicionales.`;
}

function buildConclusionsPrompt(input: ThesisInput): string {
  return `Eres un académico experto en investigación científica.
Genera el CAPÍTULO V - CONCLUSIONES Y RECOMENDACIONES completo para una tesis universitaria.

DATOS DEL PROYECTO:
- Título: "${input.title}"
- Autor(es): ${input.authors.join(', ')}
- Línea de investigación: ${input.lineOfResearch}

ESTRUCTURA REQUERIDA:
1. CONCLUSIONES (5-8 conclusiones numeradas)
   - Relacionadas directamente con cada objetivo específico
   - Basadas en los resultados obtenidos
   - Redacción clara y concisa

2. RECOMENDACIONES (3-5 recomendaciones numeradas)
   - Para futuras investigaciones
   - Para la práctica profesional o institucional
   - Para mejora de la metodología

REQUISITOS:
- Cada conclusión en un párrafo independiente
- Las recomendaciones deben derivarse lógicamente de las conclusiones
- Aproximadamente 1500-2000 palabras
- Usar <h2> para "5.1 Conclusiones" y "5.2 Recomendaciones"
- Usar <p> para cada punto con formato claro

Responde ÚNICAMENTE con el HTML del capítulo, sin etiquetas html/body/head adicionales.`;
}

export class ContentGenerator {
  private provider: LlmProvider;

  constructor(deepseekKey?: string) {
    const envProvider = detectProvider();
    if (deepseekKey) {
      this.provider = { type: 'deepseek', apiKey: deepseekKey, model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' };
    } else {
      this.provider = envProvider;
    }
  }

  async generate(input: ThesisInput): Promise<GeneratedContent> {
    const selected = input.chapters ?? ['introduction', 'bibliography', 'annexes'];

    const tasks: Promise<string>[] = [];

    // Always generate these by default
    const introTask = selected.includes('introduction')
      ? this.callModel(buildIntroductionPrompt(input))
      : Promise.resolve('');

    const methodsTask = selected.includes('methods')
      ? this.callModel(buildMethodsPrompt(input))
      : Promise.resolve('');

    const resultsTask = selected.includes('results')
      ? this.callModel(buildResultsPrompt(input))
      : Promise.resolve('');

    const discussionTask = selected.includes('discussion')
      ? this.callModel(buildDiscussionPrompt(input))
      : Promise.resolve('');

    const conclusionsTask = selected.includes('conclusions')
      ? this.callModel(buildConclusionsPrompt(input))
      : Promise.resolve('');

    const referencesTask = selected.includes('bibliography')
      ? this.callModel(buildReferencesPrompt(input))
      : Promise.resolve('');

    const annexesTask = selected.includes('annexes')
      ? this.callModel(buildAnnexesPrompt(input))
      : Promise.resolve('');

    const [introduction, methods, results, discussion, conclusions, references, annexes] =
      await Promise.all([
        introTask,
        methodsTask,
        resultsTask,
        discussionTask,
        conclusionsTask,
        referencesTask,
        annexesTask,
      ]);

    return {
      introduction,
      methods,
      results,
      discussion,
      conclusions,
      references,
      annexes,
    };
  }

  private async callModel(prompt: string): Promise<string> {
    const llm = await createLlm(this.provider);
    const response = await llm.invoke(prompt);
    return response.content.toString();
  }
}
