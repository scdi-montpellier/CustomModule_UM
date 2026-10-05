/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarContainerAfterComponent } from './search-bar-container-after.component';

describe('SearchBarContainerAfterComponent', () => {
  let component: SearchBarContainerAfterComponent;
  let fixture: ComponentFixture<SearchBarContainerAfterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarContainerAfterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBarContainerAfterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
