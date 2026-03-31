import throttle from "lodash.throttle";

interface DragPluginOptions {
  cursor: string;
}

interface KeyboardPluginOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export class ResizePlugin {
  constructor(public run: (width: number, height: number) => void) {}
}

export class WheelPlugin {
  constructor(public run: (delta: number, viewportX: number, viewportY: number) => void) {}
}

export class MouseMovePlugin {
  constructor(public run: (viewportX: number, viewportY: number) => void) {}
}

export class MouseOutPlugin {
  constructor(public run: (viewportX: number, viewportY: number) => void) {}
}

export class DragPlugin {
  constructor(
    public run: (viewportX: number, viewportY: number, deltaX: number, deltaY: number) => void,
    public options?: DragPluginOptions
  ) {}
}

export class KeyboardPlugin {
  constructor(
    public keyBindings: string,
    public run: (key: string) => void,
    public options?: KeyboardPluginOptions
  ) {}
}

export type Plugin = ResizePlugin | WheelPlugin | DragPlugin | KeyboardPlugin;

export class PluginBuilder {
  private _resizePlugins = new Set<ResizePlugin>();
  private _wheelPlugins = new Set<WheelPlugin>();
  private _mouseMovePlugins = new Set<MouseMovePlugin>();
  private _mouseOutPlugins = new Set<MouseOutPlugin>();
  private _dragPlugins = new Set<DragPlugin>();
  private _keyboardPlugins = new Map<string, KeyboardPlugin>();
  private _lastMouseX!: number;
  private _lastMouseY!: number;
  private _dragCursor?: string;

  // During drag sessions, we don't want to trigger mousemove events, and mouseout events work differently
  private _isDragging = false;

  // If a mouseout event happens during a drag session, we want to trigger its plugins
  // at the end of the drag session (unless it also re-enters the canvas during the session)
  private _mouseoutHappenedDuringDrag = false;

  constructor(canvas: HTMLCanvasElement) {
    this._runResizePlugins = this._runResizePlugins.bind(this);
    this._runWheelPlugins = this._runWheelPlugins.bind(this);
    this._runMouseMovePlugins = this._runMouseMovePlugins.bind(this);
    this._handleMouseOver = this._handleMouseOver.bind(this);
    this._runMouseOutPlugins = this._runMouseOutPlugins.bind(this);
    this._runDragPlugins = this._runDragPlugins.bind(this);
    this._startDrag = this._startDrag.bind(this);
    this._stopDrag = this._stopDrag.bind(this);
    this._runKeyboardPlugin = this._runKeyboardPlugin.bind(this);

    this._addEventListeners(canvas);
  }

  private _runResizePlugins(e: UIEvent): void {
    const width = (e.target as Window).innerWidth;
    const height = (e.target as Window).innerHeight;

    for (const plugin of this._resizePlugins) {
      plugin.run(width, height);
    }
  }

  private _runWheelPlugins(e: WheelEvent): void {
    e.preventDefault();

    for (const plugin of this._wheelPlugins) {
      // Wheel event deltas are inverted by default
      plugin.run(e.deltaY * -1, e.clientX, e.clientY);
    }
  }

  private _runMouseMovePlugins(e: MouseEvent): void {
    if (this._isDragging) {
      return;
    }

    for (const plugin of this._mouseMovePlugins) {
      plugin.run(e.clientX, e.clientY);
    }
  }

  private _handleMouseOver(_e: MouseEvent): void {
    if (this._isDragging) {
      this._mouseoutHappenedDuringDrag = false;
    }
  }

  private _runMouseOutPlugins(e: MouseEvent): void {
    if (this._isDragging) {
      this._mouseoutHappenedDuringDrag = true;

      return;
    }

    for (const plugin of this._mouseOutPlugins) {
      plugin.run(e.clientX, e.clientY);
    }
  }

  private _runDragPlugins(e: MouseEvent): void {
    const deltaX = e.clientX - this._lastMouseX;
    const deltaY = e.clientY - this._lastMouseY;

    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    for (const plugin of this._dragPlugins) {
      plugin.run(e.clientX, e.clientY, deltaX, deltaY);
    }
  }

  private _startDrag(e: MouseEvent): void {
    // Ignore drag events triggered by right click
    if (e.button !== 0) {
      return;
    }

    this._isDragging = true;

    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    window.addEventListener("mousemove", this._runDragPlugins);
    this._dragCursor && document.body.style.setProperty("cursor", this._dragCursor);
  }

  private _stopDrag(): void {
    this._dragCursor && document.body.style.removeProperty("cursor");
    window.removeEventListener("mousemove", this._runDragPlugins);

    this._isDragging = false;

    if (this._mouseoutHappenedDuringDrag) {
      for (const plugin of this._mouseOutPlugins) {
        plugin.run(this._lastMouseX, this._lastMouseY);
      }

      this._mouseoutHappenedDuringDrag = false;
    }
  }

  private _runKeyboardPlugin(e: KeyboardEvent): void {
    let keyBindings = "";

    if (e.metaKey || e.ctrlKey) {
      keyBindings += "mod+";
    }

    keyBindings += e.key;

    const plugin = this._keyboardPlugins.get(keyBindings);

    if (plugin) {
      if (plugin.options?.preventDefault) {
        e.preventDefault();
      }

      if (plugin.options?.stopPropagation) {
        e.stopPropagation();
      }

      plugin.run(keyBindings);
    }
  }

  private _addEventListeners(canvas: HTMLCanvasElement): void {
    window.addEventListener("resize", throttle(this._runResizePlugins, 250));
    canvas.addEventListener("wheel", this._runWheelPlugins);
    canvas.addEventListener("mousemove", this._runMouseMovePlugins);
    canvas.addEventListener("mouseover", this._handleMouseOver);
    canvas.addEventListener("mouseout", this._runMouseOutPlugins);
    canvas.addEventListener("mousedown", this._startDrag);
    window.addEventListener("mouseup", this._stopDrag);
    window.addEventListener("keydown", this._runKeyboardPlugin, true);
  }

  public activate(plugin: Plugin): void {
    if (plugin instanceof ResizePlugin) {
      this._resizePlugins.add(plugin);
    } else if (plugin instanceof WheelPlugin) {
      this._wheelPlugins.add(plugin);
    } else if (plugin instanceof MouseMovePlugin) {
      this._mouseMovePlugins.add(plugin);
    } else if (plugin instanceof MouseOutPlugin) {
      this._mouseOutPlugins.add(plugin);
    } else if (plugin instanceof DragPlugin) {
      this._dragPlugins.add(plugin);
      if (plugin.options?.cursor) this._dragCursor = plugin.options.cursor;
    } else if (plugin instanceof KeyboardPlugin) {
      this._keyboardPlugins.set(plugin.keyBindings, plugin);
    }
  }

  public deactivate(plugin: Plugin): void {
    if (plugin instanceof ResizePlugin) {
      this._resizePlugins.delete(plugin);
    } else if (plugin instanceof WheelPlugin) {
      this._wheelPlugins.delete(plugin);
    } else if (plugin instanceof MouseMovePlugin) {
      this._mouseMovePlugins.delete(plugin);
    } else if (plugin instanceof MouseOutPlugin) {
      this._mouseOutPlugins.delete(plugin);
    } else if (plugin instanceof DragPlugin) {
      this._dragPlugins.delete(plugin);
      if (plugin.options?.cursor) delete this._dragCursor;
    } else if (plugin instanceof KeyboardPlugin) {
      this._keyboardPlugins.delete(plugin.keyBindings);
    }
  }
}
