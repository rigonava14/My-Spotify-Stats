import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Constellation } from './constellation';
import { demoArtists } from '../core/demo-provider';
describe('Constellation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }),
  );
  it('reveals the nearest artist and clears pointer effects on leave', () => {
    const fixture = TestBed.createComponent(Constellation);
    fixture.componentRef.setInput('artists', demoArtists);
    fixture.detectChanges();
    const map = fixture.nativeElement.querySelector('.star-map') as HTMLElement;
    spyOn(map, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 260,
    } as DOMRect);
    const c = fixture.componentInstance;
    c.move({
      currentTarget: map,
      clientX: 88,
      clientY: 65,
      pointerType: 'mouse',
    } as unknown as PointerEvent);
    expect(c.activeNode()?.artist.id).toBe(demoArtists[0].id);
    expect(c.cursor()).not.toBeNull();
    c.leave();
    expect(c.active()).toBeNull();
    expect(c.cursor()).toBeNull();
  });
  it('supports keyboard selection and small empty datasets', () => {
    const fixture = TestBed.createComponent(Constellation);
    fixture.componentRef.setInput('artists', demoArtists.slice(0, 1));
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.edges()).toEqual([]);
    c.focused.set(0);
    expect(c.activeNode()?.artist.name).toBe(demoArtists[0].name);
    fixture.componentRef.setInput('artists', []);
    fixture.detectChanges();
    expect(c.activeNode()).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('aparecerá');
  });
});
