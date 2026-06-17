# PARFECT — Plan completo del backend en Supabase

> **Qué es esto:** un mapa de extremo a extremo de lo que la app PARFECT necesita
> del backend (Supabase). Está pensado para que alguien que **no** es experto en
> Supabase pueda seguirlo paso a paso. Este documento **no** crea nada todavía:
> es la fase de planeación. La fase de "aplicar" (correr SQL, crear buckets) va
> después y se basa en esto.

## Resumen ejecutivo (léelo primero)

PARFECT hoy es una app **100% local**: todo vive en `localStorage` del teléfono
(clave `parfect_v1`). Hay una capa de nube **a medio conectar**:

- ✅ Existe `supabase/schema.sql` con 4 tablas (`profiles`, `rounds`,
  `practices`, `parties`), un trigger de alta de perfil y políticas RLS.
- ✅ Existe `js/cloud.js`: un módulo completo de auth + respaldo contra Supabase.
- ✅ Existe `js/config.js` con `SUPABASE_URL` / `SUPABASE_ANON_KEY` **vacíos**.
- ❌ **`cloud.js` nunca se invoca.** No hay una sola llamada a `Cloud.*` en
  `app.js` ni en ninguna vista. El login, el alta y el guardado siguen siendo
  locales (`actions.login` / `actions.signup` en `js/app.js`).
- ❌ Las **parties** se sincronizan por un **broker MQTT público**
  (`broker.emqx.io`, ver `js/sync.js`), **no** por Supabase, aunque la tabla
  `parties` ya está diseñada.
- ❌ El **feed social** es **simulado** (`FRIENDS_FEED`, un arreglo fijo en
  `js/views-home.js`). No hay amigos, likes ni comentarios reales en backend.
- ❌ Las **fotos/videos** de las rondas compartidas se guardan como **data-URL
  dentro de `localStorage`** (ver `parfectShareMedia` en `js/app.js`). No hay
  Storage.

**Conclusión:** el esquema actual es un buen punto de partida pero está
incompleto frente a lo que la app realmente hace. Las secciones 3–6 proponen el
esquema completo, las políticas de seguridad, el almacenamiento de archivos y
las decisiones pendientes.

---

## 1. INVENTARIO DE FUNCIONES (qué lee/escribe cada pantalla)

La app es un SPA vanilla. El estado global vive en `S` (= `Store.load()`), con
estas colecciones: `S.users`, `S.session`, `S.rounds`, `S.practices`,
`S.active` (ronda en curso), `S.parties`, `S.activeParty`, `S.events`,
`S.settings`. Cada `commit()` hace `Store.save(S)` (localStorage) y re-renderiza.

| # | Pantalla / función | Archivo principal | Lee de backend | Escribe a backend |
|---|---|---|---|---|
| 1 | **Landing / marketing** | `views-public.js` | nada | nada |
| 2 | **Alta de cuenta** (`signup`) | `app.js:254` | — | crea usuario + perfil (`profiles`); opcionalmente siembra rondas/prácticas demo |
| 3 | **Login** (`login`) | `app.js:235` | usuario por email + hash de contraseña | `S.session` |
| 4 | **Logout** | `app.js:278` | — | cierra sesión |
| 5 | **Inicio / dashboard** | `views-home.js` | rondas + prácticas del usuario, stats derivadas | nada |
| 6 | **Perfil + avatar** | `views-home.js`, `app.js:476+` | perfil (`name`,`hcp`,`goal`,`extra`) | `profiles` (avatar, clubs, cardSkin, etc.) |
| 7 | **Jugar ronda** (hoyo por hoyo) | `views-round.js`, `app.js:611` | campos/pares (bundled en código) | al terminar inserta en `rounds` |
| 8 | **Detalle / historial de rondas** | `views-round.js` | `rounds` del usuario | borrar ronda → delete en `rounds` |
| 9 | **Tracker de práctica** | `views-modules.js`, `app.js:742+` | `practices` del usuario | inserta en `practices` |
| 10 | **Sesión guiada / drills** | `drills-library.js`, `trainer.js`, `app.js:204` | drills (bundled), `extra.drillsDone` | `practices` + `extra.drillsDone` |
| 11 | **Coach IA / análisis** | `strategy.js`, `trainer.js` | rondas + prácticas (cálculo en cliente) | nada (todo es derivado) |
| 12 | **Academia** | `academy.js`, `views-coach.js`, `app.js:757` | lecciones (bundled), `extra.academy` | `extra.academy` (lección completada) |
| 13 | **Portal coach / alumnos** | `views-coach.js` | alumnos (hoy demo + cuentas locales), `extra.isCoach` | `extra.isCoach`, comentarios de coach |
| 14 | **Trofeos / logros** | `trophies.js`, `views-trophies.js` | rondas + prácticas (derivado) | nada |
| 15 | **Feed social** | `views-home.js:791` | hoy `FRIENDS_FEED` (demo) + tus rondas compartidas | likes (`extra.likes`), `extra.shared` |
| 16 | **Compartir ronda (foto/video)** | `views-home.js:843`, `app.js:100` | — | `rounds.media` (hoy data-URL local) → **debe ir a Storage** |
| 17 | **Liga de amigos / ranking** | `views-home.js:871` | hoy demo + tu mejor ronda | nada |
| 18 | **Eventos / torneos / calendario** | `app.js:339+`, `views-home.js` | `S.events`, `extra.events` | crear/borrar evento, unirse |
| 19 | **Parfect Party (en vivo)** | `views-party.js`, `party.js`, `sync.js` | estado de party (hoy MQTT) | estado de party (hoy MQTT) → **debe ir a `parties` + Realtime** |
| 20 | **Cuentas de apuestas** (La corta, Skins…) | `party.js` | estado de party | parte del estado de party |
| 21 | **Ajustes** (idioma/tema/entorno) | `app.js:458+` | `S.settings` | local del dispositivo (no necesita nube) |
| 22 | **Importar / exportar JSON** | `app.js`, `views-home.js:1097` | archivo JSON | localStorage (respaldo manual) |

---

## 2. ESTADO ACTUAL DE SUPABASE

### Lo que YA existe (en el repo)

| Elemento | Ubicación | Estado |
|---|---|---|
| Esquema SQL | `supabase/schema.sql` | tablas `profiles`, `rounds`, `practices`, `parties`; trigger `handle_new_user`; RLS; Realtime para `parties` |
| Cliente / SDK | `index.html:59` carga `@supabase/supabase-js@2` por CDN | cargado |
| Config de llaves | `js/config.js` → `window.PARFECT_CONFIG` | **VACÍO** (`SUPABASE_URL` y `SUPABASE_ANON_KEY` en `''`) |
| Capa de nube | `js/cloud.js` (módulo `Cloud`) | escrita pero **nunca llamada** |
| Guía de conexión | `SUPABASE_SETUP.md` | instrucciones para crear el proyecto y pegar llaves |

### Variables de entorno / llaves referenciadas

- `window.PARFECT_CONFIG.SUPABASE_URL` — referenciada en `cloud.js:8`.
- `window.PARFECT_CONFIG.SUPABASE_ANON_KEY` — referenciada en `cloud.js:8`.
- `service_role` — **no** se usa en el cliente (correcto; nunca debe ir en el cliente). `SUPABASE_SETUP.md` advierte explícitamente que no se comparta.

> Como las dos llaves están vacías, `Cloud.enabled()` devuelve `false` y la app
> corre 100% local. Esto es por diseño (degradación segura).

### Tablas referenciadas en el código

`cloud.js` lee/escribe estas tablas vía `sb.from(...)`:
- `profiles` (select/upsert), `rounds` (select/upsert/delete), `practices` (select/upsert/delete).
- `parties` **NO** se toca desde `cloud.js`; la sincronización real de parties es MQTT (`sync.js`). La tabla `parties` del esquema está **diseñada pero sin uso en el código**.

### Qué existe vs. qué falta

| Concepto | Esquema SQL | Usado por el código | Veredicto |
|---|---|---|---|
| `profiles` | ✅ | ✅ (cloud.js) | OK, pero `cloud.js` no se invoca |
| `rounds` | ✅ | ✅ (cloud.js) | le faltan columnas (`time`, `hole_offset`, `media`) — ver §6 |
| `practices` | ✅ | ✅ (cloud.js) | OK |
| `parties` | ✅ | ❌ (se usa MQTT) | tabla huérfana; decidir si se migra a Supabase |
| Storage (fotos/videos) | ❌ | ❌ (data-URL local) | **falta por completo** |
| Feed social real (posts/likes/follows) | ❌ | ❌ (demo `FRIENDS_FEED`) | **falta por completo** |
| Eventos / torneos | ❌ | ❌ (`S.events` local) | **falta**; hoy es local/demo |
| Coach ↔ alumno (relación real) | ❌ | ❌ (demo) | **falta** |

**Brecha más importante:** la integración cliente↔nube **no está activada**.
Aunque pegues las llaves, hoy `app.js` no llama a `Cloud.restore/signIn/signUp/
pushSoon`, así que nada subiría. Activar eso es trabajo de la fase de aplicación
(fuera del alcance de este plan, pero hay que tenerlo presente).

---

## 3. ESQUEMA PROPUESTO

Diseño guía: **lo central va en columnas** (lo que se filtra, ordena o une entre
usuarios); **lo accesorio va en `jsonb`** para crecer sin migraciones. Esto
respeta la decisión ya tomada en `schema.sql`.

### 3.1 `profiles` (1:1 con `auth.users`)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK → `auth.users(id)` on delete cascade | = uid de auth |
| `name` | `text` not null default 'Jugador' | se muestra en feed/party/leaderboard |
| `email` | `text` | copia de conveniencia |
| `hcp` | `int` not null default 18 | hándicap |
| `goal` | `int` not null default 13 | meta |
| `is_coach` | `boolean` not null default false | **promover de `extra` a columna**: se filtra para listar coaches |
| `avatar` | `int` default 0 | índice del avatar bundled (no archivo) |
| `extra` | `jsonb` not null default '{}' | todo lo demás (ver abajo) |
| `created_at` | `timestamptz` default now() | |

**Contenido de `extra` (lo que el código guarda hoy en el objeto usuario):**
`onboarded`, `clubs[]`, `avatarSex`, `avatarSkin`, `avatarHue`, `avatarEmoji`,
`golfer`, `cardSkin`, `academy{lessonId:true}`, `drillsDone{drill:date}`,
`likes{postId:true}`, `shared[roundId]`, `events[]`, `joinedEvents{}`.

> `is_coach` y `avatar` se "promueven" a columnas solo porque pueden necesitarse
> en consultas entre usuarios (listar coaches; pintar avatares en el feed). Si se
> prefiere no migrar, pueden quedarse en `extra` — es una decisión (ver §6).

Índice sugerido: `create index profiles_is_coach_idx on profiles(is_coach) where is_coach;`

### 3.2 `rounds`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `text` PK | = `Store.uid()` (id que ya genera la app) |
| `user_id` | `uuid` not null → `auth.users` cascade | dueño |
| `party_id` | `text` | si vino de una party |
| `course_id` | `text` | id de campo bundled (`campestre`, etc.) |
| `course` | `text` | nombre legible |
| `date` | `date` | |
| `time` | `text` | **NUEVO** — `app.js:613` lo guarda; el mapper actual lo pierde |
| `hole_offset` | `int` default 0 | **NUEVO** — hoyo de salida; el mapper lo pierde |
| `caption` | `text` | texto al compartir |
| `media` | `jsonb` | **NUEVO** — `{type, src}`; `src` debe ser **URL de Storage**, no data-URL |
| `holes` | `jsonb` not null default '[]' | arreglo hoyo-por-hoyo (par, score, tee, app, putts, dist, upDown…) |
| `created_at` | `timestamptz` default now() | |

Índices: `rounds_user_idx (user_id)`; útil además `rounds_user_date_idx (user_id, date desc)` para el historial; `rounds_party_idx (party_id)`.

### 3.3 `practices`

Igual que el esquema actual (ya correcto). Columnas: `id text PK`, `user_id uuid`,
`date`, `area`, `drill`, `attempts int`, `hits int`, `notes`, `created_at`.
Considerar añadir `minutes int` (el código guarda `minutes` en sesiones guiadas,
`app.js:214`) — hoy se perdería. Índice: `practices_user_idx (user_id)`, y opcional `(user_id, date)`.

### 3.4 `parties` (si se migra de MQTT a Supabase — ver §6)

El esquema actual ya es razonable. Columnas clave: `id uuid PK`, `code text unique`,
`host_user_id uuid`, `course`, `holes_count int`, `games jsonb`, `use_net bool`,
`players jsonb`, `holes jsonb`, `idx int`, `status text`, `rev int`, `updated_at`.
Para concurrencia tipo "last-writer-wins" (como hoy en MQTT) conviene además:
`ts bigint` (timestamp del cliente) y conservar `rev`. Índice: `parties_code_idx (code)`.

> Nota de modelado: `players` y `holes` van como `jsonb` porque la app trabaja el
> objeto party completo. Una versión "dura" futura los normalizaría a tablas
> `party_players` / `party_holes`, pero **no es necesario** para igualar el
> comportamiento actual.

### 3.5 Tablas NUEVAS para funciones hoy simuladas (opcionales, por fase)

Estas no existen ni en esquema ni en código real. Solo hacen falta si se quiere
un **feed social real** (hoy es demo). Marcar como **Fase 3** (decisión en §6).

**`posts`** (una ronda compartida al feed)
| Columna | Tipo |
|---|---|
| `id` text PK | |
| `user_id` uuid → auth.users cascade | |
| `round_id` text → rounds(id) | |
| `caption` text | |
| `media` jsonb (URL de Storage) | |
| `created_at` timestamptz default now() | |

Índice: `posts_created_idx (created_at desc)`.

**`likes`**
| Columna | Tipo |
|---|---|
| `post_id` text → posts(id) cascade | PK compuesta |
| `user_id` uuid → auth.users cascade | PK compuesta |
| `created_at` timestamptz | |
PK: `(post_id, user_id)` (evita doble like).

**`comments`**
`id text PK`, `post_id text → posts cascade`, `user_id uuid`, `text text`, `created_at`.

**`follows`** (para un feed de "amigos" real)
| Columna | Tipo |
|---|---|
| `follower_id` uuid → auth.users cascade | PK compuesta |
| `followee_id` uuid → auth.users cascade | PK compuesta |
PK: `(follower_id, followee_id)`.

**`events`** (torneos / clases — hoy `S.events` local)
`id text PK`, `host_user_id uuid`, `name`, `course_id`, `date`, `time`, `mode`,
`invitees jsonb`, `created_at`. Más tabla puente `event_rsvp(event_id, user_id, status)`.

**`coach_students`** (relación coach↔alumno — hoy demo)
`coach_id uuid`, `student_id uuid`, `status`, PK `(coach_id, student_id)`.
Y `coach_notes(id, coach_id, student_id, text, created_at)` para los comentarios.

---

## 4. AUTH Y SEGURIDAD (RLS)

### Dónde la app espera sesión iniciada

Todo lo que esté detrás del login: inicio, perfil, jugar/guardar rondas, tracker,
academia, feed, party, eventos, coach. La landing (`views-public.js`) es lo único
público. Hoy la "sesión" es `S.session` (local); con Supabase será
`auth.getSession()` (ya lo contempla `cloud.js:restore`).

**Auth a usar:** email + contraseña (ya implementado en `cloud.js`), con opción
de Google OAuth (mencionada en `SUPABASE_SETUP.md`). El trigger `handle_new_user`
crea el `profiles` automáticamente al registrarse. **Decisión pendiente:** ¿exigir
confirmación de correo? `cloud.js:signUp` ya maneja el caso `needsConfirm`.

### Políticas RLS por tabla

> ⚠️ **Regla de oro:** con RLS mal puesto, un usuario podría leer/editar datos de
> otro. Los puntos marcados con 🔴 son los que **exponen datos ajenos** si se
> equivocan.

| Tabla | SELECT (leer) | INSERT | UPDATE | DELETE | Riesgo |
|---|---|---|---|---|---|
| **`profiles`** | `true` (público: nombres/avatar en feed/party/leaderboard) | `auth.uid() = id` | `auth.uid() = id` | (cascade por auth) | 🟡 lectura pública es **intencional** pero significa que `email` queda visible a todos → **mover `email` fuera o no exponerlo** (ver §6) |
| **`rounds`** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | 🔴 si SELECT fuera `true`, cualquiera vería las rondas de todos |
| **`practices`** | `auth.uid() = user_id` | igual | igual | igual | 🔴 datos privados de entrenamiento |
| **`parties`** | `true` (modelo "por código", como hoy) | `auth.role()='authenticated'` | `auth.role()='authenticated'` | host únicamente (recomendado) | 🔴 hoy cualquier autenticado puede editar cualquier party; aceptable a corto plazo, endurecer a "solo miembros" después |
| **`posts`** (fase 3) | `true` o "solo de a quien sigo" | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | 🔴 define bien quién ve qué |
| **`likes`** | `true` | `auth.uid() = user_id` | — | `auth.uid() = user_id` | 🟡 |
| **`comments`** | `true` | `auth.uid() = user_id` | `auth.uid() = user_id` | autor o dueño del post | 🟡 |
| **`follows`** | `true` | `auth.uid() = follower_id` | — | `auth.uid() = follower_id` | 🟡 |
| **`events`** | autenticado / invitados | `auth.uid() = host_user_id` | host | host | 🟡 |
| **`coach_students`** | `auth.uid() in (coach_id, student_id)` | ambos consienten (ver §6) | — | cualquiera de los dos | 🔴 un coach NO debe poder agregarse alumnos sin consentimiento |
| **`coach_notes`** | `auth.uid() in (coach_id, student_id)` | `auth.uid() = coach_id` | coach | coach | 🔴 las notas del coach son sobre un alumno: solo esos dos las ven |

**Lo que ya trae `schema.sql` y está bien:** RLS habilitado en las 4 tablas,
políticas de `profiles`/`rounds`/`practices`/`parties` como arriba. El único
ajuste fuerte recomendado hoy es el de `email` en `profiles` (lectura pública).

**Punto crítico a NO equivocar:**
1. `rounds` y `practices` **deben** filtrar por `user_id` en SELECT. Si quedan en
   `using (true)`, expones el historial deportivo y de práctica de todos.
2. `coach_notes` y la relación coach↔alumno: cruzar mal el `auth.uid()` deja a un
   coach ver alumnos que no son suyos, o a cualquiera leer notas privadas.
3. La **`anon` key es segura** en el cliente **solo** porque RLS la contiene. Si
   alguna tabla queda sin RLS, esa tabla queda abierta a internet.

---

## 5. STORAGE (archivos)

### Qué archivos hay

| Archivo | Hoy | Debería |
|---|---|---|
| **Foto/video de ronda compartida** | data-URL en `localStorage` (`parfectShareMedia`, `app.js:100`; se guarda en `round.media.src`) | **bucket de Storage**; guardar solo la URL en `rounds.media` / `posts.media` |
| **Avatares** | índice a PNG **bundled** (`AVATARS[]`), no se suben | **no necesita Storage** (a menos que se quiera avatar subido por el usuario → entonces sí, ver §6) |
| **Fotos de campo** | imágenes estáticas en `assets/` | quedan en el repo; no necesitan Storage |

> El problema actual de las fotos/videos como data-URL es real: `app.js:315`
> ya tiene un `catch` para "espacio lleno" — `localStorage` se satura rápido con
> un video. Mover a Storage resuelve esto **y** es lo que permite que el feed
> funcione entre dispositivos/usuarios.

### Buckets propuestos

**Bucket `round-media`** (privado o público según la decisión del feed):
- Ruta sugerida: `round-media/{user_id}/{round_id}.{ext}`.
- Subida: cliente sube el archivo, recibe la URL pública (o firmada) y la guarda
  en `rounds.media`.

**Políticas de Storage** (van sobre `storage.objects`):
- **INSERT/UPDATE/DELETE:** solo el dueño →
  `bucket_id = 'round-media' and auth.uid()::text = (storage.foldername(name))[1]`
  (es decir, la primera carpeta de la ruta = su `user_id`).
- **SELECT (lectura):**
  - Si el bucket es **público** → lectura abierta (cualquiera con el link ve la
    foto). Simple, sirve para un feed social abierto. 🟡 las fotos son
    "adivinables" solo si conoces la ruta.
  - Si es **privado** → generar **URLs firmadas** al renderizar el feed, o
    política de SELECT que valide seguimiento/amistad. Más seguro, más trabajo.

> Recomendación: empezar **público** (igual que un feed estilo Instagram) salvo
> que André quiera que las rondas sean privadas por defecto (ver §6).

Límites a configurar en el bucket: tamaño máximo (p. ej. 25 MB para video corto)
y tipos MIME permitidos (`image/*`, `video/mp4`).

---

## 6. BRECHAS Y DECISIONES (lo que necesita decidir un humano)

Antes de escribir SQL "final", hay que resolver esto:

1. **¿Se activa de verdad la nube?** `cloud.js` existe pero **no se llama** desde
   `app.js`. Hoy login/alta son locales con contraseña hasheada en el dispositivo.
   ¿Migramos auth a Supabase (lo correcto) o seguimos local por ahora? Sin esto,
   el esquema no se usa. *(Es trabajo de implementación, pero define todo lo demás.)*

2. **Parties: ¿MQTT o Supabase?** Hoy funcionan por broker público
   (`broker.emqx.io`) sin backend. La tabla `parties` + Realtime ya está
   diseñada. ¿Migramos a Supabase (privado, confiable, requiere autenticación) o
   dejamos MQTT (funciona pero es público y best-effort)? `SUPABASE_SETUP.md`
   dice que la intención es migrar. Decide: **migrar ahora / después / nunca**.
   - Sub-decisión: si se migra, ¿los **invitados sin cuenta** pueden seguir
     uniéndose por código? Hoy sí (jugadores sin `userId`). Eso choca con RLS que
     exige `authenticated`. Hay que definir un modelo (¿parties legibles por
     `anon`? ¿código como secreto?).

3. **`email` público en `profiles`.** La política actual es SELECT `using (true)`
   para mostrar nombres. Eso **también expone el email** de todos. Decisión:
   - (a) quitar `email` de `profiles` (queda solo en `auth.users`, privado), o
   - (b) crear una **vista pública** que exponga solo `id, name, avatar, hcp` y
     dejar `profiles` con SELECT restringido. **Recomendado (b).**

4. **Feed social: ¿real o sigue demo?** Hoy `FRIENDS_FEED` es ficticio y los
   likes/posts son locales. Para un feed real hacen falta `posts`, `likes`,
   `comments`, `follows` (§3.5) y storage de media. ¿Es alcance ahora (Fase 3) o
   se deja simulado para el lanzamiento de 50 usuarios? *(Marketing apunta a un
   lanzamiento chico; quizá el feed real no es urgente.)*

5. **Eventos / torneos.** `S.events` es local y los invitados son nombres de
   `FRIENDS_FEED`. ¿Se vuelven reales (tabla `events` + RSVP) o siguen como
   organización local? Depende de #4.

6. **Coach ↔ alumno.** Hoy los alumnos son demo + cuentas locales del mismo
   dispositivo. Un portal real necesita `coach_students` con **consentimiento de
   ambos lados** (¿quién invita a quién? ¿el alumno acepta?). Definir el flujo
   antes de las RLS, porque es de los puntos 🔴 de exposición de datos.

7. **Columnas que el mapper actual pierde.** `cloud.js` (`roundToRow`) **no sube**
   `time`, `holeOffset` ni `media`, y `practices` no sube `minutes`. Si activamos
   la nube tal cual, esos datos se pierden en el viaje local→nube. Hay que:
   añadir las columnas (§3.2/§3.3) **y** corregir el mapper. Decidir si importan
   (sí, al menos `media` y `holeOffset`).

8. **Migración de datos existentes.** Usuarios que ya tienen rondas en
   `localStorage`: al activar la nube, ¿se suben sus datos locales a su cuenta
   nueva? `cloud.js` mira solo "lo del uid de la nube" — hay que definir el primer
   volcado (importar lo local al crear/iniciar sesión).

9. **Confirmación de correo.** ¿Obligatoria? Afecta el alta (`needsConfirm`) y la
   experiencia de los 50 primeros usuarios (fricción vs. seguridad).

10. **Borrado de cuenta / datos.** `cloud.js:wipeMine` borra rondas y prácticas
    pero no el perfil ni media en Storage. Definir el flujo de "borrar mi cuenta"
    completo (incluye limpiar Storage) — relevante para privacidad.

11. **`avatar` / `is_coach`: ¿columna o `extra`?** Propongo promoverlas a columnas
    (§3.1) por si se consultan entre usuarios. Si no habrá feed real ni listado de
    coaches, pueden quedarse en `extra` y no se migra nada. Decisión menor.

---

## Apéndice: orden sugerido de aplicación (cuando se decida avanzar)

1. Crear proyecto Supabase y pegar `SUPABASE_URL` + `anon key` en `js/config.js`
   (pasos en `SUPABASE_SETUP.md`).
2. Correr el esquema **revisado** (con las columnas nuevas de §3.2/§3.3 y el
   ajuste de `email` de §6.3). *No correr el `schema.sql` viejo tal cual sin esos
   ajustes.*
3. Crear el bucket `round-media` y sus políticas (§5).
4. **Activar `cloud.js`** en `app.js` (login/alta/restore/pushSoon) y corregir el
   mapper para no perder columnas (§6.7). *(Cambio de código — fuera de esta fase.)*
5. (Opcional, Fase 2) Migrar parties de MQTT a `parties` + Realtime (§6.2).
6. (Opcional, Fase 3) Feed/eventos/coach reales (§3.5) si se decide en §6.

> Este documento es solo planeación. No se creó ninguna tabla, bucket ni política.
