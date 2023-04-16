import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { WebRTCService } from '../../service/web-rtc.service';
import { WebSocketService } from '../../service/web-socket.service';
import { Codecs } from '../../enums';
import { SessionInfo } from 'src/app/models/sessionInfo';

@Component({
  selector: 'app-multimedia-chat-board',
  templateUrl: './multimedia-chat-board.component.html',
  styleUrls: ['./multimedia-chat-board.component.scss']
})
export class MultimediaChatBoardComponent implements OnInit, OnDestroy {

  @Input() recipient!: SessionInfo;

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  supportedCodecTypes!: string [];

  //recorder
  isRecording: boolean = false;
  recordedBlobs: Blob[] = [];
  selectedCodec!: string;
  mediaRecorder!: MediaRecorder;

  signalSubscription!: Subscription;
  remoteStreamSubscription!: Subscription;

  private mediaConstraints = {
    video: true,
    audio: false
  }

  private localStream!: MediaStream;
  private remoteStream!: MediaStream;

  constructor(
    public webRtc: WebRTCService,
    public socket: WebSocketService) { }

    ngOnInit(): void {
      this.getSupportedCodecTypes();
      this.signalSubscription = this.socket.listenWebRTCSignal().subscribe(signal =>{
        this.handleSignal(signal);
      });

      this.remoteStreamSubscription = this.webRtc.getRemoteStream().subscribe(event => {
        this.remoteStream = event.streams[0];
        this.remoteVideo.nativeElement.autoplay = true;
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      });
    }

    ngOnDestroy(): void {
      this.signalSubscription.unsubscribe();
      this.remoteStreamSubscription.unsubscribe();
    }

    callUser() {
      const signal = {
        type: 'create',
        receiver: this.recipient.sessionId,
        sender: this.socket.getSessionId
      }
      this.handleSignal(signal);
    }

    //recorder start
    toggleRecorder(): void {
      this.isRecording = !this.isRecording;
      if(this.isRecording) {
        this.startRecorder();
      } else {
        this.stopRecorder();
      }
    }

    startRecorder(): void {
      this.recordedBlobs = [];
      const codecType = this.selectedCodec;
      const options: MediaRecorderOptions = { mimeType: codecType };

      try{
          this.mediaRecorder = new MediaRecorder(this.localStream,options);
      }catch (e){
          console.log('Error while creating media recorder',e);
          return;
      }
      console.log('Created media recorder');
      this.mediaRecorder.onstop = (event)=>{
        console.log('Recorder Stopped');
        const superBuffer = new Blob(this.recordedBlobs,{type: 'video/webm'})
        this.remoteVideo.nativeElement.src = window.URL.createObjectURL(superBuffer);
        this.remoteVideo.nativeElement.play();
      };
      this.mediaRecorder.ondataavailable = (event)=>{
        console.log('media data available ',event);
        if(event.data && event.data.size > 0) {
            this.recordedBlobs.push(event.data);
        }
      };
      this.mediaRecorder.start();
      console.log('media recorder started');
    }

    stopRecorder(): void {
      this.mediaRecorder.stop();
    }
    //recorder end

   async onVideoStart(): Promise<void> {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
        this.handleStreamSuccess(stream);
      }catch(e){
        console.log(e);
      }
    }

    private handleStreamSuccess(stream: MediaStream) {
      this.localStream = stream;
      stream.getTracks().forEach(track=>console.log(track.label))
      console.log('Got stream with constraints:', this.mediaConstraints);
      this.localVideo.nativeElement.srcObject = stream;
      this.localVideo.nativeElement.play();
    }

    private async handleSignal(signal: any){
      switch(signal.type) {
        case 'create':
          await this.webRtc.createOffer(signal,this.localStream);
          break;
        case 'offer':
          await this.webRtc.handleOffer(signal,this.localStream);
          break;
        case 'answer':
            await this.webRtc.handleAnswer(signal,this.localStream);
            break;
        case 'ice':
          this.webRtc.handleIce(signal,this.localStream);
          break;
        case 'logout':
          this.webRtc.handleLogout(signal);
          break;
      }
    }

    private getSupportedCodecTypes() {
      this.supportedCodecTypes = Object.values(Codecs).filter(codec => MediaRecorder.isTypeSupported(codec));
      this.selectedCodec = this.supportedCodecTypes[0];
    }


}
