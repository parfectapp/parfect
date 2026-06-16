# Capturas reales de la app

PNG **1080×2346** (vertical 9:16), renderizado real de la app en vivo — con Inter, ilustraciones 3D
y el fondo inmersivo. Son tu app, no recreaciones.

| Archivo | Pantalla |
|---|---|
| `shots/01-inicio.png` | Dashboard (hándicap + stats + últimas rondas) |
| `shots/02-social.png` | Torneo en juego + Liga de amigos |
| `shots/03-diagnostico.png` | Diagnóstico IA generado (Prioridad 1 Putting + drills) |
| `shots/04-objetivos.png` | Trofeos míticos / progreso |
| `shots/05-ronda.png` | Dashboard (variante) |

## Listas para
- **Instagram Stories / Reels** y **TikTok**: el formato 9:16 va directo, sin editar.
- **Feed**: se pueden enmarcar en 1080×1350 sobre fondo de marca + titular (lo hago si quieres).

## Cómo se generan
`_shots.swift` (WKWebView) abre `http://localhost:4173`, ejecuta `seedDemoAccount()`, navega por
las vistas y guarda cada captura a 1080 de ancho.
```bash
# 1) la app debe estar sirviéndose en localhost:4173 (preview o: python3 -m http.server 4173)
cd ~/claude/parfect/marketing/shots
swiftc -O _shots.swift -o _shots && ./_shots
```
Edita la lista `steps` en `_shots.swift` para capturar otras pantallas (Academia, Party, una ronda, etc.).

## Nota
Datos = cuenta demo (`seedDemoAccount`). Para capturas con tus números reales, inicia sesión con tu
cuenta en el navegador y captura desde ahí, o ajusto el script para tu usuario.
