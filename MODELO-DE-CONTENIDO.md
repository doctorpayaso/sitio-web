# Modelo de contenido — sitio web de Doctor Payaso A.C.

| Campo | Valor |
|---|---|
| Documento | DP-TEC-MODELO-CONTENIDO |
| Versión | 0.1 — borrador |
| Responsable | Saul Sánchez, voluntariado |
| Fecha | agosto de 2026 |
| Estado | **Propuesta pendiente de ratificación** |
| Archivo técnico asociado | `keystatic.config.ts` |

---

## 1. Para qué sirve este documento

Define qué puede cambiar el equipo de Doctor Payaso en el sitio web sin ayuda
de nadie, y qué no. Es el contrato entre la organización y su sitio.

La regla que ordena todo el diseño: **cada campo que existe es un campo que
alguien tiene que mantener.** Un modelo de contenido generoso produce un sitio
desactualizado. Uno acotado produce un sitio que envejece bien.

---

## 2. Qué puede hacer la Administradora, y qué no

### Puede, sin ayuda de nadie

- Cambiar cualquier texto de las seis páginas
- Subir, reemplazar y borrar fotografías
- Editar el título y la descripción que aparecen en Google, por página
- Abrir, cerrar y reprogramar generaciones de certificación
- Publicar el costo de la certificación y el esquema de becas
- Actualizar las cifras de impacto
- Subir el informe anual y capturar sus cifras clave
- Agregar y quitar aliados, testimonios y preguntas frecuentes
- Prender y apagar métodos de pago
- Traducir todo al inglés, cuando esa versión se active

### No puede — y es intencional

- Mover bloques de lugar o cambiar el orden de las secciones
- Modificar la maqueta, los colores o la tipografía
- Crear tipos de página nuevos
- Romper el sitio

Esa última garantía no viene de Keystatic: viene de que el contenido tiene un
**esquema tipado que se valida en cada compilación**. Si un campo obligatorio
queda vacío o un dato tiene el tipo equivocado, la compilación falla y el sitio
publicado sigue intacto. Es un control de integridad por diseño, no una promesa.

---

## 3. Ritmo de mantenimiento

Ordenado por frecuencia. Determina cómo está agrupado el panel.

| Contenido | Frecuencia | Quién |
|---|---|---|
| Generaciones: fechas, sedes, estado | 3–4 veces al año | Administradora |
| Cifras de impacto | Trimestral | Administradora, con aprobación |
| Costo de certificación y becas | 1–2 veces al año | Administradora |
| Informe anual y sus cifras clave | Anual | Administradora |
| Testimonios, aliados, preguntas frecuentes | Ocasional | Administradora |
| Textos de las seis páginas | Ocasional | Responsable de contenido |
| Ajustes generales, contacto, redes | Rara vez | Administradora |

---

## 4. Estructura

### Cosas de las que hay una sola

| En el panel | Archivo | Nota |
|---|---|---|
| Cifras de impacto | `src/contenido/cifras.yaml` | Fecha de corte obligatoria |
| Ajustes generales | `src/contenido/configuracion.yaml` | Contacto, redes, donataria |
| Inicio | `src/contenido/paginas/inicio.yaml` | |
| Qué es Clown Care | `src/contenido/paginas/clown-care.yaml` | |
| Certifícate | `src/contenido/paginas/certificate.yaml` | Página de conversión |
| Alianzas | `src/contenido/paginas/alianzas.yaml` | Página de conversión |
| Impacto y transparencia | `src/contenido/paginas/impacto.yaml` | |
| Donar | `src/contenido/paginas/dona.yaml` | |
| Contacto | `src/contenido/paginas/contacto.yaml` | |

### Cosas de las que hay muchas

| En el panel | Carpeta | Para qué |
|---|---|---|
| Sedes | `src/contenido/sedes/` | CDMX, Monterrey, Veracruz, Toluca, virtual |
| Generaciones | `src/contenido/generaciones/` | Una por sede y año |
| Módulos de certificación | `src/contenido/modulos/` | Los seis |
| Testimonios | `src/contenido/testimonios/` | Con control de autorización |
| Aliados | `src/contenido/aliados/` | Con control de autorización de logotipo |
| Informes anuales | `src/contenido/informes/` | Los once, 2015–2025 |
| Preguntas frecuentes | `src/contenido/faq/` | Agrupadas por página |
| Equipo | `src/contenido/equipo/` | Versión reducida en Fase 1 |

---

## 5. Controles incorporados al esquema

Estos no son campos decorativos. Cada uno responde a un riesgo identificado en
la propuesta aprobada por Dirección.

| Control | Dónde | Riesgo que mitiga |
|---|---|---|
| **Fecha de corte obligatoria** en las cifras | Cifras de impacto | Que un número envejezca en silencio. Con fecha visible, cualquiera nota si está viejo |
| **Aprobado por** | Cifras de impacto | Deja rastro de quién autorizó publicar el dato |
| **Texto alternativo obligatorio** en toda imagen | Todas | Accesibilidad AA, que está dentro del alcance de la Fase 1 |
| **¿Aparecen personas identificables?** + **folio de consentimiento** | Todas las imágenes | Publicación de imágenes de pacientes sin carta vigente. Riesgo de impacto «muy alto» del proyecto |
| **Autorización vigente** en testimonios | Testimonios | Uso de la voz de una persona sin permiso |
| **Autorización de uso del logotipo** + vigencia | Aliados | Uso indebido de marca de terceros |
| **Fuente de la cita** | Testimonios | Trazabilidad. Ninguna cita se redacta: se transcribe |
| **¿Ya se puede publicar el costo?** | Certifícate | Que el campo quede vacío. Apagado, el sitio dice «por confirmar» en vez de mostrar un hueco |
| **¿Publicar estatus de donataria?** | Ajustes generales | Que el sitio afirme deducibilidad antes de que esté confirmada |
| **Métodos de pago como lista explícita** | Donar | Anunciar un método que la pasarela no tiene habilitado |
| **Casilla de consentimiento como campo de texto obligatorio** | Los tres formularios | LFPDPPP: finalidad concreta y casilla nunca premarcada |

### Una limitación que conviene conocer

Keystatic no permite hacer un campo obligatorio **en función de** otro. Es
decir: no se puede forzar técnicamente que, al marcar «aparecen personas
identificables», el folio de consentimiento deje de estar vacío.

Ese control es **procedimental, no técnico**. Se sostiene en dos capas: queda
asentado en el manual de edición, y es verificable en la revisión del pull
request antes de publicar. Vale la pena decirlo con claridad en lugar de
presentar como automático algo que depende de que una persona lo revise.

---

## 6. La versión en inglés

### Qué se decidió y por qué

Keystatic no tiene localización nativa. Las dos formas de resolverlo son
duplicar el árbol de archivos por idioma, o repetir cada campo de texto una vez
por idioma dentro del mismo archivo.

**Se eligió la segunda.** La razón es de control de cambios: con árboles
separados, todo cambio estructural en español debe replicarse a mano en inglés,
y con el tiempo nadie lo hace — así es como una versión en inglés termina tres
años atrás de la española. Con campos repetidos, la estructura es física y
únicamente compartida: es imposible que las dos versiones diverjan.

### Qué significa hoy

Cada texto se guarda como `{ es: "…" }`. Cuando se active el inglés pasará a ser
`{ es: "…", en: "…" }`. **La forma del dato ya es la definitiva.** Por eso
activar el inglés no obliga a migrar ni un solo archivo de contenido.

El costo de esa decisión hoy: un nivel extra de anidamiento en el panel. Donde
habría un recuadro, hay un recuadro dentro de un grupo rotulado «Español». Es
un poco de ruido visual a cambio de que la Fase 2 no cueste una semana.

### Cómo se activa, cuando Dirección lo apruebe

1. En `keystatic.config.ts`, cambiar una línea:
   ```ts
   const IDIOMAS_ACTIVOS: readonly Idioma[] = ['es', 'en'] as const;
   ```
2. En `astro.config.mjs`, agregar `en` a la configuración de i18n con
   `prefixDefaultLocale: false`, para que el español siga en `/` y el inglés
   quede en `/en/`.
3. Traducir desde el panel. Cada campo muestra ahora dos recuadros.

Lo que **no** hay que hacer: tocar los archivos de contenido existentes,
duplicar carpetas, ni modificar las páginas de Astro.

### Comportamiento con textos sin traducir

El sitio cae al español cuando falta la traducción. Nunca muestra un espacio en
blanco. Esto permite publicar la versión en inglés de forma parcial e ir
completándola, en vez de tener que traducir todo antes de encender nada.

### Cómo se lee desde Astro

```ts
// src/lib/idioma.ts
export const IDIOMA_POR_DEFECTO = 'es' as const;

/** Devuelve el texto en el idioma pedido, con caída al español. */
export function t(
  campo: Record<string, string | undefined> | undefined,
  idioma: string = IDIOMA_POR_DEFECTO,
): string {
  if (!campo) return '';
  return campo[idioma] || campo[IDIOMA_POR_DEFECTO] || '';
}
```

```astro
---
import { t } from '../lib/idioma';
import inicio from '../contenido/paginas/inicio.yaml';
const idioma = Astro.currentLocale ?? 'es';
---
<h1>{t(inicio.hero.titulo, idioma)}</h1>
```

---

## 7. Qué queda fuera, a propósito

Alineado con el alcance de la Fase 1 aprobado por Dirección:

- Blog e histórico de publicaciones
- Tienda en línea
- Perfiles completos de equipo
- Página por sede para búsqueda local
- Visualizaciones interactivas de los informes
- Área privada de voluntarios — eso vive en la intranet, que es un sistema
  separado y no conectado

**Nota de alcance:** el modelo ya soporta el inglés, pero soportarlo no es lo
mismo que aprobarlo. La versión en inglés sigue siendo Fase 2. Que la
herramienta lo permita no debe convertirse por sí solo en un compromiso de
entrega.

---

## 8. Decisiones que este modelo deja abiertas

| # | Decisión | Quién |
|---|---|---|
| 1 | Definición formal de «voluntario certificado» y «voluntario activo», para poder respaldar 1,200 y 600 ante un aliado | Saul, con ratificación del Consejo |
| 2 | Si «FELICIDAD QUE SIRVE» convive con el eslogan | Dirección |
| 3 | Costo y duración de la certificación | Doctor Payaso |
| 4 | Existencia y mecánica del esquema de becas | Doctor Payaso |
| 5 | Estatus de donataria autorizada: número y fecha en el DOF | Doctor Payaso |
| 6 | Redacción final de las tres casillas de consentimiento | La abogada |
| 7 | Quién es el responsable único de contenido | Dirección |

Ninguna bloquea el desarrollo. Todas bloquean la publicación.

---

## 9. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | ago 2026 | Versión inicial, derivada del prototipo aprobado |
