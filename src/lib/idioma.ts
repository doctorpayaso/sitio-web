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
 * Normaliza una fecha a texto `AAAA-MM-DD`.
 *
 * Hace falta porque YAML convierte `2026-08-01` en un objeto de fecha, pero si
 * el valor va entre comillas lo deja como texto. El panel puede producir
 * cualquiera de las dos formas, así que se aceptan ambas.
 */
export function aTextoDeFecha(fecha: unknown): string {
  if (!fecha) return '';
  if (fecha instanceof Date) {
    // Se leen los componentes UTC a propósito: YAML interpreta una fecha sin
    // hora como medianoche universal, y leerla en horario local restaría un día
    // en México.
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getUTCDate()).padStart(2, '0');
    return `${fecha.getUTCFullYear()}-${mes}-${dia}`;
  }
  return String(fecha).slice(0, 10);
}

/**
 * Formatea una fecha en el idioma activo.
 *
 * Se construye con componentes numéricos explícitos en lugar de
 * `new Date("2026-01-15")`, porque esa forma se interpreta como medianoche en
 * horario universal y en México muestra el día anterior.
 */
export function formatearFecha(
  fecha: unknown,
  idioma: string = IDIOMA_POR_DEFECTO,
  opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const texto = aTextoDeFecha(fecha);
  if (!texto) return '';
  const [anio, mes, dia] = texto.split('-').map(Number);
  if (!anio || !mes || !dia) return '';
  const objeto = new Date(anio, mes - 1, dia);
  return new Intl.DateTimeFormat(CODIGO_COMPLETO[idioma] ?? 'es-MX', opciones).format(objeto);
}

/**
 * Formatea un número con separador de miles según el idioma.
 *
 * Importa más de lo que parece: "299537" se lee como un identificador,
 * "299,537" se lee como una cantidad. En una página cuyo argumento son las
 * cifras, que el número se lea de un vistazo es parte del mensaje.
 *
 * Los valores que no son numéricos (como el rango de edad "0 – 114") se
 * devuelven tal cual.
 */
export function formatearNumero(valor: unknown, idioma: string = IDIOMA_POR_DEFECTO): string {
  if (valor === null || valor === undefined || valor === '') return '';
  if (typeof valor !== 'number') return String(valor);
  return new Intl.NumberFormat(CODIGO_COMPLETO[idioma] ?? 'es-MX').format(valor);
}
