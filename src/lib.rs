
mod js;

mod app;
use app::MetaBalls;


#[no_mangle]
pub extern fn metaballs_init(width: u16, height: u16) -> *mut MetaBalls {
    let app = MetaBalls::new(width as usize, height as usize);
    Box::into_raw(Box::new(app))
}

#[no_mangle]
pub extern fn metaballs_term(app: *mut MetaBalls) {
    unsafe {
        Box::from_raw(app);
    }
}

#[no_mangle]
pub extern fn metaballs_addr(app: *mut MetaBalls) -> *const u32 {
    let app = unsafe { &*app };
    app.addr()
}

#[no_mangle]
pub extern fn metaballs_clear_circles(app: *mut MetaBalls) {
    let app = unsafe { &mut *app };
    app.clear_circles();
}

#[no_mangle]
pub extern fn metaballs_add_circle(app: *mut MetaBalls, x: f32, y: f32, r: f32) {
    let app = unsafe { &mut *app };
    app.add_circle(x, y, r);
}

#[no_mangle]
pub extern fn metaballs_draw(app: *mut MetaBalls) {
    let app = unsafe { &mut *app };
    app.draw();
}


#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
