import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTrafficManagement } from './smart-traffic-management';

describe('SmartTrafficManagement', () => {
  let component: SmartTrafficManagement;
  let fixture: ComponentFixture<SmartTrafficManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTrafficManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(SmartTrafficManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
