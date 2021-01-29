
extern {
    fn jslog(p: *const u8, len: u32);
}

pub fn log(msg: &str) {
    unsafe {
        jslog(msg.as_ptr(), msg.len() as u32);
    }
}
