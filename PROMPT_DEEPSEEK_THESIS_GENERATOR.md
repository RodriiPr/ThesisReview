# PROMPT OPTIMIZADO PARA DEEPSEEK - MÓDULO GENERADOR DE PROYECTO DE TESIS

## ROL
Eres un arquitecto de software senior especializado en sistemas académicos. Debes generar código de producción completo y funcional.

## CONTEXTO TÉCNICO
```
Stack existente:
- Backend: NestJS 10 + TypeScript 5.3 (apps/api/)
- Frontend: Next.js 15 + React 19 + Tailwind CSS (apps/web/)
- ORM: Prisma 5.x con PostgreSQL
- Colas: BullMQ + Redis
- Storage: MinIO (S3-compatible)
- AI: OpenAI GPT-4 + LangChain (apps/api/src/ai-analysis/)
- Auth: JWT + Passport
```

## TAREA
Crear el módulo `thesis-generator` que permita generar automáticamente un "Proyecto de Tesis" o "Informe de Proyecto de Tesis" cumpliendo estrictamente con normas académicas.

## REQUISITOS FUNCIONALES DETALLADOS

### RF1: Entrada de Datos
- Campo de texto libre para TÍTULO de tesis
- Campos para AUTOR(ES) - array de strings
- Campo para ASESOR
- Dropdown: LÍNEA DE INVESTIGACIÓN
  * Inteligencia Artificial
  * Ciencia de Datos  
  * Ciberseguridad
  * Internet de las Cosas (IoT)
  * Blockchain
  * Energías Renovables
  * Biotecnología
  * Robótica
  * Computación Cuántica
  * Ingeniería de Software
  * Sistemas Distribuidos
  * Otra
- Campo CIUDAD
- Campo AÑO (default año actual)
- Selector: TIPO DE DOCUMENTO (Proyecto de Tesis / Informe de Proyecto)
- Selector: FORMATO DE SALIDA (PDF / Word / Ambos)

### RF2: Generación de Contenido por IA
Usar GPT-4 para generar contenido académico coherente:

**CAPÍTULO I - INTRODUCCIÓN** (mínimo 15 páginas, prosa continua SIN subtítulos internos):
- Realidad problemática (contextualización del problema)
- Antecedentes (revisión de investigaciones previas relevantes)
- Marco teórico con EXACTAMENTE 3 metodologías estándar del área
- Justificación (relevancia académica, social, económica)
- Planteamiento del problema (pregunta de investigación principal)
- Hipótesis (nula y alternativa, o descriptivas según tipo)
- Objetivo General
- Objetivos Específicos (mínimo 3)
- Limitaciones del estudio

**REFERENCIAS BIBLIOGRÁFICAS**:
- Mínimo 30 referencias
- Formato APA 7ma edición EXACTO
- 80% de los últimos 5 años (2021-2026)
- 80% en idioma inglés
- 80% artículos de revistas indexadas (Scopus/WoS)
- Incluir DOI cuando exista
- Orden alfabético por apellido del primer autor

**ANEXOS**:
- Árbol de Problemas (diagrama textual jerárquico)
- Árbol de Objetivos (transformación positiva del árbol de problemas)

### RF3: Formato del Documento (CRÍTICO - Cumplir al 100%)
```
CONFIGURACIÓN DE PÁGINA:
- Tamaño: Carta (8.5" x 11" / 21.59cm x 27.94cm)
- Márgenes: Superior 2.5cm, Inferior 2.5cm, Derecho 2.5cm, Izquierdo 3cm
- Interlineado: 1.5 líneas exacto
- Alineación: Justificada
- Fuente: Arial Narrow, 12pt
- Color de texto: Negro puro (#000000)
- Sin encabezado (header) en ninguna página
- Sin pie de página (footer) en ninguna página
- Numeración: Arábiga (1, 2, 3...) en esquina inferior derecha
- Carátula: SIN numeración
- Numeración comienza en Índice General = página 1
```

### RF4: Estructura del Documento
```
1. CARÁTULA
   - Logo institucional centrado superior
   - Nombre de Universidad (mayúsculas, centrado)
   - Facultad/Escuela (centrado)
   - Título de la tesis (negrita, centrado, mayúsculas/minúsculas)
   - "PROYECTO DE TESIS" o "INFORME DE PROYECTO DE TESIS" (centrado)
   - Autor(es) (centrado)
   - Asesor: "Dr./Mg./Ing. [Nombre]" (centrado)
   - Línea de investigación (centrado)
   - Ciudad, País - Año (centrado, inferior)

2. JURADO DICTAMINADOR
   - Tabla con: Presidente, Secretario, Vocal, Suplente
   - Nombres simulados pero realistas
   - Espacios para firmas y sellos
   - Campo editable por el usuario

3. ÍNDICE GENERAL
   - Generado automáticamente con números de página
   - Incluye todos los capítulos y secciones
   - Puntos líderes (......) entre título y número

4. ÍNDICES COMPLEMENTARIOS (opcionales)
   - Índice de Figuras
   - Índice de Tablas  
   - Índice de Anexos

5. CAPÍTULO I: INTRODUCCIÓN
   - Texto en prosa continua
   - Sin numeración de secciones internas
   - Citas en texto formato APA: (Autor, Año) o Autor (Año)
   - Párrafos de 150-250 palabras
   - Mínimo 15 páginas de contenido

6. REFERENCIAS BIBLIOGRÁFICAS
   - Título centrado: "REFERENCIAS BIBLIOGRÁFICAS"
   - Sangría francesa (hanging indent) 1.27cm
   - Espaciado doble entre entradas
   - Formato APA 7 exacto

7. ANEXOS
   - Anexo A: Árbol de Problemas
   - Anexo B: Árbol de Objetivos
   - Cada anexo en página nueva

8. DECLARACIÓN JURADA
   - Texto legal estándar de originalidad
   - Espacio para firma del autor
   - Fecha y ciudad
   - "Yo, [NOMBRE], identificado con DNI/Pasaporte [N°], declaro bajo juramento..."
```

### RF5: Exportación
- Generar PDF con formato exacto usando Puppeteer + HTML/CSS
- Generar DOCX usando docx-template o python-docx
- Almacenar en MinIO con URL pre-signed para descarga
- Retornar URLs de descarga al frontend

### RF6: Interfaz de Usuario (Next.js)
```
DISEÑO STREAMLIT-STYLE:
- Sidebar con configuración del documento
- Formulario principal centrado
- Preview en tiempo real (iframe con PDF)
- Botones de acción prominentes:
  * "Generar Proyecto de Tesis" (primario)
  * "Descargar PDF" (secundario)
  * "Descargar Word" (secundario)
- Progress bar durante generación
- Toast notifications para éxito/error
- Validación de campos en tiempo real
```

## REQUISITOS TÉCNICOS ESPECÍFICOS

### Backend NestJS:
```typescript
// Estructura de archivos a crear:
apps/api/src/thesis-generator/
├── thesis-generator.module.ts
├── thesis-generator.controller.ts
├── thesis-generator.service.ts
├── dto/
│   ├── generate-thesis.dto.ts
│   └── update-jury.dto.ts
├── entities/
│   └── thesis-document.entity.ts
├── templates/
│   ├── cover-template.html
│   ├── content-template.html
│   └── declaration-template.html
└── utils/
    ├── apa-formatter.ts
    ├── pdf-generator.ts
    └── docx-generator.ts
```

### Frontend Next.js:
```typescript
// Estructura de archivos a crear:
apps/web/app/(dashboard)/thesis-generator/
├── page.tsx                    # Página principal
├── layout.tsx                  # Layout del módulo
├── components/
│   ├── ThesisForm.tsx          # Formulario de entrada
│   ├── DocumentPreview.tsx     # Previsualización PDF
│   ├── JuryEditor.tsx          # Editor de jurado
│   ├── DownloadButtons.tsx     # Botones de descarga
│   └── GenerationProgress.tsx  # Barra de progreso
├── hooks/
│   └── useThesisGenerator.ts   # Hook de API
└── types/
    └── thesis.types.ts
```

## CÓDIGO COMPLETO REQUERIDO

Genera código de producción COMPLETO y FUNCIONAL para:
1. **Backend**: Todos los archivos NestJS con tipado estricto, validación class-validator, manejo de errores, integración con servicio AI existente
2. **Frontend**: Componentes Next.js con Server/Client components correctamente separados, Tailwind CSS, integración API
3. **Templates**: HTML/CSS para generación de PDF con formato exacto especificado
4. **Servicios**: Generación de documentos PDF/Word con las librerías apropiadas
5. **Ejemplo**: Incluir un ejemplo completo de salida generada para tema "Impacto del Machine Learning en la Detección Temprana de Cáncer de Mama"

## REGLAS DE IMPLEMENTACIÓN
- NO usar encabezados ni pies de página en el documento generado
- La numeración debe ser puramente en esquina inferior derecha
- Las citas en texto deben ser coherentes con las referencias finales
- El contenido generado por IA debe ser académicamente plausible
- Incluir comentarios explicativos en código complejo
- Manejar errores gracefully con mensajes al usuario
- Usar variables de entorno para API keys
- Implementar rate limiting en el endpoint

## FORMATO DE SALIDA ESPERADO
El código debe estar listo para copiar-pegar en el repositorio existente y funcionar sin modificaciones mayores (asumiendo que las dependencias están instaladas).
