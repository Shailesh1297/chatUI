import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBoardComponent } from './chat-board.component';

describe('ChatBoardComponent', () => {
  let component: ChatBoardComponent;
  let fixture: ComponentFixture<ChatBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
