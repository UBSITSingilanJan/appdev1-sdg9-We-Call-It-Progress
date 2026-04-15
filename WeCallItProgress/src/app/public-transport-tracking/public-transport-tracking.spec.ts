import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTransportTracking } from './public-transport-tracking';

describe('PublicTransportTracking', () => {
  let component: PublicTransportTracking;
  let fixture: ComponentFixture<PublicTransportTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTransportTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicTransportTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
