# Cómo poner las fotografías

Guía para cargar imágenes en el sitio. No requiere conocimientos técnicos.

---

## Antes de subir cualquier foto

**Regla que no se salta nunca:** si en la fotografía se distingue el rostro de
un paciente, de un familiar o de un menor de edad, tiene que existir una carta
de consentimiento firmada y vigente, y su folio debe capturarse junto a la
imagen.

Este repositorio es público y conserva todo el historial. Una foto que se sube
y se borra cinco minutos después sigue siendo recuperable para siempre.

---

## Preparar los archivos

| Uso | Proporción | Ancho recomendado | Formato |
|---|---|---|---|
| Foto principal de portada | Vertical 4:5 | 1200 px | JPG |
| Foto del método (cuadrada) | 1:1 | 1000 px | JPG |
| Retrato de testimonio | Horizontal 4:3 | 1200 px | JPG |
| Sedes | Horizontal 16:9 | 1200 px | JPG |
| Logotipos de aliados | Libre | 600 px | PNG con fondo transparente |

**Peso:** por debajo de 500 KB cada una. Una foto de 6 MB tarda en cargar y hace
que el visitante se vaya antes de ver el sitio. Si vienen directo de una cámara,
conviene reducirlas antes.

**Nombres de archivo:** minúsculas, sin acentos, sin espacios y sin nombres de
personas. `visita-hospital-monterrey.jpg`, no `Foto Ana García 2025.JPG`.

---

## Dónde va cada una

```
src/assets/
  hero/          Foto principal de la portada
  metodo/        Foto cuadrada del bloque "Nuestro método"
  testimonios/   Retratos de quienes dan testimonio
  sedes/         Una por ciudad
  aliados/       Logotipos de hospitales, empresas y universidades
  equipo/        Retratos del equipo
  og/            Imagen que se ve al compartir en redes
```

---

## Método 1 — Desde el panel de edición (recomendado)

Es la forma pensada para el día a día y la que usará la Administradora.

1. Entrar al panel en `/keystatic`
2. Abrir la página o la sección donde va la imagen
3. Arrastrar el archivo al recuadro de imagen
4. **Llenar el texto alternativo** — es obligatorio: describe la foto para quien
   no puede verla
5. Si aparecen personas identificables, marcar la casilla y capturar el folio de
   consentimiento con formato `CONS-AAAA-###`
6. Guardar

El panel sube el archivo, lo guarda en la carpeta correcta y publica el cambio.
En unos dos minutos está en línea. No hay que tocar nada más.

---

## Método 2 — Carga inicial de varias fotos a la vez

Para el primer llenado, cuando hay que subir muchas de golpe.

1. Copiar los archivos a las carpetas de arriba, en tu computadora
2. En GitHub Desktop: escribir un resumen y **Commit**, luego **Push origin**
3. Entrar al panel y, en cada sección, seleccionar la imagen ya subida
4. Llenar el texto alternativo y, si aplica, el folio de consentimiento

El paso 3 no se puede saltar: subir el archivo no lo coloca en la página. El
sitio solo muestra las imágenes que alguien eligió y describió.

---

## Por qué una imagen puede no aparecer

El sitio se niega a publicar una imagen en tres casos, a propósito:

1. **No está seleccionada** en la página desde el panel
2. **No tiene texto alternativo** — requisito de accesibilidad
3. **Muestra personas identificables y no tiene folio de consentimiento**

Si una foto no sale, casi siempre es la tercera.
