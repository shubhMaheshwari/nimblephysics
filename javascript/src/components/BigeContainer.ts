interface BigeState {
  isLoading: boolean;
  isCollapsed: boolean;
  // Dynamic state will be stored in dynamicState Map
}

interface BigeElements {
  statusTags: HTMLElement | null;
  analyzeBtn: HTMLButtonElement | null;
  playIcon: HTMLElement | null;
  spinner: HTMLElement | null;
  btnText: HTMLElement | null;
  // Dynamic dropdowns will be stored in dynamicDropdowns Map
  dynamicDropdowns: Map<string, HTMLSelectElement>;
}

interface DropdownConfig {
  id: string;
  label: string;
  options: string[];
  defaultValue?: string;
  gridPosition?: 'full' | 'left' | 'right'; // For layout control
  onChange?: (value: string) => void;
}

interface TextConfig {
  id: string;
  content: string;
  className?: string;
}


class BigeContainer {
  type: "bige-container";
  container: HTMLDivElement;
  key: number;
  from_top_left: number[];
  size: number[];
  state: BigeState;
  elements: BigeElements;
  title: string;
  
  // Store dynamic dropdown configurations
  dropdownConfigs: Map<string, DropdownConfig>;
  dynamicState: Map<string, string>;
  textConfigs: Map<string, TextConfig>;

  // Add drag state properties
  private isDragging: boolean = false;
  private dragOccurred: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private containerStartX: number = 0;
  private containerStartY: number = 0;

  // Add these new resize properties
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
    title: string = "BIGE Demo" // Add title parameter with default
  ) {
    this.type = "bige-container";
    this.container = container;
    this.key = key;
    this.from_top_left = from_top_left;
    this.size = size;
    this.title = title; // Store the title
    
    this.state = {
      isLoading: false,
      isCollapsed: false
    };
    
    this.elements = {
      statusTags: null,
      analyzeBtn: null,
      playIcon: null,
      spinner: null,
      btnText: null,
      dynamicDropdowns: new Map()
    };
    
    this.dropdownConfigs = new Map();
    this.dynamicState = new Map();
    
    this.textConfigs = new Map(); // Add this


    this.init();
  }


  init = (): void => {
    this.applySizing(); // Add this to apply sizing during initialization
    this.render();
    this.bindEvents();
    this.initializeLucideIcons();
  };

  // Update the applySizing method to force height properly
  applySizing = (): void => {
    // Apply positioning and sizing based on constructor parameters
    this.container.style.position = "absolute";
    this.container.style.left = this.from_top_left[0] + "%";
    this.container.style.top = this.from_top_left[1] + "%";
    this.container.style.width = this.size[0] + "%";
    this.container.style.height = this.size[1] + "%";
    
    // CRITICAL: Force height to be respected
    this.container.style.minHeight = this.size[1] + "%";
    this.container.style.maxHeight = this.size[1] + "%";
    
    // Ensure minimum dimensions for usability
    this.container.style.minWidth = "200px";
    
    // Remove any conflicting styles
    this.container.style.maxWidth = "none";
    
    console.log(`BIGE Container ${this.key}: Applied sizing - Height: ${this.size[1]}%`);
  };



  // Update the updateSize method
  updateSize = (size: number[]): void => {
    this.size = [...size];
    this.container.style.width = this.size[0] + "%";
    this.container.style.height = this.size[1] + "%";
    
    // CRITICAL: Force height constraints
    this.container.style.minHeight = this.size[1] + "%";
    this.container.style.maxHeight = this.size[1] + "%";
    
    // Force a reflow
    this.container.offsetHeight;
    
    console.log(`BIGE Container ${this.key}: Updated size to [${this.size[0]}%, ${this.size[1]}%]`);
  };


    // Add methods to update size and position dynamically (to match CollapsibleContainer interface)
    updatePosition = (from_top_left: number[]): void => {
      if (this.isDragging) return; // Don't update position while dragging 
      
      this.from_top_left = from_top_left;
      this.container.style.left = from_top_left[0] + "%";
      this.container.style.top = from_top_left[1] + "%";
    };



  // Update the updateResize method with better debugging and forcing
  updateResize = (clientX: number, clientY: number): void => {
    if (!this.isResizing) return;

    const deltaX = clientX - this.resizeStartX;
    const deltaY = clientY - this.resizeStartY;

    // If we've moved more than a few pixels, consider it a resize
    const resizeThreshold = 3;
    if (Math.abs(deltaX) > resizeThreshold || Math.abs(deltaY) > resizeThreshold) {
      this.resizeOccurred = true;
    }

    const parentRect = this.container.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    // Start with current dimensions
    let newX = this.containerStartX;
    let newY = this.containerStartY;
    let newWidth = this.containerStartWidth;
    let newHeight = this.containerStartHeight;

    // Calculate new dimensions and position based on resize direction
    switch (this.resizeDirection) {
      case 'se': // Southeast - grow right and down
        newWidth = this.containerStartWidth + deltaX;
        newHeight = this.containerStartHeight + deltaY;
        break;
      case 's': // South - grow down only
        newHeight = this.containerStartHeight + deltaY;
        break;
      case 'e': // East - grow right only
        newWidth = this.containerStartWidth + deltaX;
        break;
      case 'sw': // Southwest - grow left and down
        newX = this.containerStartX + deltaX;
        newWidth = this.containerStartWidth - deltaX;
        newHeight = this.containerStartHeight + deltaY;
        break;
      case 'w': // West - grow left only
        newX = this.containerStartX + deltaX;
        newWidth = this.containerStartWidth - deltaX;
        break;
      case 'nw': // Northwest - grow left and up
        newX = this.containerStartX + deltaX;
        newY = this.containerStartY + deltaY;
        newWidth = this.containerStartWidth - deltaX;
        newHeight = this.containerStartHeight - deltaY;
        break;
      case 'n': // North - grow up only
        newY = this.containerStartY + deltaY;
        newHeight = this.containerStartHeight - deltaY;
        break;
      case 'ne': // Northeast - grow right and up
        newY = this.containerStartY + deltaY;
        newWidth = this.containerStartWidth + deltaX;
        newHeight = this.containerStartHeight - deltaY;
        break;
    }

    // Apply minimum dimensions
    const minWidth = 200;
    const minHeight = 100;
    
    // Adjust position if minimum size constraints affect the resize
    if (newWidth < minWidth) {
      if (this.resizeDirection.includes('w')) {
        newX = newX - (minWidth - newWidth);
      }
      newWidth = minWidth;
    }
    
    if (newHeight < minHeight) {
      if (this.resizeDirection.includes('n')) {
        newY = newY - (minHeight - newHeight);
      }
      newHeight = minHeight;
    }

    // Constrain to parent bounds
    newX = Math.max(0, Math.min(newX, parentRect.width - newWidth));
    newY = Math.max(0, Math.min(newY, parentRect.height - newHeight));
    
    // Ensure we don't exceed parent bounds
    newWidth = Math.min(newWidth, parentRect.width - newX);
    newHeight = Math.min(newHeight, parentRect.height - newY);

    // Convert to percentages
    const percentX = (newX / parentRect.width) * 100;
    const percentY = (newY / parentRect.height) * 100;
    const percentWidth = (newWidth / parentRect.width) * 100;
    const percentHeight = (newHeight / parentRect.height) * 100;

    // Update position and size
    this.from_top_left = [percentX, percentY];
    this.size = [percentWidth, percentHeight];
    
    // CRITICAL: Apply all styles in the right order
    this.container.style.left = percentX + '%';
    this.container.style.top = percentY + '%';
    this.container.style.width = percentWidth + '%';
    this.container.style.height = percentHeight + '%';
    
    // CRITICAL: Force height constraints to override flexbox
    this.container.style.minHeight = percentHeight + '%';
    this.container.style.maxHeight = percentHeight + '%';
    
    // Force reflow to apply changes
    this.container.offsetHeight;
    
    // Debug height changes
    if (this.resizeDirection.includes('s') || this.resizeDirection.includes('n')) {
      console.log(`Height resize: direction=${this.resizeDirection}, newHeight=${newHeight.toFixed(1)}px, percent=${percentHeight.toFixed(1)}%`);
      console.log(`Container computed height: ${this.container.getBoundingClientRect().height.toFixed(1)}px`);
    }
  };



  render = (): void => {
    // Generate dynamic dropdown HTML
    const dynamicDropdownsHTML = this.generateAllDropdownsHTML();

    // Generate text elements HTML
    const textElementsHTML = Array.from(this.textConfigs.values())
    .map(config => `
      <div class="text-element ${config.className || ''}" id="text-${config.id}-${this.key}">
        ${config.content}
      </div>
    `).join('');

    this.container.innerHTML = `
    <div class="bige-container ${this.state.isCollapsed ? 'collapsed' : ''}">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <div class="header-icon">
            <i data-lucide="bar-chart-3" width="20" height="20"></i>
          </div>
          <div class="header-text">
            <h1>${this.title}</h1>
            <p>Biomechanics-informed GenAI for Exercise Science
</p>
          </div>
          <div class="toggle-icon" style="margin-left: auto; cursor: pointer;">
            <i data-lucide="chevron-down" width="16" height="16" class="${this.state.isCollapsed ? 'rotated' : ''}"></i>
          </div>
        </div>
      </div>

      <!-- Collapsible Content -->
      <div class="content ${this.state.isCollapsed ? 'collapsed' : ''}">
        <!-- Text Elements -->
        <div class="text-elements-container">
          ${textElementsHTML}
        </div>
        
        <!-- Dynamic Dropdowns Container -->
        <div class="dynamic-dropdowns-container">
          ${dynamicDropdownsHTML}
        </div>

        <!-- Status Display -->
        <div class="status-display">
          <div class="status-label">Current Configuration</div>
          <div class="status-tags" id="statusTags-${this.key}"></div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="analyze-btn" id="analyzeBtn-${this.key}">
            <i data-lucide="play" width="16" height="16" id="playIcon-${this.key}"></i>
            <div class="spinner hidden" id="spinner-${this.key}"></div>
            <span id="btnText-${this.key}">Analyze</span>
          </button>
          <button class="settings-btn">
            <i data-lucide="settings" width="16" height="16"></i>
          </button>
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



  // Public method to update the title
  setTitle = (newTitle: string): void => {
    this.title = newTitle;
    const titleElement = this.container.querySelector('.header-text h1');
    if (titleElement) {
      titleElement.textContent = newTitle;
    }
    console.log(`BIGE Container ${this.key}: Title updated to "${newTitle}"`);
  };

  // Add method to add text elements
  addText = (config: TextConfig): void => {
    this.textConfigs.set(config.id, config);
    
    // Re-render to include the new text
    this.render();
    this.bindEvents();
    this.initializeLucideIcons();
    
    console.log(`BIGE Container ${this.key}: Added text ${config.id}`);
  };


  generateAllDropdownsHTML = (): string => {
    const dropdowns = Array.from(this.dropdownConfigs.values());
    
    // Group dropdowns by their grid position
    const fullWidthDropdowns = dropdowns.filter(d => !d.gridPosition || d.gridPosition === 'full');
    const leftGridDropdowns = dropdowns.filter(d => d.gridPosition === 'left');
    const rightGridDropdowns = dropdowns.filter(d => d.gridPosition === 'right');
    
    let html = '';
    
    // Render full-width dropdowns
    fullWidthDropdowns.forEach(config => {
      html += this.generateDropdownHTML(config, 'full');
    });
    
    // Render grid dropdowns (left and right pairs)
    const maxGridRows = Math.max(leftGridDropdowns.length, rightGridDropdowns.length);
    for (let i = 0; i < maxGridRows; i++) {
      const leftDropdown = leftGridDropdowns[i];
      const rightDropdown = rightGridDropdowns[i];
      
      if (leftDropdown || rightDropdown) {
        html += '<div class="select-group grid">';
        
        if (leftDropdown) {
          html += `<div>${this.generateDropdownHTML(leftDropdown, 'grid-item')}</div>`;
        } else {
          html += '<div></div>'; // Empty grid item
        }
        
        if (rightDropdown) {
          html += `<div>${this.generateDropdownHTML(rightDropdown, 'grid-item')}</div>`;
        } else {
          html += '<div></div>'; // Empty grid item
        }
        
        html += '</div>';
      }
    }
    
    return html;
  };

  generateDropdownHTML = (config: DropdownConfig, containerType: 'full' | 'grid-item' = 'full'): string => {
    const optionsHTML = config.options
      .map(option => `<option value="${option}" ${option === config.defaultValue ? 'selected' : ''}>${option}</option>`)
      .join('');

    const dropdownHTML = `
      <label class="select-label">${config.label}</label>
      <div class="select-wrapper">
        <select class="custom-select" id="dynamic-${config.id}-${this.key}">
          ${optionsHTML}
        </select>
        <i data-lucide="chevron-down" class="select-icon" width="16" height="16"></i>
      </div>
    `;

    if (containerType === 'full') {
      return `<div class="select-group">${dropdownHTML}</div>`;
    } else {
      return dropdownHTML;
    }
  };


  // Method to update text content
  updateTextContent = (textId: string, newContent: string): void => {
    const config = this.textConfigs.get(textId);
    if (config) {
      config.content = newContent;
      const textElement = this.container.querySelector(`#text-${textId}-${this.key}`);
      if (textElement) {
        textElement.innerHTML = newContent;
      }
    }
  };

  // Method to remove text
  removeText = (textId: string): void => {
    this.textConfigs.delete(textId);
    this.render();
    this.bindEvents();
    this.initializeLucideIcons();
  };



  // Initialize Lucide icons with proper fallback handling
  initializeLucideIcons = (): void => {
    // Safe method using window object
    const lucideInstance = (window as any).lucide;
    
    if (lucideInstance && typeof lucideInstance.createIcons === 'function') {
      lucideInstance.createIcons();
    }

    // Fallback: try again after a short delay
    setTimeout(() => {
      const lucideInstance = (window as any).lucide;
      if (lucideInstance && typeof lucideInstance.createIcons === 'function') {
        lucideInstance.createIcons();
      }
    }, 100);
  };


  bindDynamicDropdownEvents = (): void => {
    // Clear existing dynamic dropdown references
    this.elements.dynamicDropdowns.clear();

    // Bind events for all dynamic dropdowns
    this.dropdownConfigs.forEach((config, id) => {
      const dropdown = this.container.querySelector(`#dynamic-${id}-${this.key}`) as HTMLSelectElement;
      if (dropdown) {
        this.elements.dynamicDropdowns.set(id, dropdown);
        
        dropdown.addEventListener('change', (e: Event) => {
          const target = e.target as HTMLSelectElement;
          this.handleDynamicDropdownChange(id, target.value);
          
          // Call custom onChange if provided
          if (config.onChange) {
            config.onChange(target.value);
          }
        });

        // Set initial value if exists
        const savedValue = this.dynamicState.get(id);
        if (savedValue && config.options.includes(savedValue)) {
          dropdown.value = savedValue;
        } else if (config.defaultValue) {
          dropdown.value = config.defaultValue;
          this.dynamicState.set(id, config.defaultValue);
        }
      }
    });
  };

  // Public method to add a new dropdown (simulates receiving message)
  addDropdown = (config: DropdownConfig): void => {
    this.dropdownConfigs.set(config.id, config);
    
    // Set initial state
    if (config.defaultValue) {
      this.dynamicState.set(config.id, config.defaultValue);
    } else if (config.options.length > 0) {
      this.dynamicState.set(config.id, config.options[0]);
    }
    
    // Re-render to include the new dropdown
    this.render();
    this.bindEvents();
    this.initializeLucideIcons();
    
    console.log(`BIGE Container ${this.key}: Added dropdown ${config.id}`);
    this.updateStatusDisplay();
  };

  // Public method to remove a dropdown
  removeDropdown = (dropdownId: string): void => {
    this.dropdownConfigs.delete(dropdownId);
    this.dynamicState.delete(dropdownId);
    this.elements.dynamicDropdowns.delete(dropdownId);
    
    // Re-render to remove the dropdown
    this.render();
    this.bindEvents();
    this.initializeLucideIcons();
    
    console.log(`BIGE Container ${this.key}: Removed dropdown ${dropdownId}`);
    this.updateStatusDisplay();
  };

  // Public method to update dropdown options (simulates receiving message)
  updateDropdownOptions = (dropdownId: string, newOptions: string[], newDefaultValue?: string): void => {
    const config = this.dropdownConfigs.get(dropdownId);
    if (config) {
      const currentValue = this.dynamicState.get(dropdownId);
      
      config.options = newOptions;
      
      // Handle default value
      if (newDefaultValue && newOptions.includes(newDefaultValue)) {
        config.defaultValue = newDefaultValue;
        this.dynamicState.set(dropdownId, newDefaultValue);
      } else if (currentValue && newOptions.includes(currentValue)) {
        // Keep current value if it's still valid
        config.defaultValue = currentValue;
      } else if (newOptions.length > 0) {
        // Fall back to first option
        config.defaultValue = newOptions[0];
        this.dynamicState.set(dropdownId, newOptions[0]);
      }
      
      // Re-render to update the dropdown
      this.render();
      this.bindEvents();
      this.initializeLucideIcons();
      
      console.log(`BIGE Container ${this.key}: Updated dropdown ${dropdownId} options`);
      this.updateStatusDisplay();
    }
  };

  // Get current value of a dropdown
  getDropdownValue = (dropdownId: string): string | null => {
    return this.dynamicState.get(dropdownId) || null;
  };

  // Get all dropdown values
  getAllDropdownValues = (): Map<string, string> => {
    return new Map(this.dynamicState);
  };

  handleDynamicDropdownChange = (dropdownId: string, value: string): void => {
    this.dynamicState.set(dropdownId, value);
    this.updateStatusDisplay();
    console.log(`BIGE Container ${this.key}: ${dropdownId} changed to ${value}`);
  };

  handleAnalyze = (): void => {
    if (this.state.isLoading) return;
    
    const currentConfig = Object.fromEntries(this.dynamicState);
    console.log(`BIGE Container ${this.key}: Starting analysis with config:`, currentConfig);
    
    this.state.isLoading = true;
    
    // Update UI elements
    if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = true;
    if (this.elements.playIcon) this.elements.playIcon.classList.add('hidden');
    if (this.elements.spinner) this.elements.spinner.classList.remove('hidden');
    if (this.elements.btnText) this.elements.btnText.textContent = 'Analyzing...';

    // Simulate analysis
    setTimeout(() => {
      this.state.isLoading = false;
      
      // Reset UI elements
      if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = false;
      if (this.elements.playIcon) this.elements.playIcon.classList.remove('hidden');
      if (this.elements.spinner) this.elements.spinner.classList.add('hidden');
      if (this.elements.btnText) this.elements.btnText.textContent = 'Analyze';
      
      console.log(`BIGE Container ${this.key}: Analysis completed`);
    }, 2000);
  };

  toggleCollapse = (): void => {
    this.state.isCollapsed = !this.state.isCollapsed;
    const container = this.container.querySelector('.bige-container');
    container?.classList.toggle('collapsed', this.state.isCollapsed);
    console.log(`BIGE Container ${this.key}: Toggled collapse to ${this.state.isCollapsed}`);
  };

  updateStatusDisplay = (): void => {
    if (!this.elements.statusTags) return;
    
    const configValues = Array.from(this.dynamicState.values());
    this.elements.statusTags.innerHTML = configValues
      .map(value => `<span class="status-tag">${value}</span>`)
      .join('');
  };

  // Public methods for external control
  setValue = (field: string, value: string | boolean): void => {
    if (typeof value === 'boolean') {
      // Handle state values
      (this.state as any)[field] = value;
    } else {
      // Handle dropdown values
      if (this.dropdownConfigs.has(field)) {
        this.dynamicState.set(field, value);
        
        // Update the corresponding dropdown element if it exists
        const dropdown = this.elements.dynamicDropdowns.get(field);
        if (dropdown) {
          dropdown.value = value;
        }
      }
    }
    
    this.updateStatusDisplay();
    console.log(`BIGE Container ${this.key}: Set ${field} to ${value}`);
  };

  getState = (): { state: BigeState; dropdowns: { [key: string]: string } } => {
    return {
      state: { ...this.state },
      dropdowns: Object.fromEntries(this.dynamicState)
    };
  };


  bindEvents = (): void => {
    // Cache static DOM elements
    this.elements.statusTags = this.container.querySelector(`#statusTags-${this.key}`);
    this.elements.analyzeBtn = this.container.querySelector(`#analyzeBtn-${this.key}`) as HTMLButtonElement;
    this.elements.playIcon = this.container.querySelector(`#playIcon-${this.key}`);
    this.elements.spinner = this.container.querySelector(`#spinner-${this.key}`);
    this.elements.btnText = this.container.querySelector(`#btnText-${this.key}`);

    // Bind dynamic dropdown events
    this.bindDynamicDropdownEvents();

    // Analyze button event listener
    this.elements.analyzeBtn?.addEventListener('click', this.handleAnalyze);

    // Add collapse toggle functionality (but prevent when dragging)
    const header = this.container.querySelector('.header');
    header?.addEventListener('click', this.handleHeaderClick);
    header?.addEventListener('touchend', this.handleHeaderTouchEnd);



    // Add drag functionality
    this.initializeDragHandlers();

    // Initialize display
    this.updateStatusDisplay();
  };

    // Add new touch handler specifically for collapse
  handleHeaderTouchEnd = (e: TouchEvent): void => {
    // Prevent collapse/expand if we just finished dragging or resizing
    if (this.dragOccurred || this.resizeOccurred) {
      this.dragOccurred = false; 
      this.resizeOccurred = false;
      return;
    }

    // Only toggle collapse if not touching on toggle icon or buttons
    const target = e.target as HTMLElement;
    const isToggleIcon = target.closest('.toggle-icon');
    const isButton = target.closest('button');
    
    if (!isToggleIcon && !isButton) {
      this.toggleCollapse();
      e.preventDefault(); // Prevent click event from also firing
    }
  };

  
  // Update the handleHeaderClick method to also check for resize
  handleHeaderClick = (e: Event): void => {
    // Prevent collapse/expand if we just finished dragging or resizing
    if (this.dragOccurred || this.resizeOccurred) {
      this.dragOccurred = false; 
      this.resizeOccurred = false;
      return;
    }


    // Check if this is a touch device and if a touchend event would have handled this
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && e.type === 'click') {
      // Let touchend handle it instead
      return;
    }

    // Only toggle collapse if not clicking on toggle icon
    const target = e.target as HTMLElement;
    const isToggleIcon = target.closest('.toggle-icon');
    
    if (!isToggleIcon) {
      this.toggleCollapse();
    }
  };

  // Initialize both drag and resize event handlers
  initializeDragHandlers = (): void => {
    const header = this.container.querySelector('.header') as HTMLElement;
    if (!header) return;

    // Make header show it's draggable
    header.style.cursor = 'move';
    header.style.userSelect = 'none';

    // Mouse events for dragging
    header.addEventListener('mousedown', this.handleDragStart);
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);

    // Touch events for mobile support
    header.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);

    // Initialize resize handlers
    this.initializeResizeHandlers();
  };

  // Mouse drag handlers
  handleDragStart = (e: MouseEvent): void => {
    // Don't start drag if clicking on toggle icon or buttons
    const target = e.target as HTMLElement;
    if (target.closest('.toggle-icon') || target.closest('button')) {
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

  // Touch drag handlers
  handleTouchStart = (e: TouchEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('.toggle-icon') || target.closest('button')) {
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

  // Update startDrag to reset the drag occurred flag
  startDrag = (clientX: number, clientY: number): void => {
    this.isDragging = true;
    this.dragOccurred = false; // Reset at start of potential drag
    this.dragStartX = clientX;
    this.dragStartY = clientY;

    // Get current position as pixels
    const rect = this.container.getBoundingClientRect();
    const parentRect = this.container.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      this.containerStartX = rect.left - parentRect.left;
      this.containerStartY = rect.top - parentRect.top;
    }

    // Add visual feedback
    this.container.style.zIndex = '9999';
    this.container.style.opacity = '0.9';
    
    console.log(`BIGE Container ${this.key}: Started dragging`);
  };

  // Update updateDrag to track that movement occurred
  updateDrag = (clientX: number, clientY: number): void => {
    if (!this.isDragging) return;

    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    // If we've moved more than a few pixels, consider it a drag
    const dragThreshold = 3;
    if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
      this.dragOccurred = true;
    }

    const newX = this.containerStartX + deltaX;
    const newY = this.containerStartY + deltaY;

    // Get parent dimensions for boundary checking
    const parentRect = this.container.parentElement?.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    if (parentRect) {
      // Constrain to parent bounds
      const maxX = parentRect.width - containerRect.width;
      const maxY = parentRect.height - containerRect.height;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      // Convert back to percentages for consistency
      const percentX = (constrainedX / parentRect.width) * 100;
      const percentY = (constrainedY / parentRect.height) * 100;

      // Update position
      this.from_top_left = [percentX, percentY];
      this.container.style.left = percentX + '%';
      this.container.style.top = percentY + '%';
    }
  };

  // Update endDrag to handle the click prevention
  endDrag = (): void => {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Remove visual feedback
    this.container.style.zIndex = '1000';
    this.container.style.opacity = '1';
    
    console.log(`BIGE Container ${this.key}: Ended dragging at position [${this.from_top_left[0].toFixed(1)}%, ${this.from_top_left[1].toFixed(1)}%]`);
    
    // If a drag occurred, we'll prevent the click event in handleHeaderClick
    // The dragOccurred flag will be reset there
  };

  // Public method to get current position
  getPosition = (): number[] => {
    return [...this.from_top_left];
  };

  // Public method to check if currently dragging
  isDraggingContainer = (): boolean => {
    return this.isDragging;
  };

  

  // New method to initialize resize handlers
  initializeResizeHandlers = (): void => {
    const resizeHandles = this.container.querySelectorAll('.resize-handle');
    
    resizeHandles.forEach(handle => {
      const htmlHandle = handle as HTMLElement;
      
      // Mouse events for resizing
      htmlHandle.addEventListener('mousedown', this.handleResizeStart);
      
      // Touch events for mobile support
      htmlHandle.addEventListener('touchstart', this.handleResizeTouchStart, { passive: false });
    });

    // Global mouse/touch events for resizing
    document.addEventListener('mousemove', this.handleResizeMove);
    document.addEventListener('mouseup', this.handleResizeEnd);
    document.addEventListener('touchmove', this.handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleResizeTouchEnd);
  };

  // Resize event handlers
  handleResizeStart = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    this.resizeDirection = target.getAttribute('data-direction') || '';
    
    this.startResize(e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation(); // Prevent drag from starting
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

  // Touch resize handlers
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

  // Update the resize logic methods with better mouse tracking
  startResize = (clientX: number, clientY: number): void => {
    this.isResizing = true;
    this.resizeOccurred = false;
    this.resizeStartX = clientX;
    this.resizeStartY = clientY;

    // Get current position and size as pixels relative to parent
    const rect = this.container.getBoundingClientRect();
    const parentRect = this.container.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      this.containerStartX = rect.left - parentRect.left;
      this.containerStartY = rect.top - parentRect.top;
      this.containerStartWidth = rect.width;
      this.containerStartHeight = rect.height;
    }

    // Add visual feedback
    this.container.style.zIndex = '9999';
    this.container.style.opacity = '0.9';
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.getCursorForDirection(this.resizeDirection);
    
    console.log(`BIGE Container ${this.key}: Started resizing in direction ${this.resizeDirection}`);
  };


  endResize = (): void => {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    
    // Remove visual feedback and restore cursor
    this.container.style.zIndex = '1000';
    this.container.style.opacity = '1';
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    console.log(`BIGE Container ${this.key}: Ended resizing to size [${this.size[0].toFixed(1)}%, ${this.size[1].toFixed(1)}%]`);
  };

  // Helper method to get appropriate cursor for resize direction
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

  // Public method to check if currently resizing
  isResizingContainer = (): boolean => {
    return this.isResizing;
  };




  // Update dispose method to clean up resize handlers
  dispose = (): void => {
    // Clear drag event listeners
    const header = this.container.querySelector('.header') as HTMLElement;
    if (header) {
      header.removeEventListener('mousedown', this.handleDragStart);
      header.removeEventListener('touchstart', this.handleTouchStart);
      header.removeEventListener('click', this.handleHeaderClick);
      header.removeEventListener('touchend', this.handleHeaderTouchEnd);
    }
    
    // Clear resize event listeners
    const resizeHandles = this.container.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
      const htmlHandle = handle as HTMLElement;
      htmlHandle.removeEventListener('mousedown', this.handleResizeStart);
      htmlHandle.removeEventListener('touchstart', this.handleResizeTouchStart);
    });
    
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);

    // Clear all other event listeners
    this.elements.dynamicDropdowns.forEach((dropdown, id) => {
      dropdown.removeEventListener('change', this.handleDynamicDropdownChange as any);
    });
    
    this.elements.analyzeBtn?.removeEventListener('click', this.handleAnalyze);
    
    console.log(`BIGE Container ${this.key}: Disposed`);
  };
}

export default BigeContainer;