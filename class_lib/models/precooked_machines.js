function altCurrent(amplitude = 10, freq_hz = 60, phase_deg = 0) {
  let ang_freq = 2 * PI * freq_hz
  let phase_rad = (PI * phase_deg) / 180
  return time => amplitude * cos(ang_freq * time + phase_rad)
}

/** Single wire, with alternating current at the origin - 10A / 60Hz */
function singleWire() {
  let machine = new Machine([new Wire(createVector(0, 0), altCurrent())])
  let graphics = new Graphics(machine, circular_mask(), 60, 10, 6e-2)
  return { machine, graphics }
}

//**Two wires with opposing alternating currents - 10A / 60Hz */
function doubleWire() {
  let wire_1 = new Wire(createVector(0, -1), altCurrent(10, 60, 0))
  let wire_2 = new Wire(createVector(0, 1), altCurrent(10, 60, 180))
  let machine = new Machine([wire_1, wire_2])

  let graphics = new Graphics(machine, circular_mask(1.45), 60, 10, 6e-2)
  return { machine, graphics }
}

//** 3-phase system of currents, all with 10A / 60Hz */
function rotatingMachine(num_poles = 2) {
  if (![2, 4, 6].includes(num_poles)) throw "Machine must have 2, 4 or 6 poles"

  let wires = []
  let phase = 0
  for (let i = 0; i < 3 * num_poles; i++) {
    let angle = (i * PI * 2) / (3 * num_poles)
    let position = createVector(cos(angle), sin(angle))
    let current = altCurrent(10, 60, phase)
    wires.push(new Wire(position, current))
    phase -= 60
  }

  let machine = new Machine(wires)
  let radius = num_poles == 2 ? 0.7 : 0.8
  let graphics = new Graphics(machine, circular_mask(radius), 70, 10, 6e-2)
  return { machine, graphics }
}
