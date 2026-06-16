# Posts de Instagram — la primera cuadrícula (9 imágenes)

PNG **1080×1080, RGB sin alfa** (no se ven negras), fieles a la marca real:
fondo verde-cielo, hero lima, números navy, tarjetas blancas redondeadas, personajes 3D, wordmark itálico.

Vista rápida del conjunto: **`grid-preview.png`**.

| # | Archivo | Pilar | Gancho |
|---|---|---|---|
| 1 | `post1-gancho.png` | Datos | Radar 6 ejes — *"¿Sabes de verdad cómo juegas?"* |
| 2 | `post2-stats.png` | Datos | Dashboard — hándicap 7 + 56/51/41 |
| 3 | `post3-diagnostico.png` | Entrenador IA | *"Deja de practicar al azar"* — Prioridad 1: Putting |
| 4 | `post4-evolucion.png` | Datos | Evolución de score — *"Mejora con datos, no corazonadas"* |
| 5 | `post5-handicap.png` | Datos | *"¿Qué te falta para bajar a 10?"* — barras por meta |
| 6 | `post6-dato.png` | Datos | *"El dato que te cuesta más golpes"* — 41% up&down |
| 7 | `post7-party.png` | Social (anzuelo) | *"El que pierde, paga"* — Liga de amigos |
| 8 | `post8-drills.png` | Entrenador IA | *"50 ejercicios"* — dosis + métrica |
| 9 | `post9-fundadores.png` | CTA | *"Busco 50 fundadores en Morelia"* |

Captions listas para cada una en `../MENSAJES.md` → "Captions por imagen (las 9)".

## Orden y cadencia
Publica **1 → 9** en orden (lidera con datos, cierra con el CTA de fundadores).
A 3 posts/semana = 3 semanas de contenido. Intercala 2-3 stories/semana (tu tarjeta de ronda, encuestas).

## Editar / regenerar
Todo se genera con Pillow (incrusta tus PNG reales de `assets/`):
```bash
cd ~/claude/parfect/marketing/posts
python3 _build_posts.py     # regenera las 9 + grid-preview.png
```
Cambia textos/datos demo (7, 56%, 32.3 putts, scores…) en las funciones `p1..p9` de `_build_posts.py`.

## Nota
Datos **ilustrativos**. Cuando quieras, los cambio por tus números reales y regenero todo.
Tipografía del render: Arial Black/Bold (Inter no está instalada en esta Mac; el look pesado es casi idéntico).
