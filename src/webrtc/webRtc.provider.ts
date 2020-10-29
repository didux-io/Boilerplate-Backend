import { Injectable } from '@angular/core';
import * as crypto from 'crypto';
import { BehaviorSubject } from 'rxjs';
import { IWebRTCConfig } from './webRtcConfig.interface';

@Injectable()
export class WebRtcProvider {
    webRtcConfig: IWebRTCConfig;
    hostUuid: string; // The host UUID to connect to from the client
    peerConnection: RTCPeerConnection = null; // The peer connection between client and host
    dataChannel: RTCDataChannel = null; // The data channel between client and host
    wsClient: WebSocket = null; // The websocket connection between client and signaling server or host and signaling server
    receivedActions$ = new BehaviorSubject(null); // Whenever an action is received, this observable will emit an event
    uuid$ = new BehaviorSubject(null); // Whenever the UUID is set, it will emit an event (so that the host can set it somewhere in like a QR)
    websocketConnectionClosed$ = new BehaviorSubject(null); // Whenever there is an event on the websocket, this observable will emit

    constructor() {}

    /**
     * Set the config of the WebRTC connection.
     * Look into the IWebRTCConfig interface for the options
     * @param webRtcConfig The WebRTC configuration
     */
    setConfig(webRtcConfig: IWebRTCConfig) {
        this.webRtcConfig = webRtcConfig;
    }

    /**
     * Returns the WebRTC configuration
     */
    getConfig(): IWebRTCConfig {
        return this.webRtcConfig;
    }

    /**
     * The client needs to set the host UUID to connect to before setting up the websocket connection
     * @param hostUuid The UUID of the host
     */
    setHostUuid(hostUuid: string) {
        this.hostUuid = hostUuid;
    }

    /**
     * Send data over the data channel
     * @param action As a string, which action type do you want to send?
     * @param data The data to send as an object
     */
    sendData(action: string, data: any) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ action, ...data }));
        } else {
            console.log(`Attempted to send data with action ${action} but data channel is not open`);
        }
    }

    /**
     * Whenever the UUID is set from the host this observable emits
     * @param uuid The UUID to allow clients connec to
     */
    setUuid(uuid: string) {
        this.uuid$.next(uuid);
    }

    /**
     * Only disconnect on this application and send no disconnect over the data channel
     */
    disconnect() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }
    }

    /**
     * Disconnect on this application and send a disconnect event over the datachannel
     */
    remoteDisconnect() {
        console.log('datachannel:', this.dataChannel);
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({action: 'disconnect'}));
        }
        this.disconnect();
    }

    /**
     * Returns the configuration for the RTC peerconnection
     */
    getTurnRTCConfig(): RTCConfiguration {
        const secret = 'proofme.id';
        const time = Math.floor(Date.now() / 1000);
        const expiration = 8400;
        const username = (time + expiration).toString();
        const credential = crypto.createHmac('sha1', secret).update(username.toString()).digest('base64');
        return {
            iceServers: [{
                urls: ['turn:51.89.104.5:3478'],
                credential,
                username,
            }],
        } as RTCConfiguration;
    }

    /**
     * The host will send an offer when a client connects to his UUID
     * @param peerConnection The peer connection to set the local description
     * @param wsClient The websocket to send the offer to
     */
    async sendOffer(peerConnection: RTCPeerConnection, wsClient: WebSocket) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        wsClient.send(JSON.stringify({
            type: 'offer',
            offer
        }));
    }

    /**
     * This method will launch the websocket and listen to events
     */
    async launchWebsocketClient() {
        const RTCSessionDescription = require('wrtc').RTCSessionDescription;
        const RTCIceCandidate = require('wrtc').RTCIceCandidate;
        const W3CWebSocket = require('websocket').w3cwebsocket;
        let signalingUrl = this.webRtcConfig.signalingUrl;
        if (!signalingUrl) {
            console.log('signalingUrl undefined, falling back to default');
            signalingUrl = 'wss://auth.proofme.id';
        }
        console.log('Connecting to signaling server:', signalingUrl);
        this.wsClient = await new W3CWebSocket(signalingUrl);
        this.wsClient.onerror = (error => {
            console.log('Websocket error: ' + error.toString());
            this.websocketConnectionClosed$.next(null);
        });
        this.wsClient.onclose = (() => {
            console.log('Websocket connection closed');
            this.websocketConnectionClosed$.next(true);
        });
        this.wsClient.onopen = (() => {
            console.log('Websocket connection open');
            this.websocketConnectionClosed$.next(null);
        });
        this.wsClient.onmessage = (async msg => {
            if (msg.data) {

                let data: any;
                // accepting only JSON messages
                try {
                    data = JSON.parse(msg.data);
                } catch (e) {
                    console.log('Websocket onmessage ERROR: Invalid JSON');
                    data = {};
                }
                const { type, message, success, uuid, offer, answer, candidate } = data;

                switch (type) {
                    case 'error':
                        // On an error
                        console.log('Websocket onmessage error: ', message);
                        break;
                    case 'connect':
                        console.log('Websocket connect event');
                        console.log('Websocket connect success:', success);
                        // When connected to the Signaling service
                        if (success) {
                            if (this.webRtcConfig.isHost) {
                                console.log('Websocket connect is host');
                                // if the application is the host, send a host request to receive a UUID
                                this.wsClient.send(JSON.stringify({ type: 'host' }));
                            } else {
                                console.log('Websocket connect is not host');
                                // If the application is not the host, send a connect request with the host UUID
                                await this.setupPeerconnection(this.hostUuid);
                                this.wsClient.send(JSON.stringify({ type: 'connect', host: this.hostUuid }));
                            }
                        } else {
                            console.log('Websocket onmessage connect failure');
                        }
                        break;
                    case 'connected':
                        // When the host received an UUID
                        if (uuid && this.webRtcConfig.isHost) {
                            console.log('Websocket onmessage connected success with client uuid:', uuid);
                            await this.sendOffer(this.peerConnection, this.wsClient);
                        }
                        break;
                    case 'offer':
                        // If the application is not the host, it receives an offer whenever a client connects.
                        // The client will send an answer back
                        if (offer && !this.webRtcConfig.isHost) {
                            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                            const hostAnswer = await this.peerConnection.createAnswer();
                            this.wsClient.send(JSON.stringify({
                                type: 'answer',
                                answer: hostAnswer
                            }));
                            await this.peerConnection.setLocalDescription(hostAnswer);
                        }
                        break;
                    case 'host':
                        // Whenever the host receives a host request back, set the UUID provided
                        if (uuid && this.webRtcConfig.isHost) {
                            console.log('Websocket onmessage host waiting for user to connect to ' + uuid);
                            this.setUuid(uuid);
                            await this.setupPeerconnection(uuid);
                        }
                        break;
                    case 'leave':
                        // Whenever the host or client leaves setup a new connection
                        console.log('Websocket onmessage leave host uuid: ' + uuid);
                        this.setUuid(null);
                        await this.setupPeerconnection(uuid);
                        break;
                    case 'answer':
                        // The client will send an answer and the host will set it as a description
                        if (answer && this.webRtcConfig.isHost) {
                            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                        }
                        break;
                    case 'candidate':
                        // On receiving an candidate from the client
                        if (candidate) {
                            const clientCandidate = new RTCIceCandidate(candidate);
                            await this.peerConnection.addIceCandidate(clientCandidate);
                        }
                        break;
                    default:
                        // The default
                        console.error('Websocket onmessage default');
                        break;
                }
            }
        });
    }

    /**
     * This method will setup the peerconnection and datachannel
     * It will also emit received actions over an observable
     * @param uuid The UUID to connect to
     */
    async setupPeerconnection(uuid: string) {
        this.peerConnection = new RTCPeerConnection(this.getTurnRTCConfig());
        console.log('settings up peerconnection with uuid:', uuid);
        this.dataChannel = this.peerConnection.createDataChannel(uuid);

        this.peerConnection.addEventListener('datachannel', event => {
            event.channel.onmessage = (async eventMessage => {
                let data: any;

                // accepting only JSON messages
                try {
                    data = JSON.parse(eventMessage.data);
                    // By default this class will only handle the disconnect event. Close the websocket connection and
                    // Start a new one for others to connect
                    switch (data.action) {
                        case 'disconnect':
                            console.log('peerConnection disconnect');
                            this.disconnect();
                            this.launchWebsocketClient();
                            break;
                    }
                    this.receivedActions$.next(data);
                } catch (e) {
                    console.log('peerConnection ERROR: Invalid JSON');
                    data = {};
                }
            });
            event.channel.onopen = (eventMessage: any) => {
                console.log('Sending p2p connected!');
                this.receivedActions$.next({ action: 'p2pConnected', p2pConnected: true });
            };
        });

        this.peerConnection.addEventListener('iceconnectionstatechange', event => {
            if (this.peerConnection.iceConnectionState === 'disconnected') {
                this.receivedActions$.next({ action: 'p2pConnected', p2pConnected: false });
                this.peerConnection.close();
                this.wsClient.send(JSON.stringify({ type: 'leave' }));
                this.wsClient.close();
            }
        });

        this.peerConnection.addEventListener('icecandidate', async event => {
            if (event.candidate) {
                console.log('**************** Received candidate over peer, sending to signaller');
                console.log('Candidate', event.candidate);
                try {
                    const candidate = new RTCIceCandidate(event.candidate);
                    await this.peerConnection.addIceCandidate(candidate);
                } catch (e) {
                    console.log('ooops', e);
                }
                this.wsClient.send(JSON.stringify({type: 'candidate', candidate: event.candidate}));
            }
        });
    }
}
