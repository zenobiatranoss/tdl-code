# tdl simulator

a typescript-based character simulation built around the dark lord's internal state and abilities.

the project treats tdl as a programmable character with separate forms, stats, power states, energy usage, movement, combat actions, virabots, and construct-based abilities.

power definitions are kept in `tdlCode`, which acts as the main data source for the simulation. each ability has its own state and values, so changing how a power behaves does not require rewriting the combat logic.

the simulation can switch between tdl's forms, process attacks against targets, track health and energy, handle power requirements, and simulate effects such as corrosion, resistance, reconstruction, and the fused virus state.

the main idea is to experiment with tdl as if his abilities were part of a modifiable character system rather than hardcoded behavior.
