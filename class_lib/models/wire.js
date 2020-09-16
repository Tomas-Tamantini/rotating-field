class Wire {
  /**
   * Initialize new wire, parallel to the Z-axis
   * @param {vector} position X, Y position of the wire
   * @param {Function} current Current [A] as a function of time [s]
   */
  constructor(position, current) {
    this.position = position
    this.current = current
  }

  dist_sq(point) {
    let d = p5.Vector.sub(point, this.position)
    return d.magSq()
  }

  magnetic_field_at(position, time, relative_permeability = 5000) {
    let field = p5.Vector.sub(position, this.position)
    let distance = field.mag()
    if (distance <= 1e-5) return createVector(0, 0)
    field.rotate(-HALF_PI).normalize()
    let field_value =
      (2e-7 * relative_permeability * this.current(time)) / distance
    field.mult(field_value)
    return field
  }
}
