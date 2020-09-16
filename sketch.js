const configs = [
  "Single wire",
  "Two wires",
  "2-Pole rotating field",
  "4-Pole rotating field",
  "6-Pole rotating field",
]
function setup() {
  dropdown_menu = createSelect()
  dropdown_menu.position(10, 10)
  for (let config of configs) dropdown_menu.option(config)
  dropdown_menu.changed(change_machine)
  createCanvas(windowWidth * 0.6, windowHeight * 0.6)

  let config = singleWire()
  machine = config.machine
  graphics = config.graphics

  time = 0
  frequency = 60
  period = 1 / frequency
}

function draw() {
  background(120)
  //background('#ffffff')
  translate(width / 2, height / 2)

  graphics.draw(machine, time, transparency(time))
  time += period / 100
}

function transparency(time) {
  let transition = 1.5
  if (time > transition * period) return 255
  return (255 * time) / (transition * period)
}

function change_machine() {
  machine_type = dropdown_menu.value()
  let config
  switch (machine_type) {
    case configs[1]:
      config = doubleWire()
      break
    case configs[2]:
      config = rotatingMachine(2)
      break
    case configs[3]:
      config = rotatingMachine(4)
      break
    case configs[4]:
      config = rotatingMachine(6)
      break
    default:
      config = singleWire()
      break
  }

  machine = config.machine
  graphics = config.graphics

  time = 0
}
