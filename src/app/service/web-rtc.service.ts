import { Injectable } from '@angular/core';

import { WebSocketService } from './web-socket.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {

  private peerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  private offerOptions = {
      offerToReceiveVideo: 1,
      offerToReceiveAudio: 0
  };

  private connections: Map<string,RTCPeerConnection> = new Map();
  private remoteStream$: Subject<any> = new Subject();

  constructor(private socket: WebSocketService) { }

  getRemoteStream() {
    return this.remoteStream$;
  }

  handleLogout(signal: any) {
    this.connections.delete(signal.sender);
  }

  handleIce(signal: any, stream: MediaStream) {
    if (signal.data) {
      console.log('Adding ice candidate');
      const connection = this.getRTCPeerConnectionObject(signal.sender, stream);
      connection.addIceCandidate(new RTCIceCandidate(signal.data));
    }
  }

  async handleAnswer(signal: any, stream: MediaStream) {
    const connection = this.getRTCPeerConnectionObject(signal.sender, stream);
    try {
      await connection.setRemoteDescription(new RTCSessionDescription(signal.data));
    } catch (e) {
      console.log('Error in answer acceptance', e);
    }
  }

  async handleOffer(signal: any, stream: MediaStream) {
    const peerId = signal.sender;
    const connection = this.getRTCPeerConnectionObject(peerId, stream);

    try {
      console.log('Setting remote description of offer from ',peerId);
      await connection.setRemoteDescription(new RTCSessionDescription(signal.data));
      const sdp = await connection.createAnswer();
      connection.setLocalDescription(sdp);
      //sending sdp to requester
      this.socket.sendWebRTCSignal({
        type: 'answer',
        receiver: peerId,
        sender: this.socket.getSessionId,
        data: sdp
      });

    } catch(e) {
      console.log('Error in offer handling',e)
    }

  }

  async createOffer(signal: any, stream: MediaStream) {
    const peerId = signal.receiver;
    let connection = this.getRTCPeerConnectionObject(peerId, stream);
    try {
      const sdp = await connection.createOffer();
      connection.setLocalDescription(sdp);
      console.log('Creating an offer for ', peerId);
      this.socket.sendWebRTCSignal({
        type: 'offer',
        receiver: peerId,
        sender: signal.sender,
        data: sdp
      });
    } catch (e) {
      console.log('Error in offer creation', e);
    }

  }

  private getRTCPeerConnectionObject(uuid: string, stream: MediaStream): RTCPeerConnection {
    if (this.connections.has(uuid)) {
      return this.connections.get(uuid)!;
    }
    let connection = new RTCPeerConnection(this.peerConnectionConfig);
    stream.getTracks().forEach(track => connection.addTrack(track,stream));

    //handle onicecandidate
    connection.onicecandidate = (event)=> {
      console.log('Candidate is ',event.candidate);
      if(event.candidate) {
        console.log('Sending ICE candidate ',event.candidate);
        this.socket.sendWebRTCSignal({
          type: 'ice',
          receiver: uuid,
          data: event.candidate,
          sender: this.socket.getSessionId
        });
      }
    };

    connection.ontrack = (event)=> {
      console.log('ontrack', event);
        this.remoteStream$.next(event);
    }

    this.connections.set(uuid,connection);
    return connection;
  }
}
