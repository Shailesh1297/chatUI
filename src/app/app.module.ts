import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ChatBoardComponent } from './components/chat-board/chat-board.component';
import { MultimediaChatBoardComponent } from './components/multimedia-chat-board/multimedia-chat-board.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatBoardComponent,
    MultimediaChatBoardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
