// =============================================================================
//  Doctor Payaso A.C. — Manejo de idiomas
//
//  Todo texto editable se guarda como { es: "…" } y, cuando se active el inglés,
//  como { es: "…", en: "…" }. La forma del dato ya es la definitiva: activar el
//  segundo idioma no obliga a migrar ni un solo archivo de contenido.
// =============================================================================

export const IDIOMA_POR_DEFECTO = 'es' as const;

/** Idiomas activos. Debe coincidir con astro.config.mjs y keystatic.config.ts. */
export const IDIOMAS = ['es'] as const;
//                      ^^^^ agregar 'en' en Fase 2

export type Idioma = (typeof IDIOMAS)[number] | 'en';

/** Un texto editable, tal como lo guarda Keystatic. */
export type TextoLocalizado = Partial<Record<Idioma, string | null>> | null | undefined;

/**
 * Devuelve el texto en el idioma pedido.
 *
 * Si falta la traducción, cae al español en lugar de dejar un espacio en blanco.
 * Esto es lo que permite publicar la versión en inglés de forma parcial e irla
 * completando, en vez de tener que traducir el sitio entero antes de encender
 * nada.
 */
export function t(campo: TextoLocalizado, idioma: string = IDIOMA_POR_DEFECTO): string {
  if (!campo) return '';
  const enIdioma = campo[idioma as Idioma];
  if (enIdioma) return enIdioma;
  return campo[IDIOMA_POR_DEFECTO] ?? '';
}

/** Idioma activo de la petición, con valor por defecto seguro. */
export function idiomaDe(astro: { currentLocale?: string }): Idioma {
  return (astro.currentLocale as Idioma) ?? IDIOMA_POR_DEFECTO;
}

/** Etiqueta de idioma para el atributo lang y para formatear fechas. */
export const CODIGO_COMPLETO: Record<string, string> = {
  es: 'es-MX',
  en: 'en-US',
};

/**
 * Formatea una fecha en el idioma activo.
 *
 * Se construye con componentes numéricos explícitos en lugar de
 * `new Date("2026-01-15")`, porque esa forma se interpreta como medianoche en
 * horario universal y en México muestra el día anterior.
 */
export function formatearFecha(
  fecha: string | null | undefined,
  idioma: string = IDIOMA_POR_DEFECTO,
  opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  if (!anio || !mes || !dia) return '';
  const objeto = new Date(anio, mes - 1, dia);
  return new Intl.DateTimeFormat(CODIGO_COMPLETO[idioma] ?? 'es-MX', opciones).format(objeto);
}
