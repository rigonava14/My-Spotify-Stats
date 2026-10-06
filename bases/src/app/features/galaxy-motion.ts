import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';

/** One ambient scene shared across routes; content never depends on animation. */
@Component({
  selector: 'app-galaxy-motion',
  template: `
    <div class="cosmos" aria-hidden="true">
      <div class="cosmos-nebula"></div>
      <div class="cosmos-orbit"></div>
      <div class="cosmos-stars">
        @for (star of stars; track $index) {
          <i
            [style.left.%]="star.x"
            [style.top.%]="star.y"
            [style.width.px]="star.size"
            [style.height.px]="star.size"
            [style.animation-delay.s]="star.delay"
          ></i>
        }
      </div>
    </div>
    <div class="orbital-progress" aria-hidden="true"></div>
  `,
})
export class GalaxyMotion {
  readonly stars = Array.from({ length: 56 }, (_, i) => ({
    x: (i * 43 + 9) % 100,
    y: (i * 67 + 3) % 100,
    size: i % 8 === 0 ? 2 : 1,
    delay: -(i % 11),
  }));
  private readonly destroy = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const root = document.documentElement;
      const preference = matchMedia('(prefers-reduced-motion: reduce)');
      const seen = new WeakSet<Element>();
      const animations = new Set<Animation>();
      let frame = 0;
      let pointerX = 50;
      let pointerY = 50;
      const render = () => {
        frame = 0;
        if (preference.matches || document.hidden) return;
        root.style.setProperty(
          '--cosmic-scroll',
          `${Math.min(scrollY * 0.12, 160)}px`,
        );
        root.style.setProperty('--cosmic-x', `${(pointerX - 50) * 0.12}px`);
        root.style.setProperty('--cosmic-y', `${(pointerY - 50) * 0.12}px`);
        const distance = root.scrollHeight - innerHeight;
        root.style.setProperty(
          '--journey',
          String(distance > 0 ? Math.min(scrollY / distance, 1) : 0),
        );
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(render);
      };
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle(
              'in-cosmic-view',
              entry.isIntersecting,
            );
            if (
              !entry.isIntersecting ||
              seen.has(entry.target) ||
              preference.matches
            )
              continue;
            seen.add(entry.target);
            const animation = entry.target.animate(
              [
                {
                  opacity: 0.65,
                  transform:
                    'perspective(1000px) rotateX(3deg) translateY(18px)',
                  clipPath: 'inset(0 0 4% 0 round 16px)',
                },
                {
                  opacity: 1,
                  transform: 'perspective(1000px) rotateX(0) translateY(0)',
                  clipPath: 'inset(0 round 16px)',
                },
              ],
              { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            );
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          }
        },
        { threshold: 0.08 },
      );
      const observed = new WeakSet<Element>();
      const scan = () => {
        document
          .querySelectorAll(
            '.glass:not(.sidebar), .welcome-copy, .page-heading, .about > section',
          )
          .forEach((el) => {
            if (!observed.has(el)) {
              observed.add(el);
              observer.observe(el);
            }
          });
        schedule();
      };
      const mutations = new MutationObserver(scan);
      mutations.observe(document.body, { childList: true, subtree: true });
      const pointer = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || preference.matches) return;
        pointerX = (event.clientX / innerWidth) * 100;
        pointerY = (event.clientY / innerHeight) * 100;
        const panel = (event.target as Element).closest<HTMLElement>('.glass');
        if (panel) {
          const rect = panel.getBoundingClientRect();
          panel.style.setProperty(
            '--light-x',
            `${((event.clientX - rect.left) / rect.width) * 100}%`,
          );
          panel.style.setProperty(
            '--light-y',
            `${((event.clientY - rect.top) / rect.height) * 100}%`,
          );
        }
        schedule();
      };
      const visibility = () => {
        root.classList.toggle('cosmos-paused', document.hidden);
        schedule();
      };
      const reduced = () => {
        if (preference.matches) {
          animations.forEach((animation) => animation.cancel());
          animations.clear();
          ['--cosmic-scroll', '--cosmic-x', '--cosmic-y', '--journey'].forEach(
            (name) => root.style.removeProperty(name),
          );
        } else schedule();
      };
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });
      addEventListener('pointermove', pointer, { passive: true });
      document.addEventListener('visibilitychange', visibility);
      preference.addEventListener('change', reduced);
      scan();
      this.destroy.onDestroy(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        mutations.disconnect();
        animations.forEach((animation) => animation.cancel());
        removeEventListener('scroll', schedule);
        removeEventListener('resize', schedule);
        removeEventListener('pointermove', pointer);
        document.removeEventListener('visibilitychange', visibility);
        preference.removeEventListener('change', reduced);
      });
    });
  }
}
