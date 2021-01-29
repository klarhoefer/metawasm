
use crate::js::log;

struct Circle {
    x: f32,
    y: f32,
    r: f32,
}

impl Circle {
    fn new(x: f32, y: f32, r: f32) -> Self {
        Circle { x, y, r }
    }

    fn calc(&self, x: f32, y: f32) -> f32 {
        let dx = self.x - x;
        let dy = self.y - y;
        self.r * self.r / (dx * dx + dy * dy)
    }
}

fn calc_color(x: usize, y: usize, circles: &[Circle]) -> u32 {
    let mut res = 0.0_f32;
    let x = x as f32;
    let y = y as f32;

    for circle in circles {
        res += circle.calc(x, y);
        if res > 1.0_f32 {
            return 0xff444444;
        }
    }

    0xffeeeeee
}

pub struct MetaBalls {
    width: usize,
    height: usize,
    pixels: Vec<u32>,
    circles: Vec<Circle>
}

impl MetaBalls {
    pub fn new(width: usize, height: usize) -> Self {
        let pixels = vec![0u32; width * height];
        let circles = Vec::new();

        MetaBalls {
            width, height, pixels, circles
        }
    }

    pub fn addr(&self) -> *const u32 {
        self.pixels.as_ptr()
    }

    pub fn clear_circles(&mut self) {
        self.circles.clear();
    }

    pub fn add_circle(&mut self, x: f32, y: f32, r: f32) {
        self.circles.push(Circle::new(x, y, r));
    }

    pub fn draw(&mut self) {
        for y in 0..self.height {
            for x in 0..self.width {
                let ix = y * self.width + x;
                // let intensity = (x as f64 * 256.0 / self.width as f64) as u32 % 256;
                // let shift = (y / 80) % 3;
                // let col = 0xff000000 + (intensity << (shift * 8));
                self.pixels[ix] = calc_color(x, y, &self.circles);
            }
        }
    }
}

impl Drop for MetaBalls {
    fn drop(&mut self) {
        log(&format!("Dropping {}x{}", self.width, self.height));
    }
}
