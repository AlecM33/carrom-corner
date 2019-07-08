import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRoundComponent } from './view-round.component';

describe('ViewRoundComponent', () => {
  let component: ViewRoundComponent;
  let fixture: ComponentFixture<ViewRoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewRoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
