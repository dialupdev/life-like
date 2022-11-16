export class TickEvent extends Event {
  constructor() {
    super("tick");
  }
}

export class PlayEvent extends Event {
  constructor() {
    super("play");
  }
}

export class PauseEvent extends Event {
  constructor() {
    super("pause");
  }
}

export class ResetEvent extends Event {
  constructor() {
    super("reset");
  }
}

export class RecenterEvent extends Event {
  constructor() {
    super("recenter");
  }
}
