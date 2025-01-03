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
  constructor(public run: (delta: number, x: number, y: number) => void) {}
}

export class DragPlugin {
  constructor(
    public run: (x: number, y: number, deltaX: number, deltaY: number) => void,
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
  private _dragPlugins = new Set<DragPlugin>();
  private _keyboardPlugins = new Map<string, KeyboardPlugin>();
  private _lastMouseX!: number;
  private _lastMouseY!: number;
  private _dragCursor?: string;

  constructor(canvas: HTMLCanvasElement) {
    this._runResizePlugins = this._runResizePlugins.bind(this);
    this._runWheelPlugins = this._runWheelPlugins.bind(this);
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
      plugin.run(e.deltaY, e.clientX, e.clientY);
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

    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    for (const plugin of this._dragPlugins) {
      plugin.run(e.clientX, e.clientY, 0, 0);
    }

    this._dragCursor && document.body.style.setProperty("cursor", this._dragCursor);
    window.addEventListener("mousemove", this._runDragPlugins);
  }

  private _stopDrag(): void {
    this._dragCursor && document.body.style.removeProperty("cursor");
    window.removeEventListener("mousemove", this._runDragPlugins);
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
    window.addEventListener("resize", throttle(this._runResizePlugins, 500));
    canvas.addEventListener("wheel", this._runWheelPlugins);
    canvas.addEventListener("mousedown", this._startDrag);
    window.addEventListener("mouseup", this._stopDrag);
    window.addEventListener("keydown", this._runKeyboardPlugin, true);
  }

  public activate(plugin: Plugin): void {
    if (plugin instanceof ResizePlugin) {
      this._resizePlugins.add(plugin);
    } else if (plugin instanceof WheelPlugin) {
      this._wheelPlugins.add(plugin);
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
    } else if (plugin instanceof DragPlugin) {
      this._dragPlugins.delete(plugin);
      if (plugin.options?.cursor) delete this._dragCursor;
    } else if (plugin instanceof KeyboardPlugin) {
      this._keyboardPlugins.delete(plugin.keyBindings);
    }
  }
}
