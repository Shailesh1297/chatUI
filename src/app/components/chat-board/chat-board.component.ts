import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/models/message';
import { WebSocketService } from 'src/app/service/web-socket.service';

@Component({
  selector: 'app-chat-board',
  templateUrl: './chat-board.component.html',
  styleUrls: ['./chat-board.component.scss']
})
export class ChatBoardComponent implements OnInit,OnChanges,OnDestroy {

  @Input() recipientId: string = 'all';
  @Output() sendMessage = new EventEmitter<Message>();

  message: string = '';
  filteredMessages: Message[] = [];
  private privateMessages: Message[] = [];
  private publicMessages: Message[] = [];
  private privateMessageSubscription!: Subscription;
  private publicMessageSubscription!: Subscription;

  constructor(public socket: WebSocketService) { }

  ngOnInit(): void {
    this.privateMessageSubscription = this.socket.listenPrivate().subscribe((message: Message)=>{
      this.privateMessages.push({...message});
      this.filterMessages();
    });

    this.publicMessageSubscription = this.socket.listenPublic().subscribe((message: any)=>{
      this.publicMessages.push({...message});
      this.filterMessages();
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['recipientId'].currentValue !== changes['recipientId'].previousValue) {
      this.filterMessages();
    }
  }

  filterMessages() {
    if(this.recipientId !== 'all') {
      this.filteredMessages = this.privateMessages.filter(msg => msg.recipientId == this.recipientId || msg.senderId == this.recipientId);
    } else {
      this.filteredMessages = this.publicMessages;
    }
  }

  relayMessage(): void {
    //create message object
    const msg: Message = {
      content: this.message,
      senderId: this.socket.getUserId!,
      recipientId: this.recipientId
    }
    this.sendMessage.emit(msg);
    this.resetChatField();
  }

  resetChatField(): void {
    this.message = '';
  }


  ngOnDestroy(): void {
    this.privateMessageSubscription.unsubscribe();
    this.publicMessageSubscription.unsubscribe();
  }


}
