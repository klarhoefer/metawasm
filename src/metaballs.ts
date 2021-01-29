
let decoder = new TextDecoder();

function buffer2text(ptr: number, len: number): string {
    let buffer = new Uint8Array(app.mem.buffer, ptr, len);
    return decoder.decode(buffer);
}

async function loadRenderer() {
    let resp = await fetch("metaballs.wasm");
    let buffer = await resp.arrayBuffer();
    let imp = {
        env: {
            jslog: (ptr: number, len: number) => console.log(buffer2text(ptr, len))
        }
    };
    let mod = await WebAssembly.instantiate(buffer, imp);
    return mod.instance;
}

let cnvs = document.getElementById('meatballs') as HTMLCanvasElement;
let addr: number;

const BytesPerPixel = 4;

function draw() {
    let ctx = cnvs.getContext('2d');
    let buffer = new Uint8ClampedArray(app.mem.buffer, addr, cnvs.width * cnvs.height * BytesPerPixel);
    let img = new ImageData(buffer, cnvs.width, cnvs.height);
    ctx?.putImageData(img, 0, 0);
}

type FnInit = (w: number, h: number) => number;
type FnTerm = (app: number) => void;
type FnAddr = (app: number) => number;
type FnDraw = (app: number) => void;

interface App {
    mem: WebAssembly.Memory,
    init: FnInit,
    term: FnTerm,
    addr: FnAddr,
    draw: FnDraw
}

let app: App;

loadRenderer().then(inst => {
    console.log(inst);
    app = {
        mem: inst.exports.memory as WebAssembly.Memory,
        init: inst.exports.metaballs_init as FnInit,
        term: inst.exports.metaballs_term as FnTerm,
        addr: inst.exports.metaballs_addr as FnAddr,
        draw: inst.exports.metaballs_draw as FnDraw
    };
    let ptr = app.init(cnvs.width, cnvs.height);
    app.draw(ptr);
    addr = app.addr(ptr);
    draw();
    app.term(ptr);
});
