# Sitio web de Doctor Payaso A.C.

Sitio institucional de Doctor Payaso A.C., organización mexicana que lleva
payasos de hospital certificados a pacientes pediátricos.

**Este documento está escrito para quien herede el proyecto**, no para quien lo
construyó. Si estás leyendo esto porque alguien se fue y te tocó a ti: todo lo
que necesitas está aquí.

---

## Qué es esto, en una línea

Un sitio de HTML estático que se genera al compilar, se publica solo cuando
alguien edita contenido, y cuesta lo que cuesta el dominio.

## Cómo funciona

```
Alguien edita en el panel  →  se guarda como un commit en GitHub
                           →  Cloudflare lo detecta y reconstruye el sitio
                           →  el cambio está en línea en unos dos minutos
```

No hay base de datos de contenido. No hay servidor que mantener. No hay
actualizaciones de seguridad que aplicar cada mes. El contenido son archivos de
texto en un repositorio, y eso es deliberado: es lo que hace que el sitio siga
funcionando aunque nadie lo toque durante dos años.

## Piezas

| Pieza | Qué hace | Costo |
|---|---|---|
| **Astro** | Genera el sitio | Gratis, código abierto |
| **Keystatic** | El panel de edición | Gratis, código abierto |
| **GitHub** | Donde vive todo | Gratis |
| **Cloudflare Workers** | Publica el sitio | Gratis en este volumen |
| **Supabase** | Recibe los formularios | Ya contratado |
| **Resend** | Envía las notificaciones | Ya contratado |
| **Dominio** | `doctorpayaso.com` | ~MXN 205 al año |

---

## Arrancar en local

Requiere Node.js 20.11 o superior.

```bash
npm install
npm run dev
```

El sitio queda en `http://localhost:4321` y el panel en
`http://localhost:4321/keystatic`.

La primera vez, el panel guía la conexión con GitHub y genera solo las
variables de `.env`. No hay que inventarlas ni pedírselas a nadie.

```bash
npm run build     # compila y valida
npm run preview   # prueba local sobre el mismo motor que usa Cloudflare
```

---

## Publicar

Cloudflare reconstruye el sitio en cada cambio a la rama `main`. No hay que
correr ningún comando: publicar es aprobar un cambio.

Para desplegar a mano en caso de emergencia:

```bash
npm run deploy
```

---

## Reglas de trabajo

### 1. Ningún texto visible se escribe en el código

Si un texto está en un archivo `.astro`, la Administradora no lo puede cambiar y
alguien va a tener que pedir ayuda técnica para corregir una coma. Todo texto
que el visitante lee sale del panel.

Ese es el criterio único para decidir si algo va al modelo de contenido.

### 2. Ningún color se escribe a mano

Todos los colores salen de `src/styles/tokens.css`. Escribir `#f46262` dentro de
un componente crea una deuda que alguien paga dos años después sin saber por qué
el sitio dejó de verse coherente.

### 3. Las páginas nacen estáticas

Solo dos rutas se ejecutan en el servidor: el panel de edición y el envío de
formularios. Están marcadas explícitamente con `export const prerender = false`.

Es una lista blanca a propósito: si alguien agrega una página nueva, nace
estática salvo decisión consciente. Eso mantiene la factura de hospedaje en cero
y reduce la superficie expuesta.

### 4. Las reglas de publicación viven en un solo archivo

`src/lib/contenido.ts` decide qué se publica y qué no: un testimonio sin
autorización vigente no aparece, un logotipo con permiso vencido deja de
mostrarse solo, una imagen con personas identificables y sin folio de
consentimiento no se dibuja.

Esas reglas no están repetidas en cada página a propósito. Si lo estuvieran,
bastaría con que alguien creara una página nueva y las olvidara.

### 5. Las versiones están fijas

`package.json` no usa rangos (`^`, `~`). Un proyecto que puede pasar meses sin
mantenimiento no debe actualizarse solo. Actualizar es una decisión, no un
accidente.

---

## Estructura

```
keystatic.config.ts          El modelo de contenido. Empieza a leer aquí.
astro.config.mjs             Configuración del sitio
MODELO-DE-CONTENIDO.md       Qué puede editar cada quién, y por qué

src/
  contenido/                 Lo que escribe el panel. Son archivos YAML.
    cifras.yaml
    configuracion.yaml
    paginas/                 Las páginas del sitio
    sedes/  generaciones/  testimonios/  aliados/  informes/  faq/  equipo/
  lib/
    idioma.ts                Manejo de idiomas y fechas
    contenido.ts             Acceso al contenido y reglas de publicación
  layouts/Base.astro         Encabezado HTML común a todas las páginas
  components/                Piezas reutilizables
  pages/                     Una por dirección del sitio
    keystatic/               El panel
    api/keystatic/           API interna del panel
  styles/tokens.css          El sistema de diseño
  assets/                    Imágenes que sube el panel
```

---

## Seguridad

Controles mínimos que deben estar activos. No son opcionales.

- **Autenticación de dos factores obligatoria** a nivel organización de GitHub.
  El panel se autentica contra GitHub, así que GitHub es el perímetro de
  identidad del sitio completo.
- **Rama `main` protegida**: sin empujes directos, cambios por pull request.
- **Al menos dos administradores** en GitHub y en Cloudflare. Una sola persona
  con acceso es el modo más común en que una organización pierde su sitio.
- **Los secretos viven en Cloudflare**, nunca en el repositorio. El `.env` está
  excluido en `.gitignore` y debe seguir estándolo.
- **Las tipografías se sirven desde el propio dominio.** No se usa Google Fonts:
  enlazarlas haría que el navegador de cada visitante enviara su dirección IP a
  un tercero antes de aceptar nada.
- **Los formularios escriben desde el servidor**, nunca desde el navegador. La
  credencial de Supabase vive como secreto en Cloudflare y corresponde a un rol
  que solo puede insertar en el esquema `web`. Aunque se filtrara, no permite
  leer nada.

### Este repositorio es público

El código se publica bajo licencia MIT para garantizar que el sitio pueda
reconstruirse aunque la organización pierda acceso a sus cuentas. Ver
`MARCA-Y-CONTENIDO.md` para saber qué cubre la licencia y qué no.

Consecuencia práctica que hay que respetar siempre: **nunca se escribe en este
repositorio el nombre de un paciente, de un familiar o de un menor de edad.**
Los folios de consentimiento son identificadores de expediente con formato
`CONS-AAAA-###`, sin datos personales.

### Separación respecto de la intranet

El sitio web y la intranet de voluntarios son sistemas **separados y no
conectados**. Comparten proyecto de Supabase pero no comparten datos: el sitio
web escribe únicamente en su propio esquema, sin llaves foráneas ni funciones
compartidas con las tablas de la intranet.

Quien tenga acceso a este repositorio **no** tiene por ello acceso a los datos
de los voluntarios.

---

## Pendientes antes de publicar

Ninguno bloquea el desarrollo. Todos bloquean la publicación.

- [ ] Costo y duración de la certificación
- [ ] Esquema de becas
- [ ] Calendario de generaciones confirmado
- [ ] Estatus de donataria autorizada: número y fecha en el DOF
- [ ] Redacción final de las tres casillas de consentimiento, validada por la abogada
- [ ] Cartas de consentimiento fotográfico de las imágenes que muestran pacientes
- [ ] Autorización escrita de los seis logotipos de aliados
- [ ] Definición formal de «voluntario certificado» y «voluntario activo»
- [ ] Designación del responsable único de contenido

---

## Historia

Rediseño aprobado por Dirección General en agosto de 2026. La propuesta completa
y el análisis que la sustenta están en el repositorio de documentación del
proyecto.

Construido como trabajo voluntario. Si estás manteniéndolo, gracias.
