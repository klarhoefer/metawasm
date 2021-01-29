
use crate::js::log;

pub struct MetaBalls {
    width: usize,
    height: usize,
    pixels: Vec<u32>
}

impl MetaBalls {
    pub fn new(width: usize, height: usize) -> Self {
        let pixels = vec![0u32; width * height];
        MetaBalls {
            width, height, pixels
        }
    }

    pub fn addr(&self) -> *const u32 {
        self.pixels.as_ptr()
    }

    pub fn draw(&mut self) {
        for y in 0..self.height {
            for x in 0..self.width {
                let ix = y * self.width + x;
                let intensity = (x as f64 * 256.0 / self.width as f64) as u32 % 256;
                let shift = (y / 80) % 3;
                let col = 0xff000000 + (intensity << (shift * 8));
                self.pixels[ix] = col;
            }
        }
    }
}

impl Drop for MetaBalls {
    fn drop(&mut self) {
        log(&format!("Dropping {}x{}", self.width, self.height));
    }
}
