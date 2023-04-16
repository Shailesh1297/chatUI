import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultimediaChatBoardComponent } from './multimedia-chat-board.component';

describe('MultimediaChatBoardComponent', () => {
  let component: MultimediaChatBoardComponent;
  let fixture: ComponentFixture<MultimediaChatBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultimediaChatBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultimediaChatBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
