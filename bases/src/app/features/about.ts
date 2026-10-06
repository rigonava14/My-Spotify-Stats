import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  template: `<main class="about glass">
    <a
      class="quiet-link"
      routerLink="/dashboard"
      [queryParams]="{ source: 'demo' }"
      >← Volver a la demo</a
    >
    <h1>Un mapa de tu universo musical.</h1>
    <p class="lead">
      Mood.i es un proyecto de portafolio para explorar cómo una interfaz puede
      convertir datos musicales en una experiencia personal y fácil de leer.
    </p>
    <h2>El problema</h2>
    <p>
      Un ranking tiene poco valor si no puedes entenderlo de un vistazo. Esta
      app organiza canciones, artistas y actividad reciente con una jerarquía
      clara, sin atribuir a Spotify métricas que no proporciona.
    </p>
    <h2>Las decisiones</h2>
    <p>
      Angular standalone y signals para el estado. Proveedores separados para
      demo y Spotify. Vidrio ahumado para dar profundidad a los contenedores,
      con superficies opacas bajo el texto y navegación adaptable al móvil.
    </p>
    <h2>Datos y privacidad</h2>
    <p>
      La demo usa nombres ficticios y arte vectorial original. La conexión real
      usa OAuth con PKCE; nunca solicitamos tu contraseña. Los tokens permanecen
      en la sesión de esta pestaña, se eliminan al cerrar sesión y no se envían
      a un backend propio.
    </p>
    <h2>Lo que significan los rankings</h2>
    <p>
      Los favoritos representan afinidad calculada por Spotify para
      aproximadamente cuatro semanas, seis meses o un año. No son cantidades de
      reproducciones. La actividad reciente tampoco constituye un historial
      completo.
    </p>
    <h2>Acceso a Spotify</h2>
    <p>
      La conexión está sujeta a los permisos y restricciones del modo de
      desarrollo de Spotify. La demo está disponible sin cuenta. Este proyecto
      es independiente y no está afiliado con Spotify.
    </p>
    <a
      class="button primary"
      routerLink="/dashboard"
      [queryParams]="{ source: 'demo' }"
      >Explorar el resultado</a
    >
  </main>`,
})
export class About {}
