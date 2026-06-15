/* ============ Biblioteca de drills (50) ============
   cat: fw (fairways/driving) · gir (approach/hierros) · ud (up&down/juego corto) · putt */

const DRILL_CATS = [
  { id: 'fw', label: 'Fairways', art: 'driving' },
  { id: 'gir', label: 'GIR', art: 'approach' },
  { id: 'ud', label: 'Up & Down', art: 'short' },
  { id: 'putt', label: 'Putts', art: 'putting' },
];

const DRILL_LIBRARY = [
  // ---------- FAIRWAYS / DRIVING (13) ----------
  { cat: 'fw', name: 'Gate de salida', desc: 'Dos palos formando un pasillo hacia el objetivo. Trabaja tu línea de salida sin pensar en distancia.', dose: '3 × 10 bolas', metric: '≥ 7/10 por el pasillo' },
  { cat: 'fw', name: 'Pies juntos', desc: 'Pega drives con los pies casi juntos: encuentras el centro de la cara y suavizas el tempo.', dose: '2 × 10', metric: 'Contacto sólido 8/10' },
  { cat: 'fw', name: '9 ventanas', desc: 'Combina 3 alturas × 3 curvas (draw / recto / fade). Domina tu cara y tu path.', dose: '9 bolas', metric: '6/9 ventanas' },
  { cat: 'fw', name: 'Step drill', desc: 'Da un paso con el pie de adelante al iniciar la bajada: sientes la secuencia y el peso.', dose: '15 swings', metric: 'Secuencia fluida' },
  { cat: 'fw', name: 'Headcover afuera', desc: 'Pon el headcover por fuera de la bola; si lo golpeas, vienes "por fuera". Corrige el slice.', dose: '20 swings', metric: 'Sin tocarlo' },
  { cat: 'fw', name: 'Toalla en las axilas', desc: 'Una toalla bajo ambos brazos mantiene la conexión cuerpo-brazos.', dose: '2 × 8', metric: 'No se cae' },
  { cat: 'fw', name: 'Tempo 3:1', desc: 'Cuenta "uno-dos-tres" al subir y "uno" al bajar. Ritmo constante.', dose: '15 bolas', metric: 'Mismo tempo' },
  { cat: 'fw', name: 'Pausa arriba', desc: 'Haz una pausa de 1 seg en el tope del backswing para frenar el overswing.', dose: '12 bolas', metric: 'Backswing controlado' },
  { cat: 'fw', name: 'Driver vs Madera 3', desc: 'Alterna y compara tu dispersión real. Aprende cuándo el driver no paga.', dose: '5 + 5', metric: 'M3 < 60% de la dispersión del driver' },
  { cat: 'fw', name: '14 calles', desc: 'Simula las 14 salidas de una ronda a calles imaginarias, cambiando objetivo cada bola.', dose: '14 bolas', metric: '≥ 9/14' },
  { cat: 'fw', name: 'Varilla de start line', desc: 'Una varilla 2 m delante marca tu línea de salida. Valida tu dirección inicial.', dose: '10 bolas', metric: '8/10 sobre la línea' },
  { cat: 'fw', name: 'Velocidad (overspeed)', desc: 'Swings máximos sin bola con palos de distinto peso para ganar velocidad.', dose: '3 × 5 · 2/semana', metric: '+2 mph en el mes' },
  { cat: 'fw', name: 'Tee alto / tee bajo', desc: 'Cambia la altura del tee para controlar tu ángulo de ataque y el spin.', dose: '10 bolas', metric: 'Sientes la diferencia' },

  // ---------- GIR / HIERROS (12) ----------
  { cat: 'gir', name: 'Escalera de distancias', desc: 'Mismo hierro a 3 distancias distintas sin repetir. Calibra tu distancia real, no la de tu mejor golpe.', dose: '3 × 9', metric: '≥ 6/9 a < 10 m' },
  { cat: 'gir', name: 'Reloj de wedges', desc: 'Define backswing 8:00 / 9:00 / 10:00 y mide cuánto vuela cada uno. Es tu matriz de scoring.', dose: '45 min · 1/semana', metric: 'Matriz de 9 distancias' },
  { cat: 'gir', name: 'Pin high', desc: 'Toma un palo más y pega al 80%. La mayoría falla corto, casi nunca largo.', dose: 'Próximas 2 rondas', metric: '≥ 50% pin-high o largo' },
  { cat: 'gir', name: 'Divot delante', desc: 'Pon un tee 5 cm delante de la bola; tu divot debe empezar en la bola o después.', dose: '15 bolas', metric: 'Divot delante de la bola' },
  { cat: 'gir', name: 'Spray en la cara', desc: 'Marca la cara con spray o talco y busca impactos en el centro.', dose: '20 bolas', metric: '12/20 centradas' },
  { cat: 'gir', name: 'Ventana de altura', desc: 'Pega a una altura objetivo (alto / medio / bajo) para controlar trayectoria con viento.', dose: '12 bolas', metric: '3 alturas claras' },
  { cat: 'gir', name: 'Banderas random', desc: 'Cambia de objetivo cada bola entre 3 banderas a distintas distancias.', dose: '3 × 9', metric: 'Sin repetir objetivo' },
  { cat: 'gir', name: 'Medio / tres cuartos', desc: 'Golpes parciales para control de distancia fino.', dose: '2 × 10', metric: 'Distancias consistentes' },
  { cat: 'gir', name: 'Lies en pendiente', desc: 'Practica con la bola arriba/abajo de los pies para approaches reales del campo.', dose: '12 bolas', metric: 'Contacto sólido en pendiente' },
  { cat: 'gir', name: 'Knockdown', desc: 'Golpe bajo de control: bola atrás, manos adelante, finish corto.', dose: '10 bolas', metric: 'Vuelo bajo y firme' },
  { cat: 'gir', name: 'Centro de green', desc: 'En el campo apunta SIEMPRE al centro del green y mide cuánto sube tu GIR.', dose: '2 rondas', metric: 'GIR +5%' },
  { cat: 'gir', name: 'Compresión con moneda', desc: 'Una moneda detrás de la bola; tócala después de la bola, no antes.', dose: '15 bolas', metric: 'Bola primero, moneda después' },

  // ---------- UP & DOWN / JUEGO CORTO (12) ----------
  { cat: 'ud', name: 'Up & down challenge', desc: '9 posiciones aleatorias alrededor del green; juega cada una hasta embocar.', dose: '9 posiciones', metric: '≥ 5/9 up & down' },
  { cat: 'ud', name: 'Landing spot con toalla', desc: 'Coloca una toalla en el punto de bote ideal. El chip se controla por el bote, no por el vuelo.', dose: '3 × 8', metric: '5/8 botes en la toalla' },
  { cat: 'ud', name: 'Línea en el bunker', desc: 'Dibuja una línea 5 cm detrás de la bola y golpea la línea, no la bola.', dose: '20 swings + 15 bolas', metric: '10/15 fuera y en green' },
  { cat: 'ud', name: 'Chip con 3 palos', desc: 'Mismo chip con PW, 9 y 8 según el rodado que necesitas. El bote manda.', dose: '3 × 6', metric: 'Eliges el palo correcto' },
  { cat: 'ud', name: 'Reloj del green', desc: '8 posiciones tipo reloj alrededor del green; sube y emboca.', dose: '1 vuelta', metric: '≥ 5/8 a < 1 m' },
  { cat: 'ud', name: 'Flop control', desc: 'Cara abierta, golpe alto y suave para pasar obstáculos cerca de bandera.', dose: '12 bolas', metric: 'Alto y blando' },
  { cat: 'ud', name: 'Rough espeso', desc: 'Salidas de lie difícil con cara abierta y golpe firme.', dose: '12 bolas', metric: '8/12 en green' },
  { cat: 'ud', name: 'Bump and run', desc: 'Chip rodado bajo con hierro medio: el golpe más confiable bajo presión.', dose: '3 × 8', metric: 'Rodado predecible' },
  { cat: 'ud', name: 'Par 18', desc: '9 chips/pitches distintos jugados a hoyo. Cuenta tu score (par 2 por hoyo).', dose: '9 hoyos', metric: 'Bajar de 20 golpes' },
  { cat: 'ud', name: 'Distancias de pitch', desc: '5 / 10 / 15 m con el mismo wedge, sin repetir distancia.', dose: '3 × 6', metric: '≥ 4/6 a < 2 m' },
  { cat: 'ud', name: 'Bunker largo', desc: 'Salidas de arena de 30-40 m: más cara abierta y más giro de cuerpo.', dose: '12 bolas', metric: '8/12 en green' },
  { cat: 'ud', name: 'Cuesta arriba / abajo', desc: 'Chips en pendiente para ajustar bote y rodado a la inclinación.', dose: '12 bolas', metric: 'Control en pendiente' },

  // ---------- PUTTS (13) ----------
  { cat: 'putt', name: 'Gate de putter', desc: 'Dos tees apenas más anchos que tu putter a 1 m. Automatiza el putt que NUNCA debes fallar.', dose: '3 × 10', metric: '≥ 9/10 embocados' },
  { cat: 'putt', name: 'Lag a círculo de 1 m', desc: 'Desde 10-15 m, deja todo dentro de un círculo de 1 m. Elimina el 3-putt.', dose: '3 × 6', metric: '≥ 5/6 dentro' },
  { cat: 'putt', name: 'Reloj de 1.5 m', desc: '8 putts alrededor del hoyo. Termina la vuelta sin fallar o empieza de nuevo.', dose: '2 vueltas', metric: '14/16' },
  { cat: 'putt', name: 'Escalera de distancia', desc: '3 / 6 / 9 m controlando velocidad. Nunca dejes el putt corto.', dose: '3 × 3', metric: 'Todos pasan el hoyo' },
  { cat: 'putt', name: 'Línea de tee', desc: 'Apunta el logo de la bola a un tee 30 cm delante. Valida tu línea de salida.', dose: '10 putts', metric: '8/10 sobre el tee' },
  { cat: 'putt', name: 'Ojos cerrados', desc: 'Putts cortos con los ojos cerrados para sentir el golpe puro y el cara cuadrada.', dose: '2 × 8', metric: 'Predices dónde va' },
  { cat: 'putt', name: 'Moneda objetivo', desc: 'Lag a una moneda en vez del hoyo para afinar la velocidad pura.', dose: '3 × 6', metric: 'A < 30 cm de la moneda' },
  { cat: 'putt', name: 'Espejo de alineación', desc: 'Sobre un espejo de putt: ojos sobre la bola y hombros cuadrados.', dose: '5 min', metric: 'Setup repetible' },
  { cat: 'putt', name: 'Una mano', desc: 'Putts cortos solo con la mano baja para mejorar el toque y la cara.', dose: '2 × 10', metric: 'Golpe suave' },
  { cat: 'putt', name: 'Doble gate', desc: 'Un gate en el putter y otro en el hoyo: controlas cara y path a la vez.', dose: '3 × 8', metric: 'Pasa ambos gates' },
  { cat: 'putt', name: '100 cortos', desc: '100 putts de 1 m al día. Convierte el putt corto en automático.', dose: 'Diario', metric: '95/100' },
  { cat: 'putt', name: 'Around the world', desc: 'Da la vuelta al hoyo embocando desde 1 m en cada punto del reloj.', dose: '1 vuelta', metric: 'Vuelta limpia' },
  { cat: 'putt', name: '3 lags largos', desc: '15 / 20 / 25 m, todos a distancia de dada (gimme).', dose: '3 × 3', metric: 'Todos a < 1 m' },
];
