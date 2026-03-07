type Controller = ReadableStreamDefaultController<Uint8Array>;

const encoder = new TextEncoder();

class SSEChannel {
  private controllers = new Set<Controller>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  subscribe(controller: Controller) {
    this.controllers.add(controller);
    if (this.controllers.size === 1 && !this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        this.sendRaw(": heartbeat\n\n");
      }, 30_000);
    }
  }

  unsubscribe(controller: Controller) {
    this.controllers.delete(controller);
    if (this.controllers.size === 0 && this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  broadcast(event: string, data: unknown) {
    this.sendRaw(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  private sendRaw(message: string) {
    const encoded = encoder.encode(message);
    for (const controller of this.controllers) {
      try {
        controller.enqueue(encoded);
      } catch {
        this.controllers.delete(controller);
      }
    }
  }
}

// Global singletons (survive across requests in same Node process)
const g = globalThis as unknown as {
  _chatChannel?: SSEChannel;
  _commentChannels?: Map<number, SSEChannel>;
};

export function getChatChannel(): SSEChannel {
  if (!g._chatChannel) g._chatChannel = new SSEChannel();
  return g._chatChannel;
}

export function getCommentChannel(themeId: number): SSEChannel {
  if (!g._commentChannels) g._commentChannels = new Map();
  if (!g._commentChannels.has(themeId)) g._commentChannels.set(themeId, new SSEChannel());
  return g._commentChannels.get(themeId)!;
}

export function createSSEResponse(channel: SSEChannel): Response {
  let ctrl: Controller | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller;
      channel.subscribe(controller);
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
    cancel() {
      if (ctrl) channel.unsubscribe(ctrl);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
