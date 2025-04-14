import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelPolicyComponent } from './label-policy.component';

describe('LabelPolicyComponent', () => {
  let component: LabelPolicyComponent;
  let fixture: ComponentFixture<LabelPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelPolicyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabelPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
