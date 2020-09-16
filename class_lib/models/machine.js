class Machine {
  /**
   * Initialize new electrical machine (collection of wires + medium)
   * @param {list_of_wires} wires Wires which make up the machine
   * @param {float} relative_permeability Relative magnetic permeability of the medium
   */
  constructor(wires, relative_permeability = 5000) {
    this.wires = wires
    this.relative_permeability = relative_permeability
  }

  /**Include wires in given mask so that no grid point is on top of a wire */
  mask_wires(original_mask) {
    return position => {
      if (!original_mask(position)) return false
      for (let wire of this.wires) {
        if (wire.dist_sq(position) < 2e-2) return false
      }
      return true
    }
  }

  magnetic_field_at(position, time) {
    let total_field = createVector(0, 0)
    for (let wire of this.wires) {
      total_field.add(
        wire.magnetic_field_at(position, time, this.relative_permeability)
      )
    }
    return total_field
  }
}
