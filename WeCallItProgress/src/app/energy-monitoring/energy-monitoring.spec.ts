import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyMonitoring } from './energy-monitoring';

describe('EnergyMonitoring', () => {
  let component: EnergyMonitoring;
  let fixture: ComponentFixture<EnergyMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergyMonitoring],
    }).compileComponents();

    fixture = TestBed.createComponent(EnergyMonitoring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
