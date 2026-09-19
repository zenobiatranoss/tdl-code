/*
 * this project is a typescript simulation of the dark lord and the powers connected to his different forms.
 * the main idea is to keep his character data in one place, so his powers, stats, and attack values
 * can be changed directly without having to rewrite the simulation itself.
 */

type Vec2 = {
  x: number
  y: number
}

type TDLForm = "base" | "wristbands" | "fused-virus"

type AbilityName =
  | "superhumanPhysicality"
  | "fireball"
  | "fireBreath"
  | "flight"
  | "darkEnergyBeacon"
  | "darkOrb"
  | "laserVision"
  | "laserImmunity"
  | "virabotControl"
  | "viraBlade"
  | "viraSpikes"
  | "bandDuplication"
  | "bodyLiquefaction"
  | "shapeshifting"
  | "selfReconstruction"

type Power = {
  enabled: boolean
  level: number
  form: TDLForm
  energy?: number
  damage?: number
  radius?: number
  knockback?: number
  corrosion?: number
}

type Stats = {
  strength: number
  durability: number
  stamina: number
  speed: number
  agility: number
  intellect: number
}

type AttackResult = {
  attack: string
  hit: boolean
  damage: number
  corrosion: number
  knockback: number
  destroyed: boolean
  notes: string[]
}

type Target = {
  id: string
  name: string
  position: Vec2
  health: number
  maxHealth: number
  armor: number
  alive: boolean
  resistances: Set<string>
}

type ViraBot = {
  id: string
  position: Vec2
  targetId: string | null
  health: number
  active: boolean
}

type Construct = {
  id: string
  type: "blade" | "spike" | "orb" | "goo" | "wristband"
  position: Vec2
  scale: number
  active: boolean
}

// this is the part you change when you want to mess with tdl's source
export const tdlCode: {
  forms: Record<TDLForm, Stats>
  powers: Record<AbilityName, Power>
} = {
  forms: {
    base: {
      strength: 100,
      durability: 100,
      stamina: 100,
      speed: 100,
      agility: 100,
      intellect: 120
    },

    wristbands: {
      strength: 170,
      durability: 180,
      stamina: 180,
      speed: 190,
      agility: 190,
      intellect: 120
    },

    "fused-virus": {
      strength: 230,
      durability: 260,
      stamina: 240,
      speed: 250,
      agility: 250,
      intellect: 140
    }
  },

  // all powers are enabled here, so you can turn anything off yourself
  powers: {
    // tdl's physical power
    superhumanPhysicality: {
      enabled: true,
      level: 100,
      form: "base"
    },

    // his fireball attack
    fireball: {
      enabled: false,
      level: 100,
      form: "base",
      energy: 35,
      damage: 120,
      radius: 20,
      knockback: 20
    },

    // his fire breath
    fireBreath: {
      enabled: true,
      level: 100,
      form: "base",
      energy: 45,
      damage: 150,
      radius: 25,
      knockback: 10
    },

    // tdl's flight
    flight: {
      enabled: true,
      level: 100,
      form: "base"
    },

    // the wristband's dark energy attack
    darkEnergyBeacon: {
      enabled: true,
      level: 160,
      form: "wristbands",
      energy: 80,
      damage: 250,
      radius: 20,
      knockback: 25
    },

    // dark energy orb attack
    darkOrb: {
      enabled: true,
      level: 125,
      form: "wristbands",
      energy: 30,
      damage: 130,
      radius: 8,
      knockback: 12,
      corrosion: 45
    },

    // dark laser vision
    laserVision: {
      enabled: true,
      level: 150,
      form: "wristbands",
      energy: 60,
      damage: 170,
      radius: 10,
      knockback: 15
    },

    // resistance against laser attacks
    laserImmunity: {
      enabled: true,
      level: 100,
      form: "wristbands"
    },

    // control over the virabots
    virabotControl: {
      enabled: true,
      level: 100,
      form: "wristbands"
    },

    // tdl's virus blade
    viraBlade: {
      enabled: true,
      level: 175,
      form: "wristbands",
      energy: 18,
      damage: 180,
      knockback: 30,
      corrosion: 100
    },

    // the virus spikes
    viraSpikes: {
      enabled: true,
      level: 150,
      form: "wristbands",
      energy: 8,
      damage: 90,
      radius: 4,
      knockback: 10,
      corrosion: 90
    },

    // copying the wristband
    bandDuplication: {
      enabled: true,
      level: 125,
      form: "wristbands"
    },

    // tdl's liquid body state
    bodyLiquefaction: {
      enabled: true,
      level: 200,
      form: "fused-virus"
    },

    // changing the shape of the fused material
    shapeshifting: {
      enabled: true,
      level: 200,
      form: "fused-virus"
    },

    // rebuilding his body using the active virus
    selfReconstruction: {
      enabled: true,
      level: 200,
      form: "fused-virus"
    }
  }
}

const formLevel: Record<TDLForm, number> = {
  base: 0,
  wristbands: 1,
  "fused-virus": 2
}

const makePosition = (
  x = 0,
  y = 0
): Vec2 => ({
  x,
  y
})

const clamp = (
  value: number,
  min: number,
  max: number
) => Math.max(
  min,
  Math.min(max, value)
)

class TDLCharacter {
  readonly id: string
  readonly name = "The Dark Lord"

  form: TDLForm = "base"

  health = 1000
  maxHealth = 1000

  energy = 1000
  maxEnergy = 1000

  position = makePosition()
  velocity = makePosition()
  acceleration = makePosition()

  strength = 100
  durability = 100
  stamina = 100
  speed = 100
  agility = 100
  intellect = 120

  alive = true
  grounded = true
  liquefied = false
  virusHybrid = false

  virabots = new Map<string, ViraBot>()
  constructs = new Map<string, Construct>()

  private idCounter = 0

  constructor() {
    this.id = this.nextId("tdl")
  }

  private nextId(prefix: string) {
    this.idCounter += 1
    return `${prefix}-${this.idCounter}`
  }

  private power(name: AbilityName) {
    return tdlCode.powers[name]
  }

  private hasPower(name: AbilityName) {
    const power = this.power(name)

    return (
      power.enabled &&
      formLevel[this.form] >=
        formLevel[power.form]
    )
  }

  private spendEnergy(amount: number) {
    if (this.energy < amount) {
      return false
    }

    this.energy -= amount
    return true
  }

  private recoverEnergy(amount: number) {
    this.energy = clamp(
      this.energy + amount,
      0,
      this.maxEnergy
    )
  }

  private applyStats(form: TDLForm) {
    const stats = tdlCode.forms[form]

    this.strength = stats.strength
    this.durability = stats.durability
    this.stamina = stats.stamina
    this.speed = stats.speed
    this.agility = stats.agility
    this.intellect = stats.intellect
  }

  // normal tdl before using the wristband
  useBaseForm() {
    this.form = "base"
    this.virusHybrid = false
    this.liquefied = false
    this.applyStats("base")
  }

  // the wristband gives him the virus powers
  equipWristbands() {
    if (this.form === "fused-virus") {
      return
    }

    this.form = "wristbands"
    this.virusHybrid = false
    this.applyStats("wristbands")
    this.energy = this.maxEnergy
  }

  // the fused virus form
  fuseWristbands() {
    this.form = "fused-virus"
    this.virusHybrid = true
    this.applyStats("fused-virus")
    this.health = this.maxHealth
    this.energy = this.maxEnergy
  }

  // tdl can control groups of virabots
  createVirusArmy(count = 50) {
    if (!this.hasPower("virabotControl")) {
      return []
    }

    count = clamp(
      Math.floor(count),
      1,
      500
    )

    const bots: ViraBot[] = []

    for (let i = 0; i < count; i++) {
      const id = this.nextId("virabot")

      const bot: ViraBot = {
        id,
        position: {
          ...this.position
        },
        targetId: null,
        health: 100,
        active: true
      }

      this.virabots.set(id, bot)
      bots.push(bot)
    }

    return bots
  }

  commandViraBots(target: Target) {
    if (!this.hasPower("virabotControl")) {
      return
    }

    for (const bot of this.virabots.values()) {
      if (bot.active) {
        bot.targetId = target.id
      }
    }
  }

  deactivateViraBots() {
    for (const bot of this.virabots.values()) {
      bot.active = false
    }
  }

  // one of tdl's main fire attacks
  fireball(
    target: Target,
    charge = 1
  ): AttackResult {
    const power = this.power("fireball")

    if (!this.hasPower("fireball")) {
      return this.miss(
        "fireball",
        "fireball is disabled"
      )
    }

    charge = clamp(
      charge,
      1,
      5
    )

    if (
      !this.spendEnergy(
        (power.energy ?? 0) *
          charge
      )
    ) {
      return this.miss(
        "fireball",
        "not enough energy"
      )
    }

    return this.attack(
      target,
      "fireball",
      (power.damage ?? 0) *
        charge,
      (power.radius ?? 0) *
        charge,
      (power.knockback ?? 0) *
        charge,
      0
    )
  }

  // close range fire attack
  fireBreath(
    target: Target
  ): AttackResult {
    const power =
      this.power("fireBreath")

    if (!this.hasPower("fireBreath")) {
      return this.miss(
        "fireBreath",
        "fire breath is disabled"
      )
    }

    if (
      !this.spendEnergy(
        power.energy ?? 0
      )
    ) {
      return this.miss(
        "fireBreath",
        "not enough energy"
      )
    }

    return this.attack(
      target,
      "fireBreath",
      power.damage ?? 0,
      power.radius ?? 0,
      power.knockback ?? 0,
      0
    )
  }

  // the wristband's large dark energy attack
  darkEnergyBeacon(
    target: Target
  ): AttackResult {
    const power =
      this.power(
        "darkEnergyBeacon"
      )

    if (
      !this.hasPower(
        "darkEnergyBeacon"
      )
    ) {
      return this.miss(
        "darkEnergyBeacon",
        "dark energy beacon is disabled"
      )
    }

    if (
      !this.spendEnergy(
        power.energy ?? 0
      )
    ) {
      return this.miss(
        "darkEnergyBeacon",
        "not enough energy"
      )
    }

    return this.attack(
      target,
      "darkEnergyBeacon",
      power.damage ?? 0,
      power.radius ?? 0,
      power.knockback ?? 0,
      0
    )
  }

  // dark energy orb attack
  darkOrb(
    target: Target
  ): AttackResult {
    const power =
      this.power("darkOrb")

    if (!this.hasPower("darkOrb")) {
      return this.miss(
        "darkOrb",
        "dark orb is disabled"
      )
    }

    if (
      !this.spendEnergy(
        power.energy ?? 0
      )
    ) {
      return this.miss(
        "darkOrb",
        "not enough energy"
      )
    }

    return this.attack(
      target,
      "darkOrb",
      power.damage ?? 0,
      power.radius ?? 0,
      power.knockback ?? 0,
      power.corrosion ?? 0
    )
  }

  // dark laser vision
  laserVision(
    target: Target
  ): AttackResult {
    const power =
      this.power("laserVision")

    if (!this.hasPower("laserVision")) {
      return this.miss(
        "laserVision",
        "laser vision is disabled"
      )
    }

    if (
      !this.spendEnergy(
        power.energy ?? 0
      )
    ) {
      return this.miss(
        "laserVision",
        "not enough energy"
      )
    }

    return this.attack(
      target,
      "laserVision",
      power.damage ?? 0,
      power.radius ?? 0,
      power.knockback ?? 0,
      0
    )
  }

  // make one virus blade
  createViraBlade(
    scale = 1
  ) {
    const power =
      this.power("viraBlade")

    if (!this.hasPower("viraBlade")) {
      return null
    }

    if (
      !this.spendEnergy(
        power.energy ?? 0
      )
    ) {
      return null
    }

    return this.addConstruct(
      "blade",
      clamp(
        scale,
        0.5,
        8
      )
    )
  }

  createViraBlades(
    count = 2,
    scale = 1
  ) {
    count = clamp(
      Math.floor(count),
      1,
      32
    )

    const result: string[] = []

    for (let i = 0; i < count; i++) {
      const blade =
        this.createViraBlade(scale)

      if (blade) {
        result.push(blade)
      }
    }

    return result
  }

  // direct blade attack
  bladeSlash(
    target: Target,
    scale = 1
  ): AttackResult {
    const power =
      this.power("viraBlade")

    if (!this.hasPower("viraBlade")) {
      return this.miss(
        "viraBlade",
        "vira blade is disabled"
      )
    }

    if (
      !this.spendEnergy(
        power.energy ?? 0
      )
    ) {
      return this.miss(
        "viraBlade",
        "not enough energy"
      )
    }

    scale = clamp(
      scale,
      0.5,
      6
    )

    return this.attack(
      target,
      "viraBlade",
      (power.damage ?? 0) *
        scale,
      0,
      (power.knockback ?? 0) *
        scale,
      power.corrosion ?? 0
    )
  }

  // create corrosive virus spikes
  createViraSpikes(
    count = 1,
    scale = 1
  ) {
    const power =
      this.power("viraSpikes")

    if (!this.hasPower("viraSpikes")) {
      return []
    }

    count = clamp(
      Math.floor(count),
      1,
      64
    )

    const result: string[] = []

    for (let i = 0; i < count; i++) {
      if (
        !this.spendEnergy(
          power.energy ?? 0
        )
      ) {
        break
      }

      result.push(
        this.addConstruct(
          "spike",
          clamp(
            scale,
            0.5,
            10
          )
        )
      )
    }

    return result
  }

  spikeAttack(
    target: Target,
    count = 1
  ): AttackResult {
    const power =
      this.power("viraSpikes")

    if (!this.hasPower("viraSpikes")) {
      return this.miss(
        "viraSpikes",
        "vira spikes are disabled"
      )
    }

    count = clamp(
      Math.floor(count),
      1,
      8
    )

    if (
      !this.spendEnergy(
        (power.energy ?? 0) *
          count
      )
    ) {
      return this.miss(
        "viraSpikes",
        "not enough energy"
      )
    }

    return this.attack(
      target,
      "viraSpikes",
      (power.damage ?? 0) *
        count,
      power.radius ?? 0,
      (power.knockback ?? 0) *
        count,
      power.corrosion ?? 0
    )
  }

  // fused form can become liquid
  liquefy() {
    if (!this.hasPower(
      "bodyLiquefaction"
    )) {
      return false
    }

    this.liquefied = true
    return true
  }

  solidify() {
    this.liquefied = false
  }

  // fused virus material can be shaped into constructs
  createConstruct(
    type: Construct["type"],
    scale = 1
  ) {
    if (!this.hasPower(
      "shapeshifting"
    )) {
      return null
    }

    return this.addConstruct(
      type,
      scale
    )
  }

  // create another wristband
  duplicateWristband() {
    if (!this.hasPower(
      "bandDuplication"
    )) {
      return null
    }

    return this.addConstruct(
      "wristband",
      1
    )
  }

  // basic flight movement
  flyTo(
    target: Vec2,
    multiplier = 1
  ) {
    if (!this.hasPower("flight")) {
      return
    }

    const baseSpeed =
      this.form === "base"
        ? 1.8
        : 3

    const moveSpeed =
      baseSpeed *
      clamp(
        multiplier,
        0.25,
        5
      ) *
      this.speed / 100

    const dx =
      target.x - this.position.x

    const dy =
      target.y - this.position.y

    const distance =
      Math.hypot(dx, dy) || 1

    this.velocity.x =
      dx / distance *
      moveSpeed

    this.velocity.y =
      dy / distance *
      moveSpeed

    this.grounded = false
  }

  land() {
    this.grounded = true
    this.velocity.y = 0
  }

  update(delta: number) {
    if (!this.alive) {
      return
    }

    this.velocity.x +=
      this.acceleration.x *
      delta

    this.velocity.y +=
      this.acceleration.y *
      delta

    this.position.x +=
      this.velocity.x *
      delta

    this.position.y +=
      this.velocity.y *
      delta

    this.velocity.x *= 0.92
    this.velocity.y *= 0.92

    if (this.grounded) {
      this.velocity.y = 0
    }

    this.recoverEnergy(
      8 * delta
    )
  }

  // normal physical attacks
  punch(
    target: Target,
    power = 1
  ): AttackResult {
    if (!this.hasPower(
      "superhumanPhysicality"
    )) {
      return this.miss(
        "punch",
        "physical strength is disabled"
      )
    }

    power = clamp(
      power,
      0.5,
      5
    )

    return this.attack(
      target,
      "punch",
      70 *
        power *
        this.strength /
        100,
      0,
      28 * power,
      0
    )
  }

  kick(
    target: Target,
    power = 1
  ): AttackResult {
    if (!this.hasPower(
      "superhumanPhysicality"
    )) {
      return this.miss(
        "kick",
        "physical strength is disabled"
      )
    }

    power = clamp(
      power,
      0.5,
      5
    )

    return this.attack(
      target,
      "kick",
      60 *
        power *
        this.strength /
        100,
      0,
      35 * power,
      0
    )
  }

  takeDamage(
    amount: number,
    type = "physical"
  ) {
    if (!this.alive) {
      return
    }

    if (
      type === "laser" &&
      this.hasPower(
        "laserImmunity"
      )
    ) {
      amount *= 0.1
    }

    if (
      this.form === "wristbands"
    ) {
      amount *= 0.7
    } else if (
      this.form === "fused-virus"
    ) {
      amount *= 0.55
    }

    this.health -= Math.max(
      1,
      Math.round(amount)
    )

    if (this.health <= 0) {
      this.health = 0
      this.alive = false
      this.liquefied = false
    }
  }

  // active virabots can rebuild his body
  reconstruct() {
    if (!this.hasPower(
      "selfReconstruction"
    )) {
      return false
    }

    const hasBots =
      [...this.virabots.values()]
        .some(bot => bot.active)

    if (!hasBots) {
      return false
    }

    this.alive = true
    this.health = this.maxHealth
    this.energy = this.maxEnergy
    this.form = "fused-virus"
    this.virusHybrid = true
    this.liquefied = false

    this.applyStats(
      "fused-virus"
    )

    return true
  }

  powerLevel() {
    let total = 0

    for (
      const power of
      Object.values(
        tdlCode.powers
      )
    ) {
      if (
        power.enabled &&
        formLevel[this.form] >=
          formLevel[power.form]
      ) {
        total += power.level
      }
    }

    return total
  }

  status() {
    return {
      id: this.id,
      name: this.name,
      form: this.form,
      alive: this.alive,
      health: this.health,
      energy: this.energy,
      position: {
        ...this.position
      },
      liquefied: this.liquefied,
      virusHybrid: this.virusHybrid,
      powerLevel: this.powerLevel(),
      virabots:
        [...this.virabots.values()]
          .filter(
            bot => bot.active
          ).length,
      constructs:
        [...this.constructs.values()]
          .filter(
            construct =>
              construct.active
          ).length,
      stats: {
        strength: this.strength,
        durability: this.durability,
        stamina: this.stamina,
        speed: this.speed,
        agility: this.agility,
        intellect: this.intellect
      }
    }
  }

  private addConstruct(
    type: Construct["type"],
    scale: number
  ) {
    const id =
      this.nextId(type)

    this.constructs.set(
      id,
      {
        id,
        type,
        position: {
          ...this.position
        },
        scale: clamp(
          scale,
          0.25,
          16
        ),
        active: true
      }
    )

    return id
  }

  private attack(
    target: Target,
    name: string,
    damage: number,
    radius: number,
    knockback: number,
    corrosion: number
  ): AttackResult {
    if (!target.alive) {
      return this.miss(
        name,
        "target is already defeated"
      )
    }

    if (
      target.resistances.has(name)
    ) {
      damage *= 0.2
    }

    const dealt = Math.max(
      0,
      Math.round(
        damage - target.armor
      )
    )

    target.health -= dealt

    const notes: string[] = []

    if (radius > 0) {
      notes.push(
        `radius ${Math.round(radius)}`
      )
    }

    if (corrosion > 0) {
      notes.push(
        `corrosion ${Math.round(
          corrosion
        )}`
      )

      if (
        corrosion >= 50 &&
        !target.resistances.has(
          "corrosion"
        )
      ) {
        target.armor = Math.max(
          0,
          target.armor -
            Math.round(
              corrosion / 2
            )
        )
      }
    }

    const destroyed =
      target.health <= 0

    if (destroyed) {
      target.health = 0
      target.alive = false
    }

    return {
      attack: name,
      hit: true,
      damage: dealt,
      corrosion,
      knockback,
      destroyed,
      notes
    }
  }

  private miss(
    attack: string,
    reason: string
  ): AttackResult {
    return {
      attack,
      hit: false,
      damage: 0,
      corrosion: 0,
      knockback: 0,
      destroyed: false,
      notes: [reason]
    }
  }
}

const createTarget = (
  id: string,
  name: string,
  options: Partial<
    Omit<Target, "id" | "name">
  > = {}
): Target => ({
  id,
  name,
  position:
    options.position ??
    makePosition(),
  health:
    options.health ??
    1000,
  maxHealth:
    options.maxHealth ??
    options.health ??
    1000,
  armor:
    options.armor ??
    0,
  alive:
    options.alive ??
    true,
  resistances:
    options.resistances ??
    new Set()
})

export class TDLSimulation {
  readonly tdl =
    new TDLCharacter()

  readonly targets =
    new Map<string, Target>()

  addTarget(
    target: Target
  ) {
    this.targets.set(
      target.id,
      target
    )
  }

  getTarget(
    id: string
  ) {
    return this.targets.get(id)
  }

  useBaseForm() {
    this.tdl.useBaseForm()
  }

  useWristbands() {
    this.tdl.equipWristbands()
    this.tdl.createVirusArmy()
  }

  useFusedForm() {
    this.tdl.fuseWristbands()
    this.tdl.createVirusArmy()
    this.tdl.liquefy()
  }

  attackTarget(
    id: string
  ) {
    const target =
      this.targets.get(id)

    if (!target) {
      return []
    }

    const result: AttackResult[] = []

    result.push(
      this.tdl.fireball(
        target,
        2
      )
    )

    result.push(
      this.tdl.fireBreath(
        target
      )
    )

    if (
      this.tdl.form !== "base"
    ) {
      result.push(
        this.tdl.darkEnergyBeacon(
          target
        )
      )

      result.push(
        this.tdl.darkOrb(
          target
        )
      )

      result.push(
        this.tdl.laserVision(
          target
        )
      )

      result.push(
        this.tdl.bladeSlash(
          target,
          1.5
        )
      )

      result.push(
        this.tdl.spikeAttack(
          target,
          2
        )
      )
    }

    return result
  }
}

export const createTDL = () =>
  new TDLCharacter()

export const example = () => {
  const simulation =
    new TDLSimulation()

  const tco =
    createTarget(
      "tco",
      "The Chosen One",
      {
        health: 1400,
        armor: 20,
        resistances:
          new Set([
            "corrosion"
          ])
      }
    )

  simulation.addTarget(tco)

  simulation.useFusedForm()

  simulation.tdl
    .commandViraBots(tco)

  return {
    tdl:
      simulation.tdl.status(),

    target:
      tco,

    result:
      simulation.attackTarget(
        tco.id
      )
  }
}