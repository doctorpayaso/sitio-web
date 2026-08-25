/// <reference types="astro/client" />

/**
 * Los archivos de contenido son YAML que escribe el panel de Keystatic.
 * TypeScript no los conoce de fábrica, así que hay que declararlos.
 *
 * Se tipan como `any` a propósito: la validación real del contenido la hace
 * Keystatic contra el esquema de `keystatic.config.ts`, que es donde vive el
 * contrato. Duplicar aquí esa definición crearía dos fuentes de verdad que
 * inevitablemente se desincronizarían.
 */
declare module '*.yaml' {
  const contenido: any;
  export default contenido;
}

declare module '*.yml' {
  const contenido: any;
  export default contenido;
}
