# De un prototipo a un universo musical

## Problema

La base tenía una pantalla de contador, un formulario sin autenticación y enlaces de navegación incompletos. El objetivo es que alguien que evalúa el portafolio pueda recorrer una experiencia de datos musicales sin necesitar cuenta ni autorización de Spotify.

## Solución

La bienvenida presenta una demo pública junto a la conexión real. El dashboard separa resumen, canciones, artistas y actividad reciente. Un selector cambia los rankings por período y conserva la selección en la URL. Se utiliza una interfaz MusicProvider para que el contenido de prueba y la API compartan presentación.

## Diseño

Dirección glassmorphism oscuro, apoyada en Designly (jerarquía y composición) e Impeccable (craft y estados): fondo carbón, vidrio ahumado, acentos verde pálido y portadas como contenido central. El artista favorito es el único foco dominante del resumen. Las listas tienen menor peso visual y densidad suficiente para comparar. El vidrio aporta profundidad a los contenedores sin poner desenfoque en cada fila.

La demo usa músicos ficticios y portadas SVG originales. Se evita sugerir que esos rankings corresponden a una cuenta real. En móvil la navegación se convierte en una fila de accesos y el contenido en una columna. El teclado tiene foco visible; la alternativa sin blur mantiene superficies opacas.

## Integración y privacidad

OAuth PKCE evita almacenar secretos de cliente. La app valida state, consume una transacción una vez y renueva tokens compartiendo la solicitud entre llamadas concurrentes. Las sesiones son por pestaña; cerrar sesión borra tokens y caché. Los errores distinguen conexión, sesión vencida, restricción y límite temporal.

## Alcance honesto

Los favoritos son rankings por afinidad, no conteos de escucha. No se inventan minutos totales ni tendencias históricas. El acceso de Spotify limita la conexión real; la demo hace el recorrido del portafolio independiente de ese acceso.

## Evolución

La siguiente mejora es PWA y preferencias locales. Persistir snapshots y comparar períodos sería una segunda etapa full stack. Un producto público requiere validar permisos de plataforma antes de invertir en infraestructura. El frontend mantiene proveedores separados para permitir una fuente futura sin reescribir las vistas.
