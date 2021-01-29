
type FnInit = (w: number, h: number) => number;
type FnVoid = (app: number) => void;
type FnAddr = (app: number) => number;
type FnCircle = (app: number, x: number, y: number, r: number) => void;

type Circle = {
    x: number,
    y: number,
    r: number,
    dx: number,
    dy: number,
}

class Circles {
    circles: Circle[] = [];

    constructor(count: number, width: number, height: number, minRadius: number, maxRadius: number) {
        let diffRadius = maxRadius - maxRadius;
        for (let i = 0; i < count; ++i) {
            this.circles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: minRadius + Math.random() * diffRadius,
                dx: Math.random() * 2 - 1,
                dy: Math.random() * 2 - 1
            });
        }
    }

    update() {
        for (let circle of this.circles) {
            circle.x += circle.dx;
            circle.y += circle.dy;
            if (circle.x < 0 || circle.x > app.width) {
                circle.dx = -circle.dx;
                circle.x += circle.dx;
            }
            if (circle.y < 0 || circle.y > app.height) {
                circle.dy = -circle.dy;
                circle.y += circle.dy;
            }
        }
    }
}

class App {
    handle: number;
    mem: WebAssembly.Memory;
    init: FnInit;
    term: FnVoid;
    addr: FnAddr;
    draw: FnVoid;
    clear_circles: FnVoid;
    add_circle: FnCircle;

    img: ImageData;
    cnvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    decoder: TextDecoder;

    get width() {
        return this.cnvs.width;
    }

    get height() {
        return this.cnvs.height;
    }

    constructor(exp: Record<string, WebAssembly.ExportValue>, cnvs: HTMLCanvasElement) {
        this.mem = exp.memory as WebAssembly.Memory;

        this.init = exp.metaballs_init as FnInit;
        this.term = exp.metaballs_term as FnVoid;
        this.addr = exp.metaballs_addr as FnAddr;
        this.clear_circles = exp.metaballs_clear_circles as FnVoid;
        this.add_circle = exp.metaballs_add_circle as FnCircle;
        this.draw = exp.metaballs_draw as FnVoid;

        this.decoder = new TextDecoder();

        this.cnvs = cnvs;
        this.ctx = cnvs.getContext('2d')!;

        this.handle = this.init(cnvs.width, cnvs.height);

        let addr = this.addr(this.handle);
        const BytesPerPixel = 4;
        let buffer = new Uint8ClampedArray(this.mem.buffer, addr, cnvs.width * cnvs.height * BytesPerPixel);
        this.img = new ImageData(buffer, cnvs.width, cnvs.height);
    }

    paint(circles: Circles) {
        this.clear_circles(this.handle);
        for (let { x, y, r} of circles.circles)
            this.add_circle(this.handle, x, y, r);
        this.draw(this.handle);
        this.ctx.putImageData(this.img, 0, 0);
    }

    buffer2text(offset: number, len: number): string {
        let array = new Uint8Array(this.mem.buffer, offset, len);
        return this.decoder.decode(array);
    }
}

let app: App;
let circles: Circles;

function loop() {
    circles.update();
    
    app.paint(circles);
    
    requestAnimationFrame(loop);
}


async function loadApp() {
    let resp = await fetch("metaballs.wasm");
    let buffer = await resp.arrayBuffer();
    let imp = {
        env: {
            jslog: (ptr: number, len: number) => console.log(app.buffer2text(ptr, len))
        }
    };
    let mod = await WebAssembly.instantiate(buffer, imp);
    return mod.instance.exports;
}


loadApp().then(exp => {
    let cnvs = document.getElementById('meatballs') as HTMLCanvasElement;
    app = new App(exp, cnvs);
    circles = new Circles(12, app.width, app.height, 32, 64);

    loop();
});
