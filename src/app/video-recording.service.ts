import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';
import { Subject } from 'rxjs';

interface RecordedVideoOutput {
    blob: Blob;
    url: string;
    title: string;
}

@Injectable()
export class VideoRecordingService {
    private mediaStream: any;
    private _mediaStream = new Subject<any>();
    private recorder: any;
    private blob: any;
    private _blob = new Subject<any>();

    getMediaStream() {
        return this._mediaStream.asObservable();
    }

    getBlob() {
       return this._blob.asObservable();
    }

    startRecording(audioDeviceId: string, videoDeviceId: string) {
        this.handleRecording(audioDeviceId, videoDeviceId);
    }

    async handleRecording(audioDeviceId: string, videoDeviceId: string) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: audioDeviceId
            },
            video: {
                deviceId: videoDeviceId
            },
        });
        this._mediaStream.next(this.mediaStream);
        this.recorder = new RecordRTC(this.mediaStream, { type: 'video' })
        this.recorder.startRecording();
    }

    stopRecording() {
        if (!this.recorder) {
            return;
        }

        this.recorder.stopRecording(() => {
            this.blob = this.recorder.getBlob();
            this._blob.next(URL.createObjectURL(this.blob));
            this.mediaStream.stop();
            this.recorder.destroy();
        })
    }

    downloadRecording() {}

    clearRecording() {}
}
