# Personajes (avatares) — recortes individuales

40 personajes recortados de los grids que generaste con Gemini, listos para pasar a la otra
conversación / agregar a la app.

- **`recortes/g-01..g-12.png`** — 12 personajes, los más grandes (~413 px de ancho). Mejor calidad.
- **`recortes/k-01..k-28.png`** — los 28 del contact sheet completo (~274 px). Cubre todo el set.
  (Varios `k-*` son los mismos personajes que los `g-*`, pero más chicos.)
- **`REFERENCIA.png`** — hoja con todos numerados, para referirte a cada uno por nombre.

## ⚠️ Sobre la resolución ("4K")
Estos salen a la **resolución nativa de Gemini** (~274–413 px), **no son 4K**. En esta máquina
solo hay edición básica (Pillow); **no hay generador ni upscaler con IA**, así que estirarlos a 4K
solo los hace borrosos (no se inventa detalle).
- Para los **avatares de la app** (se muestran a 36–200 px) esta resolución **sobra**.
- Para **4K real**, hay que **regenerar cada personaje individual** en Gemini, a marco completo
  (como ya tienes con `Gemini_Generated_Image_w2jj3a…` = la golfista de naranja, 1664×2540).

## Pendientes si los quieres "app-ready"
- Tienen **fondo de degradado** + un pequeño **círculo blanco** en una esquina (artefacto del grid).
  Para avatar limpio se necesita **fondo transparente** → requiere herramienta de recorte (rembg)
  o regenerarlos con fondo plano/removible.

## Regenerar (ruta recomendada para alta calidad)
En la conversación de Gemini, pide **un personaje por imagen, marco completo, fondo simple**,
usando la `REFERENCIA.png` como guía. Te puedo redactar la lista de prompts (uno por personaje).
