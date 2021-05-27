type Grid = boolean[][]

export class Conway {
  private grid: Grid
  constructor(public width: number, public height: number, private wrap = false) {
    this.grid = this.createBlankGrid()
    for (let i = 0; i < height; i += 1) {
      for (let j = 0; j < width; j += 1) {
        this.grid[i][j] = Math.random() < 0.25
      }
    }
  }

  next() {
    const grid = this.createBlankGrid()
    for (let i = 0; i < this.height; i += 1) {
      for (let j = 0; j < this.width; j += 1) {
        const neighbours = this.countNeighbours(this.grid, j, i)
        grid[i][j] = this.grid[i][j]
        if (this.grid[i][j]) {
          if (neighbours <= 1 || neighbours >= 4) grid[i][j] = false
        } else {
          if (neighbours == 3) grid[i][j] = true
        }
      }
    }
    this.grid = grid
  }

  get(x: number, y: number) {
    if (this.wrap) {
      return this.grid[(y + this.height) % this.height][(x + this.width) % this.width]
    }
    if (this.isInBounds(x, y)) {
      return this.grid[y][x]
    }
    throw new Error(`Coordinates: x: ${x} y: ${y} are out of bounds`)
  }

  private isInBounds(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  private countNeighbours(grid: Grid, x: number, y: number) {
    let count = 0
    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        if (i == 0 && j == 0) continue
        const nx = x - i
        const ny = y - j
        count += this.get(nx, ny) ? 1 : 0
      }
    }
    return count
  }

  private createBlankGrid() {
    const grid = []
    for (let i = 0; i < this.height; i += 1) {
      grid.push([])
      for (let j = 0; j < this.width; j += 1) {
        grid[i].push(false)
      }
    }
    return grid
  }
}
