function circular_mask(radius = 1) {
  return position => position.magSq() <= radius * radius
}

/**
 * Returns list of points in triangular tiling
 * @param {float} point_density Number of points per m²
 * @param {*} mask Function of position which indicates if given point is inside the desired region
 */
function create_grid_points(point_distance, mask) {
  let points = []
  let hor_distance = point_distance

  let ver_distance = (point_distance * sqrt(3)) / 2
  let row_parity = true
  let range = 2
  let b = Math.floor(-2 * (1 / 3 + range / (sqrt(3) * point_distance)))
  let a = Math.floor(-b / 2 - range / point_distance)
  let x0_fixed = point_distance * (a + b / 2)
  let y0 = point_distance * (1 / sqrt(3) + (b * sqrt(3)) / 2)
  for (let y = y0; y <= range; y += ver_distance) {
    let x0 = row_parity ? x0_fixed : x0_fixed + hor_distance / 2
    row_parity = !row_parity
    for (let x = x0; x <= range; x += hor_distance) {
      let position = createVector(x, y)
      if (mask(position)) points.push(position)
    }
  }
  return points
}

function color_map(intensity) {
  if (intensity < 0.4) return { red: 0, blue: 255 }
  if (intensity > 1) return { red: 255, blue: 0 }
  let angle = HALF_PI * (2 * intensity - 1)
  let blue = 255 * cos(angle)
  let red = 255 * sin(angle)
  return { red, blue }
}

class Graphics {
  /**
   *
   * @param {Machine} machine Machine which will be drawn
   * @param {Function} mask Function of position which indicates if given point is inside the region to be drawn
   * @param {float} point_density Number of points per m²
   * @param {float} max_current Maximum current [A] which the wires in the machine carry
   * @param {float} max_field Maximum field [T]
   */
  constructor(
    machine,
    mask = circular_mask(),
    point_density = 60,
    max_current = 10,
    max_field = 6e-2
  ) {
    this.max_current = max_current
    this.max_field = max_field
    this.point_distance = 2 / Math.sqrt(Math.sqrt(3) * point_density)
    let full_mask = machine.mask_wires(mask)
    this.field_points = create_grid_points(this.point_distance, full_mask)
    this.scale = height / 3
  }

  draw(machine, time, alpha_field = 255) {
    this.#draw_field(machine, time, alpha_field)
    for (let wire of machine.wires) this.#draw_wire(wire, time)
  }

  #draw_wire(wire, time) {
    let radius = 15
    let current_now = wire.current(time)
    let x = wire.position.x * this.scale
    let y = wire.position.y * this.scale
    push()
    stroke(20)
    fill('#b5b8b1')
    ellipse(x, y, radius)
    let relative_current = current_now / this.max_current
    let current_scale = (9 * relative_current) / (1 + 9 * abs(relative_current))
    if (current_now >= 1e-2) {
      push()
      stroke(0)
      fill(0, 255, 0)
      ellipse(x, y, current_scale * 0.4 * radius)
      pop()
    } else if (current_now <= -1e-2) {
      push()
      stroke(0)
      fill(0)
      let a = current_scale * radius * 0.6
      let b = current_scale * radius * 0.1
      rect(x - a / 2, y - b / 2, a, b)
      rect(x - b / 2, y - a / 2, b, a)
      pop()
    }
    pop()
  }

  #draw_field(machine, time, alpha) {
    push()
    strokeWeight(1.5)

    stroke(30, 30, 30, alpha)
    for (let point of this.field_points) {
      let x = point.x * this.scale
      let y = point.y * this.scale
      let base = createVector(x, y)
      let field = machine.magnetic_field_at(point, time)
      this.#draw_arrow(base, field, alpha)
    }
    pop()
  }
  #draw_arrow(base, vector, alpha) {
    let rel_vector_size = vector.mag() / this.max_field
    let vector_scale = (9 * rel_vector_size) / (1 + 9 * abs(rel_vector_size))

    let { red, blue } = color_map(vector_scale)

    push()
    translate(base.x, base.y)
    rotate(vector.heading() - HALF_PI)
    fill(red, 0, blue, alpha)
    let h2 = this.scale * this.point_distance * vector_scale
    let w1 = h2 * 0.05
    let w2 = h2 * 0.15
    let h1 = h2 * 0.6
    beginShape()
    vertex(w1, 0)
    vertex(w1, h1)
    vertex(w2, h1)
    vertex(0, h2)
    vertex(-w2, h1)
    vertex(-w1, h1)
    vertex(-w1, 0)
    endShape(CLOSE)
    pop()
  }
}
