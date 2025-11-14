import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Install } from './install';

describe('Install', () => {
  let component: Install;
  let fixture: ComponentFixture<Install>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Install]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Install);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
