import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyToolbar } from './my-toolbar';

describe('MyToolbar', () => {
  let component: MyToolbar;
  let fixture: ComponentFixture<MyToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyToolbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
