import video from '!!file-loader!../data/SQT01-92a223ee-ea34-46ac-a182-df693f14fb31-1.mp4';

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

export class VideoContainer {
  type: "video-container" = "video-container";
  container: HTMLDivElement;
  key: number;
  from_top_left: number[];
  size: number[];
  state: VideoState;
  elements: VideoElements;
  videoSrc: string;

  // Add drag state properties
  private isDragging: boolean = false;
  private dragOccurred: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private containerStartX: number = 0;
  private containerStartY: number = 0;

  // Add resize properties
  private isResizing: boolean = false;
  private resizeOccurred: boolean = false;
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private containerStartWidth: number = 0;
  private containerStartHeight: number = 0;
  private resizeDirection: string = '';

  constructor(
    container: HTMLDivElement,
    key: number,
    from_top_left: number[],
    size: number[],
    videoSrc: string = video
  ) {
    console.log("Viedo Src:", videoSrc);
  
    // Debug the video source
    console.log("Video Src provided:", videoSrc);
    console.log("Default video import:", video);
    console.log("Type of video import:", typeof video);
    
    // Use a working test video for now
    // this.videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
  


    this.container = container;
    this.key = key;
    this.from_top_left = from_top_left;
    this.size = size;
    this.videoSrc = videoSrc;
    
    this.state = {
      isVisible: true,
      isPlaying: true,
      isMuted: true
    };
    
    this.elements = {
      videoElement: null,
      playButton: null,
      muteButton: null,
      progressBar: null
    };

    this.init();
  }

  init = (): void => {
    this.applySizing();
    this.render();
    this.bindEvents();
    this.initializeLucideIcons();
  };

  applySizing = (): void => {
    this.container.style.position = "absolute";
    this.container.style.left = this.from_top_left[0] + "%";
    this.container.style.top = this.from_top_left[1] + "%";
    this.container.style.width = this.size[0] + "%";
    this.container.style.height = this.size[1] + "%";
    this.container.style.minWidth = "200px";
    this.container.style.minHeight = "150px";
    
    console.log(`Video Container ${this.key}: Applied sizing`);
  };

  updateSize = (size: number[]): void => {
    this.size = [...size];
    this.container.style.width = this.size[0] + "%";
    this.container.style.height = this.size[1] + "%";
    this.container.offsetHeight; // Force reflow
    
    console.log(`Video Container ${this.key}: Updated size to [${this.size[0]}%, ${this.size[1]}%]`);
  };

  updatePosition = (from_top_left: number[]): void => {
    if (this.isDragging) return;
    
    this.from_top_left = from_top_left;
    this.container.style.left = from_top_left[0] + "%";
    this.container.style.top = from_top_left[1] + "%";
  };

  render = (): void => {
    this.container.innerHTML = `
    <div class="video-container ${!this.state.isVisible ? 'hidden' : ''}" >
    <!-- Video Element -->
    <video 
      id="video-${this.key}"
      class="video-element"
      src="${this.videoSrc}"
      ${this.state.isPlaying ? 'autoplay' : ''}
      ${this.state.isMuted ? 'muted' : ''}
      loop
      preload="metadata"
    >
      
      <!-- Video Controls Overlay -->
      <div class="video-controls">
        <div class="video-controls-header">
          <div class="video-title">
            <i data-lucide="video" width="16" height="16"></i>
            <span>Video ${this.key}</span>
          </div>
          <div class="video-actions">
            <button class="video-control-btn" id="playBtn-${this.key}">
              <i data-lucide="${this.state.isPlaying ? 'pause' : 'play'}" width="16" height="16"></i>
            </button>
            <button class="video-control-btn" id="muteBtn-${this.key}">
              <i data-lucide="${this.state.isMuted ? 'volume-x' : 'volume-2'}" width="16" height="16"></i>
            </button>
          </div>
        </div>
        
        <div class="video-progress">
          <input 
            type="range" 
            class="video-progress-bar" 
            id="progressBar-${this.key}"
            min="0" 
            max="100" 
            value="0"
          >
        </div>
      </div>
      
      <!-- Resize Handles -->
      <div class="resize-handle resize-se" data-direction="se"></div>
      <div class="resize-handle resize-s" data-direction="s"></div>
      <div class="resize-handle resize-e" data-direction="e"></div>
      <div class="resize-handle resize-sw" data-direction="sw"></div>
      <div class="resize-handle resize-w" data-direction="w"></div>
      <div class="resize-handle resize-ne" data-direction="ne"></div>
      <div class="resize-handle resize-n" data-direction="n"></div>
      <div class="resize-handle resize-nw" data-direction="nw"></div>
    </div>
    `;
  };

  bindEvents = (): void => {
    // Cache DOM elements
    this.elements.videoElement = this.container.querySelector(`#video-${this.key}`) as HTMLVideoElement;
    this.elements.playButton = this.container.querySelector(`#playBtn-${this.key}`) as HTMLButtonElement;
    this.elements.muteButton = this.container.querySelector(`#muteBtn-${this.key}`) as HTMLButtonElement;
    this.elements.progressBar = this.container.querySelector(`#progressBar-${this.key}`) as HTMLInputElement;

    // Video event listeners
    this.elements.videoElement?.addEventListener('error', this.handleVideoError);
    this.elements.videoElement?.addEventListener('timeupdate', this.handleTimeUpdate);
    this.elements.videoElement?.addEventListener('loadedmetadata', this.handleVideoLoaded);

    // Control event listeners
    this.elements.playButton?.addEventListener('click', this.handlePlayPause);
    this.elements.muteButton?.addEventListener('click', this.handleMuteToggle);
    this.elements.progressBar?.addEventListener('input', this.handleProgressChange);

    // Initialize drag and resize handlers
    this.initializeDragHandlers();
  };

  handleVideoError = (e: Event): void => {
    console.error(`Video Container ${this.key}: Video failed to load:`, e);
  };

  handleTimeUpdate = (): void => {
    if (this.elements.videoElement && this.elements.progressBar) {
      const progress = (this.elements.videoElement.currentTime / this.elements.videoElement.duration) * 100;
      this.elements.progressBar.value = progress.toString();
    }
  };

  handleVideoLoaded = (): void => {
    console.log(`Video Container ${this.key}: Video loaded successfully`);
  };

  handlePlayPause = (): void => {
    if (!this.elements.videoElement) return;

    if (this.state.isPlaying) {
      this.elements.videoElement.pause();
      this.state.isPlaying = false;
    } else {
      this.elements.videoElement.play();
      this.state.isPlaying = true;
    }

    // Update button icon
    const icon = this.elements.playButton?.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', this.state.isPlaying ? 'pause' : 'play');
      this.initializeLucideIcons();
    }

    console.log(`Video Container ${this.key}: ${this.state.isPlaying ? 'Playing' : 'Paused'}`);
  };

  handleMuteToggle = (): void => {
    if (!this.elements.videoElement) return;

    this.state.isMuted = !this.state.isMuted;
    this.elements.videoElement.muted = this.state.isMuted;

    // Update button icon
    const icon = this.elements.muteButton?.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', this.state.isMuted ? 'volume-x' : 'volume-2');
      this.initializeLucideIcons();
    }

    console.log(`Video Container ${this.key}: ${this.state.isMuted ? 'Muted' : 'Unmuted'}`);
  };

  handleProgressChange = (): void => {
    if (!this.elements.videoElement || !this.elements.progressBar) return;

    const progress = parseFloat(this.elements.progressBar.value);
    const newTime = (progress / 100) * this.elements.videoElement.duration;
    this.elements.videoElement.currentTime = newTime;
  };

  initializeLucideIcons = (): void => {
    const lucideInstance = (window as any).lucide;
    
    if (lucideInstance && typeof lucideInstance.createIcons === 'function') {
      lucideInstance.createIcons();
    }

    setTimeout(() => {
      const lucideInstance = (window as any).lucide;
      if (lucideInstance && typeof lucideInstance.createIcons === 'function') {
        lucideInstance.createIcons();
      }
    }, 100);
  };

  // Drag functionality (similar to BigeContainer)
  initializeDragHandlers = (): void => {
    const videoContainer = this.container.querySelector('.video-container') as HTMLElement;
    if (!videoContainer) return;

    videoContainer.style.cursor = 'move';
    videoContainer.style.userSelect = 'none';

    // Mouse events
    videoContainer.addEventListener('mousedown', this.handleDragStart);
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);

    // Touch events
    videoContainer.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);

    this.initializeResizeHandlers();
  };

  // Drag handlers (same pattern as BigeContainer)
  handleDragStart = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('.video-control-btn') || target.closest('.resize-handle')) {
      return;
    }

    this.startDrag(e.clientX, e.clientY);
    e.preventDefault();
  };

  handleDragMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    this.updateDrag(e.clientX, e.clientY);
    e.preventDefault();
  };

  handleDragEnd = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    this.endDrag();
    e.preventDefault();
  };

  handleTouchStart = (e: TouchEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('.video-control-btn') || target.closest('.resize-handle')) {
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  };

  handleTouchMove = (e: TouchEvent): void => {
    if (!this.isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    this.updateDrag(touch.clientX, touch.clientY);
    e.preventDefault();
  };

  handleTouchEnd = (e: TouchEvent): void => {
    if (!this.isDragging) return;
    this.endDrag();
    e.preventDefault();
  };

  startDrag = (clientX: number, clientY: number): void => {
    this.isDragging = true;
    this.dragOccurred = false;
    this.dragStartX = clientX;
    this.dragStartY = clientY;

    const rect = this.container.getBoundingClientRect();
    const parentRect = this.container.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      this.containerStartX = rect.left - parentRect.left;
      this.containerStartY = rect.top - parentRect.top;
    }

    this.container.style.zIndex = '9999';
    this.container.style.opacity = '0.9';
    
    console.log(`Video Container ${this.key}: Started dragging`);
  };

  updateDrag = (clientX: number, clientY: number): void => {
    if (!this.isDragging) return;

    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    const dragThreshold = 3;
    if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
      this.dragOccurred = true;
    }

    const newX = this.containerStartX + deltaX;
    const newY = this.containerStartY + deltaY;

    const parentRect = this.container.parentElement?.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    if (parentRect) {
      const maxX = parentRect.width - containerRect.width;
      const maxY = parentRect.height - containerRect.height;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      const percentX = (constrainedX / parentRect.width) * 100;
      const percentY = (constrainedY / parentRect.height) * 100;

      this.from_top_left = [percentX, percentY];
      this.container.style.left = percentX + '%';
      this.container.style.top = percentY + '%';
    }
  };

  endDrag = (): void => {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.container.style.zIndex = '1000';
    this.container.style.opacity = '1';
    
    console.log(`Video Container ${this.key}: Ended dragging`);
  };

  // Resize functionality (same pattern as BigeContainer)
  initializeResizeHandlers = (): void => {
    const resizeHandles = this.container.querySelectorAll('.resize-handle');
    
    resizeHandles.forEach(handle => {
      const htmlHandle = handle as HTMLElement;
      htmlHandle.addEventListener('mousedown', this.handleResizeStart);
      htmlHandle.addEventListener('touchstart', this.handleResizeTouchStart, { passive: false });
    });

    document.addEventListener('mousemove', this.handleResizeMove);
    document.addEventListener('mouseup', this.handleResizeEnd);
    document.addEventListener('touchmove', this.handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleResizeTouchEnd);
  };

  handleResizeStart = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    this.resizeDirection = target.getAttribute('data-direction') || '';
    this.startResize(e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation();
  };

  handleResizeMove = (e: MouseEvent): void => {
    if (!this.isResizing) return;
    this.updateResize(e.clientX, e.clientY);
    e.preventDefault();
  };

  handleResizeEnd = (e: MouseEvent): void => {
    if (!this.isResizing) return;
    this.endResize();
    e.preventDefault();
  };

  handleResizeTouchStart = (e: TouchEvent): void => {
    if (e.touches.length !== 1) return;
    
    const target = e.target as HTMLElement;
    this.resizeDirection = target.getAttribute('data-direction') || '';
    
    const touch = e.touches[0];
    this.startResize(touch.clientX, touch.clientY);
    e.preventDefault();
    e.stopPropagation();
  };

  handleResizeTouchMove = (e: TouchEvent): void => {
    if (!this.isResizing || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    this.updateResize(touch.clientX, touch.clientY);
    e.preventDefault();
  };

  handleResizeTouchEnd = (e: TouchEvent): void => {
    if (!this.isResizing) return;
    this.endResize();
    e.preventDefault();
  };

  startResize = (clientX: number, clientY: number): void => {
    this.isResizing = true;
    this.resizeOccurred = false;
    this.resizeStartX = clientX;
    this.resizeStartY = clientY;

    const rect = this.container.getBoundingClientRect();
    const parentRect = this.container.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      this.containerStartX = rect.left - parentRect.left;
      this.containerStartY = rect.top - parentRect.top;
      this.containerStartWidth = rect.width;
      this.containerStartHeight = rect.height;
    }

    this.container.style.zIndex = '9999';
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.getCursorForDirection(this.resizeDirection);
    
    console.log(`Video Container ${this.key}: Started resizing`);
  };

  updateResize = (clientX: number, clientY: number): void => {
    if (!this.isResizing) return;

    const deltaX = clientX - this.resizeStartX;
    const deltaY = clientY - this.resizeStartY;

    const resizeThreshold = 3;
    if (Math.abs(deltaX) > resizeThreshold || Math.abs(deltaY) > resizeThreshold) {
      this.resizeOccurred = true;
    }

    const parentRect = this.container.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    let newX = this.containerStartX;
    let newY = this.containerStartY;
    let newWidth = this.containerStartWidth;
    let newHeight = this.containerStartHeight;

    // Calculate new dimensions based on resize direction (same logic as BigeContainer)
    switch (this.resizeDirection) {
      case 'se':
        newWidth = this.containerStartWidth + deltaX;
        newHeight = this.containerStartHeight + deltaY;
        break;
      case 's':
        newHeight = this.containerStartHeight + deltaY;
        break;
      case 'e':
        newWidth = this.containerStartWidth + deltaX;
        break;
      // ... other directions
    }

    // Apply constraints and update
    const minWidth = 200;
    const minHeight = 150;
    
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);

    const percentX = (newX / parentRect.width) * 100;
    const percentY = (newY / parentRect.height) * 100;
    const percentWidth = (newWidth / parentRect.width) * 100;
    const percentHeight = (newHeight / parentRect.height) * 100;

    this.from_top_left = [percentX, percentY];
    this.size = [percentWidth, percentHeight];
    
    this.container.style.left = percentX + '%';
    this.container.style.top = percentY + '%';
    this.container.style.width = percentWidth + '%';
    this.container.style.height = percentHeight + '%';
  };

  endResize = (): void => {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    this.container.style.zIndex = '1000';
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    console.log(`Video Container ${this.key}: Ended resizing`);
  };

  getCursorForDirection = (direction: string): string => {
    switch (direction) {
      case 'se': return 'se-resize';
      case 's': return 's-resize';
      case 'e': return 'e-resize';
      case 'sw': return 'sw-resize';
      case 'w': return 'w-resize';
      case 'nw': return 'nw-resize';
      case 'n': return 'n-resize';
      case 'ne': return 'ne-resize';
      default: return 'default';
    }
  };

  // Public methods for external control
  show = (): void => {
    this.state.isVisible = true;
    this.container.style.display = 'block';
    console.log(`Video Container ${this.key}: Shown`);
  };

  hide = (): void => {
    this.state.isVisible = false;
    this.container.style.display = 'none';
    console.log(`Video Container ${this.key}: Hidden`);
  };

  play = (): void => {
    if (this.elements.videoElement) {
      this.elements.videoElement.play();
      this.state.isPlaying = true;
    }
  };

  pause = (): void => {
    if (this.elements.videoElement) {
      this.elements.videoElement.pause();
      this.state.isPlaying = false;
    }
  };

  setVideoSource = (src: string): void => {
    this.videoSrc = src;
    if (this.elements.videoElement) {
      this.elements.videoElement.src = src;
    }
  };

  getPosition = (): number[] => {
    return [...this.from_top_left];
  };

  getSize = (): number[] => {
    return [...this.size];
  };

  dispose = (): void => {
    // Clean up all event listeners
    this.elements.videoElement?.removeEventListener('error', this.handleVideoError);
    this.elements.videoElement?.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.elements.playButton?.removeEventListener('click', this.handlePlayPause);
    this.elements.muteButton?.removeEventListener('click', this.handleMuteToggle);
    
    // Clean up drag and resize listeners
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    
    console.log(`Video Container ${this.key}: Disposed`);
  };
}