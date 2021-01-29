

all: dst/metaballs.js dst/metaballs.wasm

dst/metaballs.js: src/metaballs.ts
	tsc.cmd

dst/metaballs.wasm: src/lib.rs src/app.rs src/js.rs
	cargo build --target wasm32-unknown-unknown --release
	cmd /c move target\wasm32-unknown-unknown\release\metawasm.wasm .\dst\metaballs.wasm
	wasm-strip .\dst\metaballs.wasm
