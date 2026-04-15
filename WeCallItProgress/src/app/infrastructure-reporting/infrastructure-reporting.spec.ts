import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfrastructureReporting } from './infrastructure-reporting';

describe('InfrastructureReporting', () => {
  let component: InfrastructureReporting;
  let fixture: ComponentFixture<InfrastructureReporting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfrastructureReporting],
    }).compileComponents();

    fixture = TestBed.createComponent(InfrastructureReporting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
