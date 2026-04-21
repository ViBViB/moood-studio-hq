# MOOOD.STUDIO – NARRATIVE REVIEW PROTOCOL
**Role:** Strategy Director

## MANDATO: ASCETISMO VISUAL
La revisión de narrativa es un gate técnico de arquitectura y lógica conductual. Se realiza SIN colores, SIN layouts complejos y SIN imágenes. La estética debe ser puramente editorial (Helvetica Now, Blanco y Negro).

> [!IMPORTANT]
> El objetivo es evitar que el cliente se distraiga con el diseño antes de validar el fondo comunicativo.

## ESTRUCTURA DEL DIRECTORIO
Cada proyecto de narrativa debe vivir en:
`MOOOD.STUDIO-WEBSITE/proposals/narrative-reviews/[CLIENT-NAME]/`

## PROCESO DE PRODUCCIÓN (PASO A PASO)
1. **Crear Directorio:**
   `mkdir -p MOOOD.STUDIO-WEBSITE/proposals/narrative-reviews/[CLIENT-NAME]`

2. **Clonar Template:**
   `cp MOOOD.STUDIO-WEBSITE/proposals/_templates/narrative-review/narrative-review-template.html MOOOD.STUDIO-WEBSITE/proposals/narrative-reviews/[CLIENT-NAME]/review.html`

3. **Inyectar Contenido:**
   - Extraer el contenido limpio de `PROJECTS/[CLIENT-NAME]/03-NARRATIVE.md`.
   - Convertir Markdown a HTML (usando herramientas internas o manual si es necesario).
   - Sustituir `<!-- INJECT_CONTENT_HERE -->` en el archivo `review.html`.
   - Reemplazar las variables `{{ PROJECT_NAME }}` y `{{ VERSION }}`.

4. **Publicar:**
   - Git commit y Push.
   - La URL será `moood.studio/proposals/narrative-reviews/[CLIENT-NAME]/review.html`.

## LEYES DE CONTRASTE RIGUROSO
1. **Fondo:** `#FFFFFF` absoluto.
2. **Tipografía:**
   - H1: Helvetica Now Display Light (56px).
   - H2 (Secciones): Helvetica Now Display Light (32px) + Border Top.
   - Body: Helvetica Now Display Light (20px) | Opacidad 85%.
3. **Draft Signals:** Todo asset faltante debe aparecer con el tag `[CLIENT ASSET REQUIRED]` resaltado en el texto.

---
*Signed, Alberto Contreras – Strategic Office*
