import video from '!!file-loader!../data/SQT01-92a223ee-ea34-46ac-a182-df693f14fb31-1.mp4';
import * as THREE from 'three';


// VideoContainer.ts
interface VideoState {
  isVisible: boolean;
  isPlaying: boolean;
  isMuted: boolean;
}

interface VideoElements {
  videoElement: HTMLVideoElement | null;
  playButton: HTMLButtonElement | null;
  muteButton: HTMLButtonElement | null;
  progressBar: HTMLInputElement | null;
}

export class VideoTexture {
  public mesh: THREE.Mesh;
  public texture: THREE.VideoTexture;
  public video: HTMLVideoElement;
  public material: THREE.MeshBasicMaterial;
  public geometry: THREE.PlaneGeometry;
  
  private key: number;
  private position: THREE.Vector3;
  private size: { width: number; height: number };
  private isPlaying: boolean = true;
  private isMuted: boolean = true;

  constructor(
    key: number,
    videoSrc: string,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, -50),
    size: { width: number; height: number } = { width: 4, height: 3 }
  ) {
    this.key = key;
    this.position = position;
    this.size = size;

    // Create video element
    this.video = document.createElement('video');
    this.setupVideo(videoSrc);

    // Create Three.js components
    this.createTexture();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
  }

  private setupVideo(src: string): void {
    this.video.src = src;
    this.video.crossOrigin = 'anonymous';
    this.video.loop = true;
    this.video.muted = this.isMuted;
    this.video.autoplay = true;
    this.video.playsInline = true;
        
    // Add CSS styles for contained behavior
    this.video.style.objectFit = 'contain'; // Change from cover to contain
    this.video.style.width = '100%';
    this.video.style.height = '100%';


    // Preload the video
    this.video.preload = 'metadata';
    
    // Start playing
    this.video.play().catch(error => {
      console.error(`Video ${this.key} failed to play:`, error);
    });

    // Event listeners
    this.video.addEventListener('loadeddata', () => {
      console.log(`Video ${this.key} loaded successfully`);
      this.adjustGeometryToAspectRatio(); // Add this method
    });

    this.video.addEventListener('error', (e) => {
      console.error(`Video ${this.key} error:`, e);
    });
  }

private adjustGeometryToAspectRatio(): void {
  if (this.video.videoWidth && this.video.videoHeight) {
    const videoAspectRatio = this.video.videoWidth / this.video.videoHeight;
    const planeAspectRatio = this.size.width / this.size.height;
    
    let finalWidth = this.size.width;
    let finalHeight = this.size.height;
    
    // Adjust geometry to maintain video aspect ratio (contain behavior)
    if (videoAspectRatio > planeAspectRatio) {
      // Video is wider than plane, fit to width
      finalHeight = this.size.width / videoAspectRatio;
    } else {
      // Video is taller than plane, fit to height  
      finalWidth = this.size.height * videoAspectRatio;
    }
    
    // Update geometry
    this.geometry.dispose();
    this.geometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
    this.mesh.geometry = this.geometry;
    
    console.log(`Adjusted video ${this.key} geometry to ${finalWidth}x${finalHeight} (aspect ratio: ${videoAspectRatio})`);
  }
}


  private createTexture(): void {
    this.texture = new THREE.VideoTexture(this.video);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.flipY = true;
  }

  private createGeometry(): void {
    this.geometry = new THREE.PlaneGeometry(this.size.width, this.size.height);
  }

  private createMaterial(): void {
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: false,
      opacity: 0.9,
      side: THREE.DoubleSide, 
      depthTest: true,    // Enable depth testing
      depthWrite: false, // Disable depth writing for transparency
    });
  }

  private createMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);
    this.mesh.userData.type = 'video-texture';
    this.mesh.userData.key = this.key;
    this.mesh.renderOrder = -100; // Render FIRST (before other objects)

  }

  // Public control methods
  public play(): void {
    this.video.play().catch(console.error);
    this.isPlaying = true;
  }

  public pause(): void {
    this.video.pause();
    this.isPlaying = false;
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public mute(): void {
    this.video.muted = true;
    this.isMuted = true;
  }

  public unmute(): void {
    this.video.muted = false;
    this.isMuted = false;
  }

  public toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  public setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this.mesh.position.copy(this.position);
  }

  public setSize(width: number, height: number): void {
    this.size = { width, height };
    this.geometry.dispose();
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh.geometry = this.geometry;
  }

  public setOpacity(opacity: number): void {
    this.material.opacity = Math.max(0, Math.min(1, opacity));
  }

  public setVideoSource(src: string): void {
    this.video.src = src;
  }

  public getCurrentTime(): number {
    return this.video.currentTime;
  }

  public getDuration(): number {
    return this.video.duration;
  }

  public setCurrentTime(time: number): void {
    this.video.currentTime = time;
  }

  public dispose(): void {
    this.video.pause();
    this.video.src = '';
    this.texture.dispose();
    this.material.dispose();
    this.geometry.dispose();
  }
}