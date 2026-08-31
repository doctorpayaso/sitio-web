// =============================================================================
//  Doctor Payaso A.C. — Modelo de contenido
//  keystatic.config.ts
//
//  Versión:      0.1 (borrador)
//  Responsable:  Saul Sánchez — voluntariado
//  Fecha:        agosto de 2026
//  Estado:       propuesta pendiente de ratificación
//
//  REGLA DE ORO
//  Este archivo es el contrato entre el equipo de Doctor Payaso y el sitio web.
//  Todo lo que está aquí, la Administradora lo puede cambiar sola desde el panel.
//  Todo lo que NO está aquí, requiere a alguien que sepa programar.
//  Antes de agregar un campo, pregúntate si alguien lo va a mantener.
// =============================================================================

import {
  config,
  fields,
  collection,
  singleton,
  type ComponentSchema,
} from '@keystatic/core';

// =============================================================================
//  1. IDIOMAS
// =============================================================================
//  Para activar la versión en inglés (Fase 2) basta con agregar 'en' al arreglo
//  IDIOMAS_ACTIVOS. No se toca ningún otro archivo de este proyecto.
//
//  Al hacerlo:
//   · cada campo de texto muestra un segundo recuadro rotulado "English"
//   · los archivos de contenido que ya existen siguen siendo válidos
//   · los textos sin traducir quedan vacíos y el sitio cae al español
//
//  Ver MODELO-DE-CONTENIDO.md, sección "Activar la versión en inglés".
// -----------------------------------------------------------------------------

type Idioma = 'es' | 'en';

/** Aviso reutilizado en los campos donde el salto de línea es intencional. */
const NOTA_SALTOS = 'Cada salto de línea se respeta en el sitio. El diseño lo contempla.';

const IDIOMAS_ACTIVOS: readonly Idioma[] = ['es'] as const;
//                                          ^^^^ agregar 'en' aquí y nada más

const ETIQUETA_IDIOMA: Record<Idioma, string> = {
  es: 'Español',
  en: 'English',
};

// =============================================================================
//  2. AYUDANTES
// =============================================================================

/**
 * Repite un campo una vez por cada idioma activo.
 *
 * La forma del dato es SIEMPRE { es: ..., en: ... } aunque hoy solo exista
 * español. Esto es deliberado: mantiene estable el contrato con Astro para que
 * activar el inglés no rompa nada ni obligue a migrar contenido.
 */
function porIdioma<T extends ComponentSchema>(
  crearCampo: (etiquetaIdioma: string) => T,
  opciones: { label: string; description?: string },
) {
  const campos = Object.fromEntries(
    IDIOMAS_ACTIVOS.map((idioma) => [idioma, crearCampo(ETIQUETA_IDIOMA[idioma])]),
  ) as Record<Idioma, T>;

  return fields.object(campos, {
    label: opciones.label,
    description: opciones.description,
  });
}

/** Texto corto, localizado. */
const texto = (
  label: string,
  opciones: {
    description?: string;
    obligatorio?: boolean;
    maximo?: number;
    /** Permite saltos de línea. Necesario en titulares con quiebre deliberado. */
    variasLineas?: boolean;
  } = {},
) =>
  porIdioma(
    (etiqueta) =>
      fields.text({
        label: etiqueta,
        multiline: opciones.variasLineas,
        validation: {
          length: {
            min: opciones.obligatorio ? 1 : 0,
            max: opciones.maximo,
          },
        },
      }),
    { label, description: opciones.description },
  );

/** Párrafo, localizado. */
const parrafo = (
  label: string,
  opciones: { description?: string; obligatorio?: boolean } = {},
) =>
  porIdioma(
    (etiqueta) =>
      fields.text({
        label: etiqueta,
        multiline: true,
        validation: { length: { min: opciones.obligatorio ? 1 : 0 } },
      }),
    { label, description: opciones.description },
  );

/** Texto largo con formato (negritas, listas, enlaces), localizado. */
const textoConFormato = (label: string, opciones: { description?: string } = {}) =>
  porIdioma((etiqueta) => fields.markdoc.inline({ label: etiqueta }), {
    label,
    description: opciones.description,
  });

/**
 * Imagen con sus controles asociados.
 *
 * El texto alternativo es obligatorio: es requisito de accesibilidad AA, que
 * está dentro del alcance de la Fase 1.
 *
 * Los dos campos de consentimiento implementan el control documental del riesgo
 * "imágenes de pacientes sin consentimiento vigente". Keystatic no permite hacer
 * un campo obligatorio *en función de* otro, así que la obligatoriedad del folio
 * es procedimental, no técnica: queda asentada en el manual de edición y es
 * verificable en la revisión del pull request.
 */
/**
 * Campo de imagen.
 *
 * `carpeta` DEBE ser única por página. Keystatic no usa el nombre del archivo
 * que sube el equipo: arma la ruta con esta carpeta más la posición del campo
 * dentro del documento. Si dos páginas comparten carpeta y tienen un campo en
 * la misma posición —por ejemplo `hero.imagen.archivo`— producen exactamente la
 * misma ruta y se sobrescriben entre sí, en silencio.
 *
 * Las colecciones no tienen este problema: Keystatic les inserta el
 * identificador de cada entrada. El riesgo es solo de las páginas únicas.
 */
const imagen = (
  label: string,
  carpeta: string,
  opciones: { description?: string } = {},
) =>
  fields.object(
    {
      archivo: fields.image({
        label: 'Archivo',
        directory: `src/assets/${carpeta}`,
        publicPath: `/src/assets/${carpeta}/`,
        validation: { isRequired: false },
      }),
      textoAlternativo: texto('Texto alternativo', {
        obligatorio: true,
        description:
          'Describe la imagen para quien no puede verla. Obligatorio por accesibilidad.',
      }),
      muestraPersonasIdentificables: fields.checkbox({
        label: '¿Aparecen personas identificables?',
        defaultValue: false,
        description:
          'Marca esta casilla si se distingue el rostro de un paciente, familiar o voluntario.',
      }),
      folioConsentimiento: fields.text({
        label: 'Folio de la carta de consentimiento',
        description:
          'Obligatorio si la casilla anterior está marcada. Formato CONS-AAAA-###. Es un identificador de expediente: NUNCA se escribe aquí el nombre de un paciente ni de un menor, porque este repositorio es público. Sin folio, la imagen no se publica.',
      }),
    },
    { label, description: opciones.description },
  );

/** Enlace de botón, con texto localizado. */
const boton = (label: string) =>
  fields.object(
    {
      texto: texto('Texto del botón'),
      destino: fields.text({
        label: 'Destino',
        description: 'Ruta interna (/certificate) o dirección completa (https://…).',
      }),
    },
    { label },
  );

/** Tarjeta con icono de color, usada en varias páginas. */
const tarjetaIcono = (label: string) =>
  fields.object(
    {
      iconoImagen: fields.image({
        label: 'Icono propio',
        directory: 'src/assets/iconos',
        publicPath: '/src/assets/iconos/',
        description:
          'SVG o PNG con fondo transparente, cuadrado, mínimo 96 px. Si se carga uno aquí, sustituye al emoji.',
      }),
      icono: fields.text({
        label: 'Emoji (alternativa)',
        description: 'Se usa solo si no hay icono propio cargado. Ej. 🧒',
      }),
      color: fields.select({ label: 'Color de fondo', options: OPCIONES_COLOR, defaultValue: 'coral' }),
      titulo: texto('Título'),
      descripcion: parrafo('Descripción'),
    },
    { label },
  );

/** Lista de pasos numerados automáticamente. */
const listaDePasos = (label: string) =>
  fields.array(
    fields.object({ titulo: texto('Título'), descripcion: parrafo('Descripción') }),
    { label, description: 'Se numeran solos: 01, 02, 03…', itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Paso' },
  );

/** Tarjeta de las dos rutas de entrada de la portada. */
const rutaDeEntrada = (label: string) =>
  fields.object(
    {
      etiqueta: texto('Etiqueta superior'),
      titulo: texto('Título'),
      descripcion: parrafo('Descripción'),
      puntos: fields.array(texto('Punto'), {
        label: 'Lista de puntos',
        itemLabel: (props) => props.fields.es?.value || 'Punto',
      }),
      boton: boton('Botón'),
    },
    { label },
  );

/** Metadatos de buscador para una página. */
const seo = () =>
  fields.object(
    {
      titulo: texto('Título en Google', {
        maximo: 60,
        description:
          'Máximo 60 caracteres. Es lo que la gente ve en los resultados de búsqueda. Debe describir la página, no repetir el nombre de la organización.',
      }),
      descripcion: parrafo('Descripción en Google', {
        description: 'Entre 120 y 160 caracteres. Es el párrafo gris bajo el título.',
      }),
      imagenAlCompartir: fields.image({
        label: 'Imagen al compartir en redes',
        directory: 'src/assets/og',
        publicPath: '/src/assets/og/',
      }),
    },
    { label: 'Buscadores y redes sociales' },
  );

// =============================================================================
//  3. LISTAS COMPARTIDAS
// =============================================================================

const OPCIONES_ESTADO_GENERACION = [
  { label: 'Inscripciones abiertas', value: 'abiertas' },
  { label: 'Lista de espera', value: 'lista_espera' },
  { label: 'Inscripciones cerradas', value: 'cerradas' },
  { label: 'Generación continua (siempre abierta)', value: 'continua' },
] as const;

const OPCIONES_MODALIDAD = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Mixta', value: 'mixta' },
] as const;

const OPCIONES_PAGINA_FAQ = [
  { label: 'Certifícate', value: 'certificate' },
  { label: 'Alianzas', value: 'alianzas' },
  { label: 'Donar', value: 'dona' },
  { label: 'Qué es Clown Care', value: 'clown-care' },
] as const;

const OPCIONES_CIFRAS = [
  { label: 'Voluntarios certificados', value: 'voluntariosCertificados' },
  { label: 'Voluntarios activos', value: 'voluntariosActivos' },
  { label: 'Visitas hospitalarias', value: 'visitasHospitalarias' },
  { label: 'Personas beneficiadas', value: 'personasBeneficiadas' },
  { label: 'Ciudades', value: 'ciudadesConOperacion' },
  { label: 'Informes publicados', value: 'informesPublicados' },
  { label: 'Rango de edad', value: 'rangoDeEdad' },
] as const;

const OPCIONES_COLOR = [
  { label: 'Coral', value: 'coral' },
  { label: 'Azul', value: 'azul' },
  { label: 'Menta', value: 'menta' },
  { label: 'Mango', value: 'mango' },
  { label: 'Teal', value: 'teal' },
  { label: 'Vino', value: 'vino' },
] as const;

const OPCIONES_METODO_PAGO = [
  { label: 'Tarjeta de crédito o débito', value: 'tarjeta' },
  { label: 'Transferencia SPEI', value: 'spei' },
  { label: 'OXXO Pay', value: 'oxxo' },
  { label: 'Domiciliación', value: 'domiciliacion' },
  { label: 'PayPal', value: 'paypal' },
] as const;

// =============================================================================
//  4. CONFIGURACIÓN
// =============================================================================

export default config({
  storage: {
    kind: 'github',
    repo: 'doctorpayaso/sitio-web',
  },

  ui: {
    brand: { name: 'Doctor Payaso A.C.' },
    navigation: {
      'Se actualiza seguido': ['cifras', 'generaciones'],
      'Las seis páginas': [
        'inicio',
        'clownCare',
        'certificate',
        'alianzas',
        'impacto',
        'dona',
      ],
      'Contenido reutilizable': [
        'sedes',
        'modulos',
        'testimonios',
        'aliados',
        'informesAnuales',
        'preguntasFrecuentes',
        'equipo',
      ],
      'Ajustes del sitio': ['configuracion', 'contacto'],
    },
  },

  // ===========================================================================
  //  SINGLETONS — existe exactamente uno de cada
  // ===========================================================================
  singletons: {
    // -------------------------------------------------------------------------
    //  CIFRAS DE IMPACTO
    //  Frecuencia: trimestral. Es el contenido más sensible del sitio: son los
    //  números que un aliado institucional puede pedir que se respalden.
    // -------------------------------------------------------------------------
    cifras: singleton({
      label: 'Cifras de impacto',
      path: 'src/contenido/cifras',
      format: { data: 'yaml' },
      schema: {
        fechaDeCorte: fields.date({
          label: 'Fecha de corte',
          description:
            'OBLIGATORIO. Se muestra junto a las cifras en el sitio. Un número sin fecha de corte envejece en silencio; con fecha, cualquiera nota si está viejo.',
          validation: { isRequired: true },
        }),
        aprobadoPor: fields.text({
          label: 'Aprobado por',
          description:
            'Iniciales o cargo de quien autoriza publicar estas cifras. Este repositorio es público: usar «Administración» o «CMR», no el nombre completo.',
        }),

        voluntariosCertificados: fields.integer({
          label: 'Voluntarios certificados (histórico)',
          description:
            'Definición vigente: persona que completó los seis módulos en cualquier generación desde 2015. Incluye a quienes ya no están activos.',
        }),
        voluntariosActivos: fields.integer({
          label: 'Voluntarios activos',
          description:
            'Definición vigente: persona certificada que participa en visitas de forma periódica hoy.',
        }),
        visitasHospitalarias: fields.integer({ label: 'Visitas a hospitales' }),
        personasBeneficiadas: fields.integer({ label: 'Personas beneficiadas' }),
        ciudadesConOperacion: fields.integer({
          label: 'Ciudades con operación permanente',
        }),
        informesPublicados: fields.integer({ label: 'Informes anuales publicados' }),
        rangoDeEdad: fields.text({
          label: 'Rango de edad de pacientes',
          defaultValue: '0 – 114',
          description: 'Se muestra tal cual. Es la métrica más humana que tenemos.',
        }),

        notaMetodologica: parrafo('Nota metodológica', {
          description:
            'Cómo se cuenta cada cifra. Es lo que se responde cuando una empresa pide el respaldo del dato.',
        }),
      },
    }),

    // -------------------------------------------------------------------------
    //  CONFIGURACIÓN GENERAL
    // -------------------------------------------------------------------------
    configuracion: singleton({
      label: 'Ajustes generales',
      path: 'src/contenido/configuracion',
      format: { data: 'yaml' },
      schema: {
        eslogan: texto('Eslogan', {
          description:
            'Decisión institucional: «Sanando con amor y alegría». No se cambia sin acuerdo de Dirección.',
        }),
        descriptorLogotipo: fields.text({
          label: 'Descriptor del logotipo',
          defaultValue: 'FELICIDAD QUE SIRVE',
          description: 'Pendiente de Dirección: decidir si convive con el eslogan.',
        }),
        descripcionBreve: parrafo('Descripción breve', {
          description: 'Aparece en el pie de página, bajo el eslogan. Dos líneas como máximo.',
        }),

        contacto: fields.object(
          {
            correo: fields.text({ label: 'Correo público' }),
            telefono: fields.text({ label: 'Teléfono' }),
            whatsapp: fields.text({
              label: 'WhatsApp',
              description: 'Formato internacional, sin espacios. Ej. +525538999466',
            }),
            correoInstitucional: fields.text({
              label: 'Correo para alianzas institucionales',
            }),
          },
          { label: 'Datos de contacto' },
        ),

        redes: fields.object(
          {
            facebook: fields.url({ label: 'Facebook' }),
            instagram: fields.url({ label: 'Instagram' }),
            youtube: fields.url({ label: 'YouTube' }),
            linkedin: fields.url({ label: 'LinkedIn' }),
            tiktok: fields.url({ label: 'TikTok' }),
          },
          { label: 'Redes sociales' },
        ),

        donataria: fields.conditional(
          fields.checkbox({
            label: '¿Publicar el estatus de donataria autorizada?',
            defaultValue: false,
            description:
              'Pendiente #5 del proyecto. Mientras esté desmarcado, el sitio no afirma nada sobre deducibilidad.',
          }),
          {
            false: fields.empty(),
            true: fields.object({
              numeroAutorizacion: fields.text({ label: 'Número de autorización' }),
              fechaPublicacionDOF: fields.date({ label: 'Publicación en el DOF' }),
              textoCFDI: parrafo('Texto sobre el CFDI'),
            }),
          },
        ),

        avisoDePrivacidad: fields.url({
          label: 'Enlace al aviso de privacidad',
          description:
            'Debe ser accesible desde toda página con formulario, no solo desde el pie.',
        }),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: INICIO
    // -------------------------------------------------------------------------
    inicio: singleton({
      label: 'Inicio',
      path: 'src/contenido/paginas/inicio',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),

        hero: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', {
              variasLineas: true,
              description:
                'Aprobado por Dirección: «Hay medicina que no se receta.» Cada salto de línea se respeta en el sitio. El diseño lo contempla.',
            }),
            palabraDestacada: texto('Palabra resaltada en coral', {
              description: 'Debe aparecer tal cual dentro del titular. Se pinta de coral.',
            }),
            entrada: parrafo('Párrafo de entrada'),
            botonPrincipal: boton('Botón principal'),
            botonSecundario: boton('Botón secundario'),
            mostrarProximaGeneracion: fields.checkbox({
              label: 'Mostrar la próxima generación',
              defaultValue: true,
              description: 'Se toma sola de la generación abierta más cercana.',
            }),
            firma: texto('Firma bajo los botones'),
            insignia: fields.object(
              {
                numero: fields.integer({ label: 'Número' }),
                etiqueta: texto('Etiqueta', { variasLineas: true }),
              },
              { label: 'Insignia flotante sobre la foto' },
            ),
            imagen: imagen('Fotografía principal', 'paginas/inicio', {
              description: 'Vertical, proporción 4:5. Voluntario y paciente, mirada a mirada.',
            }),
          },
          { label: 'Primera pantalla' },
        ),

        franjaDeCifras: fields.multiselect({
          label: 'Cifras de la franja verde oscuro',
          options: OPCIONES_CIFRAS,
          description: 'Elige cuatro. Los valores salen de «Cifras de impacto».',
        }),

        dosRutas: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
            entrada: parrafo('Entrada'),
            rutaPersonas: rutaDeEntrada('Tarjeta coral — para personas'),
            rutaInstituciones: rutaDeEntrada('Tarjeta azul — para instituciones'),
          },
          { label: 'Las dos rutas' },
        ),

        metodo: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
            entrada: parrafo('Entrada'),
            imagen: imagen('Fotografía cuadrada', 'paginas/inicio'),
            pasos: fields.array(
              fields.object({
                titulo: texto('Título del paso'),
                descripcion: parrafo('Descripción'),
              }),
              {
                label: 'Pasos del método',
                description: 'Se numeran solos: 01, 02, 03…',
                itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Paso',
              },
            ),
          },
          { label: 'Nuestro método' },
        ),

        citaEditorial: fields.object(
          {
            texto: parrafo('Cita', {
              description:
                'REGLA: se transcribe de la fuente original. Nunca se redacta ni se parafrasea una cita atribuida a una persona real.',
            }),
            autor: texto('Autor y procedencia', { variasLineas: true, description: NOTA_SALTOS }),
          },
          { label: 'Cita editorial' },
        ),

        visitasVirtuales: fields.object(
          {
            titulo: texto('Titular'),
            descripcion: parrafo('Descripción'),
            boton: boton('Botón'),
          },
          { label: 'Franja de visitas virtuales' },
        ),

        transparencia: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
            entrada: parrafo('Entrada'),
            enlace: boton('Enlace a los informes'),
            tarjetas: fields.array(
              fields.object({
                destacado: texto('Texto grande'),
                color: fields.select({
                  label: 'Color del texto grande',
                  options: OPCIONES_COLOR,
                  defaultValue: 'coral',
                }),
                titulo: texto('Título'),
                descripcion: parrafo('Descripción'),
              }),
              {
                label: 'Tarjetas',
                itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Tarjeta',
              },
            ),
          },
          { label: 'Transparencia' },
        ),

        testimonio: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            persona: fields.relationship({
              label: 'Testimonio destacado',
              collection: 'testimonios',
              description:
                'Solo aparece en el sitio si el testimonio tiene autorización vigente registrada.',
            }),
            imagen: imagen('Retrato', 'paginas/inicio'),
          },
          { label: 'Testimonio' },
        ),

        aliados: fields.object(
          { titulo: texto('Texto sobre los logotipos') },
          {
            label: 'Aliados',
            description: 'Los logotipos se administran en la sección «Aliados».',
          },
        ),

        cierre: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
            descripcion: parrafo('Descripción'),
            firma: texto('Firma'),
            botonPrincipal: boton('Botón principal'),
            botonSecundario: boton('Botón secundario'),
          },
          { label: 'Cierre en negro' },
        ),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: QUÉ ES CLOWN CARE
    // -------------------------------------------------------------------------
    clownCare: singleton({
      label: 'Qué es Clown Care',
      path: 'src/contenido/paginas/clown-care',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),
        antetitulo: texto('Antetítulo'),
        titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
        entrada: parrafo('Párrafo de entrada'),
        video: fields.object(
          {
            portada: imagen('Portada panorámica (21:9)', 'paginas/clown-care'),
            enlace: fields.url({ label: 'Enlace del video' }),
            pie: texto('Pie del video'),
          },
          { label: 'Video' },
        ),
        anatomia: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true }),
            entrada: parrafo('Entrada'),
            pasos: listaDePasos('Pasos de la visita'),
          },
          { label: 'Anatomía de una visita' },
        ),
        acompanamos: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true }),
            grupos: fields.array(tarjetaIcono('Grupo'), {
              label: 'Grupos',
              itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Grupo',
            }),
          },
          { label: 'A quién acompañamos' },
        ),
        llamadoHospitales: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true }),
            cuerpo: parrafo('Cuerpo'),
            boton: boton('Botón'),
          },
          { label: 'Llamado a hospitales' },
        ),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: CERTIFÍCATE
    //  Es la página de conversión de la ruta de voluntariado.
    // -------------------------------------------------------------------------
    certificate: singleton({
      label: 'Certifícate',
      path: 'src/contenido/paginas/certificate',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),
        hero: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', {
              variasLineas: true,
              description: `Aprobado por Dirección: «No buscamos payasos. Buscamos personas.» ${NOTA_SALTOS}`,
            }),
            palabraDestacada: texto('Palabra resaltada en coral'),
            entrada: parrafo('Párrafo de entrada'),
            botonPrincipal: boton('Botón principal'),
            botonSecundario: boton('Botón secundario'),
            avisoDeCierre: texto('Aviso de cierre de inscripciones', {
              description: 'Ej. «Cierre de inscripciones Monterrey: 20 de diciembre». Dejar vacío lo oculta.',
            }),
            imagen: imagen('Fotografía', 'paginas/certificate', {
              description: 'Vertical 4:5. Grupo en formación, en pleno ejercicio. Energía, no pose oficial.',
            }),
          },
          { label: 'Primera pantalla' },
        ),
        requisitos: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true }),
            lista: fields.array(tarjetaIcono('Requisito'), {
              label: 'Requisitos',
              itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Requisito',
            }),
          },
          { label: 'Lo que sí necesitas' },
        ),
        costo: fields.conditional(
          fields.checkbox({
            label: '¿Ya se puede publicar el costo?',
            defaultValue: false,
            description:
              'Mientras esté desmarcado, el sitio dice «monto por confirmar» en lugar de dejar el espacio vacío. Es la duda número uno del candidato.',
          }),
          {
            false: fields.object({ textoProvisional: texto('Texto provisional') }),
            true: fields.object({
              monto: fields.integer({ label: 'Monto' }),
              moneda: fields.select({
                label: 'Moneda',
                options: [
                  { label: 'Pesos mexicanos', value: 'MXN' },
                  { label: 'Dólares', value: 'USD' },
                ],
                defaultValue: 'MXN',
              }),
              queIncluye: parrafo('Qué incluye'),
              duracion: texto('Duración de la formación'),
            }),
          },
        ),
        becas: fields.conditional(
          fields.checkbox({ label: '¿Existe esquema de becas?', defaultValue: false }),
          {
            false: fields.empty(),
            true: fields.object({
              descripcion: parrafo('Cómo funcionan'),
              comoSolicitar: parrafo('Cómo se solicita'),
            }),
          },
        ),
        modulosIntro: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
            entrada: parrafo('Entrada'),
            etiquetas: fields.array(texto('Etiqueta'), {
              label: 'Etiquetas de colores',
              itemLabel: (props) => props.fields.es?.value || 'Etiqueta',
            }),
          },
          {
            label: 'Introducción a los módulos',
            description: 'Los seis módulos se editan en «Módulos de certificación».',
          },
        ),
        generaciones: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', { variasLineas: true }),
            nota: parrafo('Nota al costado'),
          },
          {
            label: 'Bloque de generaciones',
            description: 'Las fechas y sedes se editan en «Generaciones de certificación».',
          },
        ),
        programaUniversidades: fields.object(
          {
            titulo: texto('Titular'),
            cuerpo: parrafo('Cuerpo'),
            boton: boton('Botón'),
          },
          { label: 'Programa para estudiantes de salud' },
        ),
        preguntas: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true }),
            entrada: parrafo('Entrada'),
          },
          {
            label: 'Bloque de preguntas frecuentes',
            description: 'Las preguntas se editan en «Preguntas frecuentes».',
          },
        ),
        formulario: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true, description: NOTA_SALTOS }),
            entrada: parrafo('Entrada'),
            pasos: fields.array(texto('Paso'), {
              label: 'Los tres pasos del proceso',
              itemLabel: (props) => props.fields.es?.value || 'Paso',
            }),
            textoDelConsentimiento: parrafo('Texto de la casilla de consentimiento', {
              description: 'Redacción validada por la abogada. La casilla NUNCA viene premarcada.',
              obligatorio: true,
            }),
            textoDeExito: parrafo('Mensaje después de enviar'),
            textoWhatsApp: texto('Texto del botón de WhatsApp'),
          },
          { label: 'Formulario de solicitud' },
        ),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: ALIANZAS
    // -------------------------------------------------------------------------
    alianzas: singleton({
      label: 'Alianzas',
      path: 'src/contenido/paginas/alianzas',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),
        hero: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', {
              variasLineas: true,
              description: `Aprobado por Dirección: «Impacto social que sí se documenta.» ${NOTA_SALTOS}`,
            }),
            palabraDestacada: texto('Palabra resaltada en verde'),
            entrada: parrafo('Párrafo de entrada'),
            botonPrincipal: boton('Botón principal'),
            botonSecundario: boton('Botón secundario'),
            insignia: fields.object(
              {
                destacado: texto('Texto grande'),
                etiqueta: texto('Etiqueta', { variasLineas: true }),
              },
              { label: 'Insignia flotante sobre la foto' },
            ),
            imagen: imagen('Fotografía', 'paginas/alianzas', {
              description: 'Vertical 4:5. Registro sobrio, institucional. No festivo.',
            }),
          },
          { label: 'Primera pantalla' },
        ),
        modelosDeColaboracion: fields.object(
          {
            titulo: texto('Titular', { variasLineas: true }),
            modelos: fields.array(
              fields.object({
                iconoImagen: fields.image({
                  label: 'Icono propio',
                  directory: 'src/assets/iconos',
                  publicPath: '/src/assets/iconos/',
                  description: 'SVG o PNG con fondo transparente. Sustituye al emoji.',
                }),
                icono: fields.text({ label: 'Emoji (alternativa)', description: 'Ej. 🏥' }),
                nombre: texto('Nombre del modelo'),
                paraQuien: texto('Para quién'),
                descripcion: parrafo('Descripción'),
                incluye: fields.array(texto('Elemento'), {
                  label: 'Qué incluye',
                  itemLabel: (props) => props.fields.es?.value || 'Elemento',
                }),
                enlace: boton('Enlace al pie de la tarjeta'),
              }),
              {
                label: 'Modelos',
                itemLabel: (props) => props.fields.nombre.fields.es?.value || 'Modelo',
              },
            ),
          },
          { label: 'Modelos de colaboración' },
        ),
        citaInstitucional: fields.object(
          {
            texto: parrafo('Cita'),
            autor: texto('Autor y procedencia', { variasLineas: true }),
          },
          { label: 'Cita sobre fondo verde' },
        ),
        proceso: fields.object(
          {
            antetitulo: texto('Antetítulo'),
            titulo: texto('Titular', { variasLineas: true }),
            entrada: parrafo('Entrada'),
            boton: boton('Botón'),
            pasos: listaDePasos('Pasos del proceso'),
          },
          { label: 'De la primera llamada al primer pasillo' },
        ),
        contacto: fields.object(
          {
            titulo: texto('Titular'),
            entrada: parrafo('Entrada'),
            recurso: boton('Tercer enlace de contacto'),
            textoDelConsentimiento: parrafo('Texto de la casilla de consentimiento', { obligatorio: true }),
            textoDeExito: parrafo('Mensaje después de enviar'),
          },
          { label: 'Formulario institucional' },
        ),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: IMPACTO Y TRANSPARENCIA
    // -------------------------------------------------------------------------
    impacto: singleton({
      label: 'Impacto y transparencia',
      path: 'src/contenido/paginas/impacto',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),
        antetitulo: texto('Antetítulo'),
        titulo: texto('Titular', {
          variasLineas: true,
          description: `Aprobado por Dirección: «Los números antes que las fotos.» ${NOTA_SALTOS}`,
        }),
        entrada: parrafo('Párrafo de entrada'),
        cifrasQueSeMuestran: fields.multiselect({
          label: 'Cifras que se muestran',
          options: OPCIONES_CIFRAS,
        }),
        informes: fields.object(
          { titulo: texto('Titular'), entrada: parrafo('Entrada') },
          {
            label: 'Bloque de informes',
            description: 'Los archivos se cargan en «Informes anuales».',
          },
        ),
        gobernanza: fields.array(
          fields.object({
            iconoImagen: fields.image({
              label: 'Icono propio',
              directory: 'src/assets/iconos',
              publicPath: '/src/assets/iconos/',
              description: 'SVG o PNG con fondo transparente. Sustituye al emoji.',
            }),
            icono: fields.text({ label: 'Emoji (alternativa)', description: 'Ej. 📋' }),
            color: fields.select({ label: 'Color de fondo', options: OPCIONES_COLOR, defaultValue: 'coral' }),
            titulo: texto('Título'),
            cuerpo: parrafo('Cuerpo'),
          }),
          {
            label: 'Bloques de gobernanza',
            itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Bloque',
          },
        ),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: DONAR
    // -------------------------------------------------------------------------
    dona: singleton({
      label: 'Donar',
      path: 'src/contenido/paginas/dona',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),
        antetitulo: texto('Antetítulo'),
        titulo: texto('Titular', {
          variasLineas: true,
          description: `Aprobado por Dirección: «Tu donativo no compra narices. Compra tiempo.» ${NOTA_SALTOS}`,
        }),
        entrada: parrafo('Párrafo de entrada'),
        montos: fields.array(
          fields.object({
            monto: fields.integer({ label: 'Monto en pesos' }),
            periodicidad: fields.select({
              label: 'Periodicidad',
              options: [
                { label: 'Mensual', value: 'mensual' },
                { label: 'Único', value: 'unico' },
              ],
              defaultValue: 'mensual',
            }),
            equivalencia: parrafo('Qué financia este monto', {
              description: 'Las equivalencias deben validarse con el área financiera antes de publicarse.',
            }),
            destacado: fields.checkbox({ label: 'Marcar como «más elegido»', defaultValue: false }),
          }),
          {
            label: 'Montos sugeridos',
            itemLabel: (props) => `$${props.fields.monto.value ?? '—'} MXN`,
          },
        ),
        metodosDePago: fields.multiselect({
          label: 'Métodos de pago disponibles',
          options: OPCIONES_METODO_PAGO,
          description:
            'Solo marcar los que estén realmente habilitados en la pasarela. Anunciar un método que no funciona pierde al donante en el peor momento.',
        }),
        garantias: fields.array(tarjetaIcono('Bloque de confianza'), {
          label: 'Bloques de confianza',
          itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Bloque',
        }),
        textoDelConsentimiento: parrafo('Texto de la casilla de consentimiento', { obligatorio: true }),
      },
    }),

    // -------------------------------------------------------------------------
    //  PÁGINA: CONTACTO
    // -------------------------------------------------------------------------
    contacto: singleton({
      label: 'Contacto',
      path: 'src/contenido/paginas/contacto',
      format: { data: 'yaml' },
      schema: {
        seo: seo(),
        titulo: texto('Titular'),
        entrada: parrafo('Párrafo de entrada'),
        bloques: fields.array(
          fields.object({
            titulo: texto('Título'),
            descripcion: parrafo('Descripción'),
            correo: fields.text({ label: 'Correo' }),
          }),
          {
            label: 'Bloques de contacto',
            itemLabel: (props) => props.fields.titulo.fields.es?.value || 'Bloque',
          },
        ),
      },
    }),
  },

  // ===========================================================================
  //  COLLECTIONS — hay muchos de cada uno
  // ===========================================================================
  collections: {
    // -------------------------------------------------------------------------
    //  SEDES
    // -------------------------------------------------------------------------
    sedes: collection({
      label: 'Sedes',
      path: 'src/contenido/sedes/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({
          name: { label: 'Nombre de la sede' },
          slug: { label: 'Identificador en la dirección web' },
        }),
        estado: fields.text({ label: 'Estado' }),
        tipo: fields.select({
          label: 'Tipo',
          options: OPCIONES_MODALIDAD,
          defaultValue: 'presencial',
        }),
        descripcion: parrafo('Descripción'),
        imagen: imagen('Fotografía de la sede', 'sedes'),
        correoDeContacto: fields.text({ label: 'Correo de contacto' }),
        activa: fields.checkbox({ label: 'Sede activa', defaultValue: true }),
        orden: fields.integer({
          label: 'Orden de aparición',
          description: 'Menor número, aparece antes.',
        }),
      },
    }),

    // -------------------------------------------------------------------------
    //  GENERACIONES — se actualiza 3 o 4 veces al año
    // -------------------------------------------------------------------------
    generaciones: collection({
      label: 'Generaciones de certificación',
      path: 'src/contenido/generaciones/*',
      slugField: 'identificador',
      format: { data: 'yaml' },
      schema: {
        identificador: fields.slug({
          name: {
            label: 'Identificador',
            description: 'Ej. «Monterrey enero 2027». Sirve para encontrarla en la lista.',
          },
        }),
        sede: fields.relationship({
          label: 'Sede',
          collection: 'sedes',
          validation: { isRequired: true },
        }),
        fechaDeInicio: fields.date({ label: 'Fecha de inicio' }),
        fechaDeCierreDeInscripciones: fields.date({
          label: 'Cierre de inscripciones',
        }),
        modalidad: fields.select({
          label: 'Modalidad',
          options: OPCIONES_MODALIDAD,
          defaultValue: 'presencial',
        }),
        estado: fields.select({
          label: 'Estado',
          options: OPCIONES_ESTADO_GENERACION,
          defaultValue: 'lista_espera',
          description:
            'Determina qué botón se muestra: «Inscribirme», «Avísenme» o ninguno.',
        }),
        cupoLimitado: fields.checkbox({
          label: 'Indicar que el cupo es limitado',
          defaultValue: true,
        }),
        notas: texto('Nota adicional', {
          description: 'Ej. «Práctica coordinada en tu ciudad». Opcional.',
        }),
        publicar: fields.checkbox({
          label: 'Mostrar en el sitio',
          defaultValue: true,
        }),
      },
    }),

    // -------------------------------------------------------------------------
    //  MÓDULOS DE CERTIFICACIÓN
    // -------------------------------------------------------------------------
    modulos: collection({
      label: 'Módulos de certificación',
      path: 'src/contenido/modulos/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre del módulo' } }),
        numero: fields.integer({ label: 'Número', validation: { isRequired: true } }),
        descripcion: parrafo('Descripción'),
        duracion: texto('Duración'),
      },
    }),

    // -------------------------------------------------------------------------
    //  TESTIMONIOS
    //  Control: no se publica un testimonio sin autorización registrada.
    // -------------------------------------------------------------------------
    testimonios: collection({
      label: 'Testimonios',
      path: 'src/contenido/testimonios/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre de la persona' } }),
        cargo: texto('Cargo'),
        institucion: fields.text({ label: 'Institución' }),
        cita: parrafo('Cita textual', {
          description:
            'REGLA: se transcribe de la fuente original. Nunca se redacta ni se parafrasea una cita atribuida a una persona real.',
          obligatorio: true,
        }),
        fuente: fields.text({
          label: 'Fuente de la cita',
          description: 'Ej. «Video institucional 2025, minuto 3:12». Trazabilidad.',
        }),
        fotografia: imagen('Fotografía', 'testimonios'),
        autorizacionVigente: fields.checkbox({
          label: '¿Hay autorización por escrito vigente?',
          defaultValue: false,
          description: 'Sin esto marcado, el testimonio NO se publica.',
        }),
        fechaDeAutorizacion: fields.date({ label: 'Fecha de la autorización' }),
        publicar: fields.checkbox({ label: 'Mostrar en el sitio', defaultValue: false }),
      },
    }),

    // -------------------------------------------------------------------------
    //  ALIADOS
    // -------------------------------------------------------------------------
    aliados: collection({
      label: 'Aliados',
      path: 'src/contenido/aliados/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre del aliado' } }),
        logotipo: fields.image({
          label: 'Logotipo',
          directory: 'src/assets/aliados',
          publicPath: '/src/assets/aliados/',
        }),
        sitioWeb: fields.url({ label: 'Sitio web' }),
        tipo: fields.select({
          label: 'Tipo de aliado',
          options: [
            { label: 'Empresa', value: 'empresa' },
            { label: 'Hospital', value: 'hospital' },
            { label: 'Universidad', value: 'universidad' },
            { label: 'Fundación', value: 'fundacion' },
            { label: 'Gobierno', value: 'gobierno' },
          ],
          defaultValue: 'empresa',
        }),
        autorizacionDeUsoDelLogotipo: fields.checkbox({
          label: '¿Hay autorización escrita para usar el logotipo?',
          defaultValue: false,
          description: 'Sin esto marcado, el logotipo NO se publica.',
        }),
        vigenciaDeLaAutorizacion: fields.date({
          label: 'La autorización vence el',
          description: 'Dejar vacío si es indefinida.',
        }),
        publicar: fields.checkbox({ label: 'Mostrar en el sitio', defaultValue: false }),
        orden: fields.integer({ label: 'Orden de aparición' }),
      },
    }),

    // -------------------------------------------------------------------------
    //  INFORMES ANUALES
    // -------------------------------------------------------------------------
    informesAnuales: collection({
      label: 'Informes anuales',
      path: 'src/contenido/informes/*',
      slugField: 'anio',
      format: { data: 'yaml' },
      schema: {
        anio: fields.slug({ name: { label: 'Año' } }),
        archivoEspanol: fields.file({
          label: 'PDF en español',
          directory: 'src/assets/informes',
          publicPath: '/src/assets/informes/',
          description:
            'Sin este archivo el informe no aparece en el sitio: una tarjeta que no descarga nada es peor que ninguna.',
        }),
        archivoIngles: fields.file({
          label: 'PDF en inglés',
          directory: 'src/assets/informes',
          publicPath: '/src/assets/informes/',
          description: 'Opcional. Si existe, se muestra la tarjeta «Versiones en inglés».',
        }),
        cifrasDestacadas: fields.array(
          fields.object({
            etiqueta: texto('Concepto'),
            valor: fields.text({ label: 'Valor' }),
          }),
          {
            label: 'Cifras clave en texto',
            description:
              'Sacar los números del PDF y ponerlos aquí es la acción de mayor retorno para aparecer en buscadores y asistentes de IA. Un modelo no cita bien un PDF; cita muy bien una página con cifras en texto.',
            itemLabel: (props) =>
              props.fields.etiqueta.fields.es?.value || 'Cifra',
          },
        ),
        publicar: fields.checkbox({ label: 'Mostrar en el sitio', defaultValue: true }),
      },
    }),

    // -------------------------------------------------------------------------
    //  PREGUNTAS FRECUENTES
    // -------------------------------------------------------------------------
    preguntasFrecuentes: collection({
      label: 'Preguntas frecuentes',
      path: 'src/contenido/faq/*',
      slugField: 'identificador',
      format: { data: 'yaml' },
      schema: {
        identificador: fields.slug({ name: { label: 'Identificador interno' } }),
        pagina: fields.select({
          label: 'En qué página aparece',
          options: OPCIONES_PAGINA_FAQ,
          defaultValue: 'certificate',
        }),
        pregunta: texto('Pregunta', { obligatorio: true }),
        respuesta: textoConFormato('Respuesta', {
          description:
            'La primera o segunda frase debe contener la respuesta completa. Es lo que citan los buscadores y los asistentes de IA.',
        }),
        orden: fields.integer({ label: 'Orden' }),
        publicar: fields.checkbox({ label: 'Mostrar en el sitio', defaultValue: true }),
      },
    }),

    // -------------------------------------------------------------------------
    //  EQUIPO — versión reducida en Fase 1
    // -------------------------------------------------------------------------
    equipo: collection({
      label: 'Equipo',
      path: 'src/contenido/equipo/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre' } }),
        nombreDeClown: fields.text({ label: 'Nombre de clown' }),
        rol: texto('Rol'),
        sede: fields.relationship({ label: 'Sede', collection: 'sedes' }),
        fotografia: imagen('Fotografía', 'equipo'),
        publicar: fields.checkbox({ label: 'Mostrar en el sitio', defaultValue: false }),
        orden: fields.integer({ label: 'Orden' }),
      },
    }),
  },
});
