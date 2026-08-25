// =============================================================================
//  Doctor Payaso A.C. — Acceso al contenido
//
//  Único punto por el que las páginas leen lo que escribe Keystatic.
//
//  Aquí viven las REGLAS DE PUBLICACIÓN. No están en las páginas a propósito:
//  si la regla "un testimonio sin autorización vigente no se publica" estuviera
//  repetida en cada plantilla, bastaría con que alguien creara una página nueva
//  y la olvidara. Concentrada aquí, se aplica sola.
// =============================================================================

import { aTextoDeFecha } from './idioma';
import type { TextoLocalizado } from './idioma';

// -----------------------------------------------------------------------------
//  Páginas y ajustes (uno de cada)
// -----------------------------------------------------------------------------
import cifras from '../contenido/cifras.yaml';
import configuracion from '../contenido/configuracion.yaml';
import inicio from '../contenido/paginas/inicio.yaml';
import clownCare from '../contenido/paginas/clown-care.yaml';
import certificate from '../contenido/paginas/certificate.yaml';
import alianzas from '../contenido/paginas/alianzas.yaml';
import impacto from '../contenido/paginas/impacto.yaml';
import dona from '../contenido/paginas/dona.yaml';
import contacto from '../contenido/paginas/contacto.yaml';

export const paginas = {
  inicio,
  clownCare,
  certificate,
  alianzas,
  impacto,
  dona,
  contacto,
} as const;

export { cifras, configuracion };

// -----------------------------------------------------------------------------
//  Colecciones (muchos de cada)
// -----------------------------------------------------------------------------

function cargarCarpeta<T>(modulos: Record<string, { default: T }>): T[] {
  return Object.values(modulos).map((m) => m.default);
}

const todasLasSedes = cargarCarpeta<any>(
  import.meta.glob('../contenido/sedes/*.yaml', { eager: true }),
);
const todasLasGeneraciones = cargarCarpeta<any>(
  import.meta.glob('../contenido/generaciones/*.yaml', { eager: true }),
);
const todosLosModulos = cargarCarpeta<any>(
  import.meta.glob('../contenido/modulos/*.yaml', { eager: true }),
);
const todosLosTestimonios = cargarCarpeta<any>(
  import.meta.glob('../contenido/testimonios/*.yaml', { eager: true }),
);
const todosLosAliados = cargarCarpeta<any>(
  import.meta.glob('../contenido/aliados/*.yaml', { eager: true }),
);
const todosLosInformes = cargarCarpeta<any>(
  import.meta.glob('../contenido/informes/*.yaml', { eager: true }),
);
const todasLasPreguntas = cargarCarpeta<any>(
  import.meta.glob('../contenido/faq/*.yaml', { eager: true }),
);
const todoElEquipo = cargarCarpeta<any>(
  import.meta.glob('../contenido/equipo/*.yaml', { eager: true }),
);

const porOrden = (a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999);

// -----------------------------------------------------------------------------
//  REGLAS DE PUBLICACIÓN
// -----------------------------------------------------------------------------

/** Sedes activas, en el orden definido por el equipo. */
export const sedes = () => todasLasSedes.filter((s) => s.activa).sort(porOrden);

/** Módulos de certificación, en orden numérico. */
export const modulos = () => todosLosModulos.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));

/**
 * Generaciones publicables, de la más próxima a la más lejana.
 * Se excluyen las que ya iniciaron: una generación pasada en la página de
 * inscripción es peor que ninguna: comunica abandono.
 */
export const generaciones = () => {
  const hoy = new Date().toISOString().slice(0, 10);
  return todasLasGeneraciones
    .filter((g) => g.publicar)
    .filter((g) => {
      const inicio = aTextoDeFecha(g.fechaDeInicio);
      return g.estado === 'continua' || !inicio || inicio >= hoy;
    })
    .sort((a, b) =>
      (aTextoDeFecha(a.fechaDeInicio) || '9999').localeCompare(
        aTextoDeFecha(b.fechaDeInicio) || '9999',
      ),
    );
};

/** La próxima generación con inscripciones abiertas, si existe. */
export const proximaGeneracion = () =>
  generaciones().find((g) => g.estado === 'abiertas' || g.estado === 'continua') ?? null;

/**
 * Testimonios publicables.
 * REGLA: sin autorización por escrito vigente, no se publica. Aunque la casilla
 * de "mostrar en el sitio" esté marcada.
 */
export const testimonios = () =>
  todosLosTestimonios.filter((t) => t.publicar && t.autorizacionVigente);

export const testimonioPorId = (id: string | null | undefined) =>
  id ? (testimonios().find((t) => t.nombre === id) ?? null) : null;

/**
 * Aliados publicables.
 * REGLA: sin autorización de uso de marca, no se muestra el logotipo. Y si la
 * autorización tenía fecha de vencimiento y ya pasó, deja de mostrarse solo.
 * Un permiso vencido es un permiso que no existe.
 */
export const aliados = () => {
  const hoy = new Date().toISOString().slice(0, 10);
  return todosLosAliados
    .filter((a) => a.publicar && a.autorizacionDeUsoDelLogotipo)
    .filter((a) => {
      const vence = aTextoDeFecha(a.vigenciaDeLaAutorizacion);
      return !vence || vence >= hoy;
    })
    .sort(porOrden);
};

/** Informes anuales, del más reciente al más antiguo. */
export const informes = () =>
  todosLosInformes
    .filter((i) => i.publicar)
    .sort((a, b) => String(b.anio).localeCompare(String(a.anio)));

/** Preguntas frecuentes de una página. */
export const preguntas = (pagina: string) =>
  todasLasPreguntas.filter((p) => p.publicar && p.pagina === pagina).sort(porOrden);

/** Equipo publicable. */
export const equipo = () => todoElEquipo.filter((p) => p.publicar).sort(porOrden);

// -----------------------------------------------------------------------------
//  Imágenes
// -----------------------------------------------------------------------------

/**
 * Decide si una imagen puede mostrarse.
 *
 * REGLA: si la imagen contiene personas identificables y no tiene folio de
 * carta de consentimiento, no se publica. El control es imperfecto — depende de
 * que alguien haya marcado la casilla con honestidad — pero convierte un olvido
 * silencioso en una omisión visible, y eso ya es una mejora sustancial.
 */
export function imagenPublicable(imagen: any): boolean {
  if (!imagen?.archivo) return false;
  if (!imagen.muestraPersonasIdentificables) return true;
  return Boolean(imagen.folioConsentimiento?.trim());
}

export type Imagen = {
  archivo: string | null;
  textoAlternativo: TextoLocalizado;
  muestraPersonasIdentificables: boolean;
  folioConsentimiento: string;
};
