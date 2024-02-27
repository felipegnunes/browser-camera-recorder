import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { VideoRecordingService } from './video-recording.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    providers: [VideoRecordingService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
    title = 'browser-video-recorder';

    audioDevices: MediaDeviceInfo[] = [];
    videoDevices: MediaDeviceInfo[] = [];

    audioDevice: InputDeviceInfo | null = null;
    videoDevice: InputDeviceInfo | null = null;

    videoBlobUrl: any = null;
    @ViewChild('videoElement') videoElement: any;
    video: any;

    constructor(
        private videoRecordingService: VideoRecordingService,
        private ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer
    ) {
        this.videoRecordingService.getMediaStream().subscribe((data) => {
            this.video.srcObject = data;
            this.ref.detectChanges();
            console.log('data', data);
        });
        this.videoRecordingService.getBlob().subscribe((data) => {
            this.videoBlobUrl = this.sanitizer.bypassSecurityTrustUrl(data);
            this.video.srcObject = null;
            this.ref.detectChanges();
        });
    }

    ngAfterViewInit() {
        this.video = this.videoElement.nativeElement;
    }

    async ngOnInit() {
        const mediaDevices = await this.getMediaDevices().then();
        this.audioDevices = mediaDevices.filter(
            (device) => device.kind === 'audioinput'
        ) as InputDeviceInfo[];
        this.videoDevices = mediaDevices.filter(
            (device) => device.kind === 'videoinput'
        ) as InputDeviceInfo[];

        // navigator.mediaDevices.getUserMedia({
        //     audio: {
        //         deviceId: '',
        //     },
        //     video: {
        //         deviceId: '',
        //     },
        // });
    }

    getMediaDevices(): Promise<MediaDeviceInfo[]> {
        return navigator.mediaDevices.enumerateDevices();
    }

    startRecording() {
        if (this.audioDevice && this.videoDevice) {
            this.videoRecordingService.startRecording(this.audioDevice.deviceId, this.videoDevice.deviceId);
        }
    }

    stopRecording() {
        this.videoRecordingService.stopRecording();
    }

    downloadRecording() {}

    clearRecording() {}

    selectAudioDevice(device: any) {
        console.log('Selected audio device:', device);
        this.audioDevice = device;
    }

    selectVideoDevice(device: any) {
        console.log('Selected audio device:', device);
        this.videoDevice = device;

    }
}
