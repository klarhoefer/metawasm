
type FnInit = (w: number, h: number) => number;
type FnTerm = (app: number) => void;
type FnAddr = (app: number) => number;
type FnDraw = (app: number) => void;
type FnAdd = (app: number, x: number, y: number, r: number) => void;
type FnClear = (app: number) => void;

interface Exp {
    mem: WebAssembly.Memory,
    init: FnInit,
    term: FnTerm,
    addr: FnAddr,
    clear_circles: FnClear,
    add_circle: FnAdd,
    draw: FnDraw,
}

type Circle = {
    x: number,
    y: number,
    r: number,
    dx: number,
    dy: number,
}

const BytesPerPixel = 4;

let cnvs = document.getElementById('meatballs') as HTMLCanvasElement;
let ctx = cnvs.getContext('2d');

class App {
    ptr: number;
    img: ImageData;
    decoder: TextDecoder;

    constructor(private exp: Exp) {
        let ptr = exp.init(cnvs.width, cnvs.height);
        let addr = exp.addr(ptr);
        this.ptr = ptr;
        this.decoder = new TextDecoder();

        let buffer = new Uint8ClampedArray(exp.mem.buffer, addr, cnvs.width * cnvs.height * BytesPerPixel);
        this.img = new ImageData(buffer, cnvs.width, cnvs.height);
    }

    draw(circles: Circle[]) {
        this.exp.clear_circles(this.ptr);
        for (let circle of circles)
            this.exp.add_circle(this.ptr, circle.x, circle.y, circle.r);
        this.exp.draw(this.ptr);
    }

    buffer2text(offset: number, len: number): string {
        let array = new Uint8Array(this.exp.mem.buffer, offset, len);
        return this.decoder.decode(array);
    }
}

let app: App;
let circles: Circle[] = [];

function loop() {
    for (let circle of circles) {
        circle.x += circle.dx;
        circle.y += circle.dy;
        if (circle.x < 0 || circle.x > cnvs.width) {
            circle.dx = -circle.dx;
            circle.x += circle.dx;
        }
        if (circle.y < 0 || circle.y > cnvs.height) {
            circle.dy = -circle.dy;
            circle.y += circle.dy;
        }
    }

    app.draw(circles);
    ctx!.putImageData(app.img, 0, 0);

    requestAnimationFrame(loop);
}

async function loadExp() {
    let resp = await fetch("metaballs.wasm");
    let buffer = await resp.arrayBuffer();
    let imp = {
        env: {
            jslog: (ptr: number, len: number) => console.log(app.buffer2text(ptr, len))
        }
    };
    let mod = await WebAssembly.instantiate(buffer, imp);
    let inst = mod.instance;
    let exp = {
        mem: inst.exports.memory as WebAssembly.Memory,
        init: inst.exports.metaballs_init as FnInit,
        term: inst.exports.metaballs_term as FnTerm,
        addr: inst.exports.metaballs_addr as FnAddr,
        clear_circles: inst.exports.metaballs_clear_circles as FnClear,
        add_circle: inst.exports.metaballs_add_circle as FnAddr,
        draw: inst.exports.metaballs_draw as FnDraw,
    };
    return exp as Exp;
}

loadExp().then(exp => {
    for (let i = 0; i < 12; ++i) {
        circles.push({x: Math.random() * cnvs.width, y: Math.random() * cnvs.height,
            r: 20 + Math.random() * 40,
            dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1});
    }

    app = new App(exp);

    loop();
});
