import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPoolComponent } from './view-pool.component';
import {describe} from 'jasmine';
import {beforeEach} from 'jasmine';
import {expect} from 'jasmine';
import {it} from 'jasmine';

describe('ViewPoolComponent', () => {
  let component: ViewPoolComponent;
  let fixture: ComponentFixture<ViewPoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
