#[derive(Hash, PartialEq, Eq, Clone, Copy, Debug)]
pub struct Cell {
    pub x: i32,
    pub y: i32,
}

impl Cell {
    pub fn new(x: i32, y: i32) -> Self {
        Cell { x, y }
    }

    pub fn generate_neighbors(&self) -> [Cell; 8] {
        let neighbors = [
            Cell::new(self.x - 1, self.y - 1),
            Cell::new(self.x - 1, self.y),
            Cell::new(self.x - 1, self.y + 1),
            Cell::new(self.x, self.y - 1),
            Cell::new(self.x, self.y + 1),
            Cell::new(self.x + 1, self.y - 1),
            Cell::new(self.x + 1, self.y),
            Cell::new(self.x + 1, self.y + 1),
        ];

        neighbors
    }
}
