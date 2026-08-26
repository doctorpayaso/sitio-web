// =============================================================================
//  Doctor Payaso A.C. — Configuración de Astro
//
//  Principio rector: el sitio público es HTML estático. Solo dos rutas se
//  ejecutan en el servidor — el panel de edición y el envío de formularios.
//  Todo lo demás se genera al compilar y se sirve desde el borde de la red.
//
//  Consecuencia práctica: las peticiones a archivos estáticos en Cloudflare son
//  gratuitas e ilimitadas. Con el tráfico actual del sitio, la factura de
//  hospedaje es cero y el único costo real es el dominio.
// =============================================================================

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import yaml from '@rollup/plugin-yaml';

// -----------------------------------------------------------------------------
//  Idiomas
// -----------------------------------------------------------------------------
//  Debe coincidir con IDIOMAS_ACTIVOS de keystatic.config.ts.
//  Para activar el inglés: agregar 'en' aquí y allá. Nada más.
//
//  prefixDefaultLocale: false mantiene el español en la raíz del sitio
//  (doctorpayaso.com/certificate) y pondría el inglés bajo /en/. Esto preserva
//  las direcciones actuales y evita perder el posicionamiento ya ganado.
// -----------------------------------------------------------------------------
const IDIOMAS = ['es'];
//              ^^^^^ agregar 'en' en Fase 2

export default defineConfig({
  site: 'https://doctorpayaso.com',

  i18n: {
    locales: IDIOMAS,
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // ---------------------------------------------------------------------------
  //  Renderizado
  // ---------------------------------------------------------------------------
  //  'static' por defecto: cada página se genera al compilar.
  //  Las rutas que necesitan servidor se marcan una por una con
  //  `export const prerender = false`. Es la lista blanca, no la lista negra:
  //  si alguien agrega una página nueva, nace estática salvo decisión explícita.
  // ---------------------------------------------------------------------------
  output: 'static',

  // ---------------------------------------------------------------------------
  //  Sesiones desactivadas
  // ---------------------------------------------------------------------------
  //  El adaptador de Cloudflare activa sesiones por defecto y exige un almacén
  //  KV llamado SESSION. Sin él, el despliegue falla.
  //
  //  Este sitio no las necesita: no hay usuarios que inicien sesión. El panel de
  //  edición se autentica contra GitHub con sus propias cookies, no con sesiones
  //  de Astro.
  //
  //  Menos recursos contratados es menos superficie que mantener y menos cosas
  //  que alguien tenga que entender dentro de dos años.
  // ---------------------------------------------------------------------------
  session: false,

  adapter: cloudflare({
    imageService: 'compile',
    // 'compile' optimiza las imágenes al compilar en vez de en cada visita.
    // Con contenido que cambia poco, evita consumir CPU del plan gratuito.
  }),

  integrations: [
    react(), // requerido por el panel de Keystatic, no por el sitio público
    markdoc(),
    keystatic(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: Object.fromEntries(IDIOMAS.map((i) => [i, i === 'es' ? 'es-MX' : 'en-US'])),
      },
    }),
  ],

  vite: {
    plugins: [yaml()], // permite importar los .yaml que escribe Keystatic
  },

  build: {
    inlineStylesheets: 'auto',
  },

  // ---------------------------------------------------------------------------
  //  Nota de privacidad técnica
  // ---------------------------------------------------------------------------
  //  Las tipografías se instalan como dependencia (@fontsource-variable) y se
  //  sirven desde el propio dominio. No se usa Google Fonts.
  //
  //  La razón no es de rendimiento sino de protección de datos: enlazar a
  //  Google Fonts hace que el navegador de cada visitante envíe su dirección IP
  //  a un tercero antes de que nadie haya aceptado nada. Autoalojarlas elimina
  //  esa transferencia y simplifica el aviso de privacidad.
  // ---------------------------------------------------------------------------
});
