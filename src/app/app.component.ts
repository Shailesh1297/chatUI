import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { WebSocketService } from './service/web-socket.service';
import { Message } from './models/message';
import { SessionInfo } from './models/sessionInfo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  userList: SessionInfo[] = [];
  recipientId: string = 'all';
  userAlias!: string;

  private activeUserSubscription!: Subscription;



  constructor(public webSocket: WebSocketService) { }

  ngOnInit(): void {
    this.activeUserSubscription = this.webSocket.activeUsers().subscribe((users: any)=>{
      this.userList = <SessionInfo[]> Object.values(users).filter((user: any)=> user.userId !== this.webSocket.getUserId);
    })
   }

   ngOnDestroy(): void {
    this.activeUserSubscription.unsubscribe();
  }

   setRecipient(id: string = 'all'): void {
      this.recipientId = id;
   }

  connect(): void {
    if (!this.webSocket.isConnected) {
      this.webSocket.connect(this.userAlias);
    }
  }

  refreshUserList(): void {
    if(this.webSocket.isConnected) {
      this.webSocket.getActives();
    }
  }

  disconnect(): void {
    if(this.webSocket.isConnected) {
      this.webSocket.disconnect();
    }
  }

  sendMessage(message: Message): void {
    if(this.recipientId == 'all'){
      this.webSocket.sendPublic(message);
    } else {
      this.webSocket.sendPrivate(message);
    }
  }

}
