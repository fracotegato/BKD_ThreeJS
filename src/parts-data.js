// Part descriptions. Facts tagged "SSP 316" are from VW Self-study programme 316
// "The 2.0 ltr. TDI engine – design and function". Values with ≈ are modelling estimates.

import { DRIVETRAIN } from './parts-data-drivetrain.js';
import { ENGINE_DETAIL, ENGINE_LINKS, ENGINE_NOTES, COOLING, LINES, INJECTOR, BAY } from './parts-data-engine.js';

export const SYSTEMS = {
  mech: { name: 'Engine mechanics', color: '#aab4c3' },
  valve: { name: 'Valve gear & belt drive', color: '#5aa9ff' },
  fuel: { name: 'Unit injector system', color: '#ffb224' },
  air: { name: 'Charge air', color: '#3fd68f' },
  turbo: { name: 'Turbocharger GT1749VA', color: '#ff9d4d' },
  gearbox: { name: 'Gearbox 02Q', color: '#8fb6ff' },
  clutch: { name: 'Clutch & clutch control', color: '#e8c36a' },
  exh: { name: 'Exhaust & EGR', color: '#ff6f52' },
  cool: { name: 'Cooling', color: '#3fd0ee' },
  oil: { name: 'Lubrication', color: '#c69cff' },
  elec: { name: 'Electrics & sensors', color: '#ff7ab8' },
  aux: { name: 'Ancillary drive', color: '#d9d2a6' },
};

export const ENGINE = {
  title: '2.0 TDI',
  code: 'BKD',
  intro: 'First four-cylinder diesel in the Volkswagen Group with four-valve technology. It grew out of the 1.9 l / 96 kW TDI by enlarging the bore, and pairs a cross-flow aluminium head with vertical, centrally mounted unit injectors.',
  data: [
    ['Engine code', 'BKD'],
    ['Type', '4-cylinder in-line, transverse'],
    ['Displacement', '1968 cm³'],
    ['Bore × stroke', '81 × 95.5 mm'],
    ['Valves per cylinder', '4'],
    ['Compression ratio', '18 : 1'],
    ['Max. output', '103 kW at 4000 rpm'],
    ['Max. torque', '320 Nm at 1750–2500 rpm'],
    ['Engine management', 'EDC 16, unit injector system'],
    ['Fuel', 'Diesel, min. 49 CN'],
    ['Exhaust treatment', 'EGR + oxidising catalytic converter'],
    ['Emissions standard', 'EU4'],
    ['Firing order', '1 – 3 – 4 – 2'],
  ],
};

export const PARTS = {
  // ───────────── Engine mechanics ─────────────
  block: {
    name: 'Cylinder block', sys: 'mech', label: 'inner',
    desc: 'Grey cast iron block, painted black, carrying four 81 mm bores at 88 mm spacing and five main bearings. The larger bore is what lifts displacement from the 1.9 l engine to 1968 cm³; stroke stays at 95.5 mm.',
    specs: [['Bore', '81 mm (SSP 316)'], ['Cylinder spacing', '88 mm'], ['Deck height', '≈ 236 mm above crank axis'], ['Main bearings', '5 × Ø 54 mm'], ['Material', 'Grey cast iron']],
    links: [['crankshaft', 'carries'], ['head', 'bolted to deck'], ['sump', 'closes the crankcase'], ['coolantPump', 'pump sits in the belt-end face'], ['oilFilter', 'bolted to the front face']],
  },
  crankshaft: {
    name: 'Crankshaft', sys: 'mech', label: 'inner',
    desc: 'Forged steel shaft with five main journals and four crank pins. Pins 1 and 4 are opposed to pins 2 and 3, giving the firing order 1-3-4-2. The belt end drives the toothed belt, oil pump chain and poly-V belt; the other end carries the sender wheel and flywheel.',
    specs: [['Stroke', '95.5 mm (SSP 316)'], ['Crank radius', '47.75 mm'], ['Main journals', 'Ø 54 mm'], ['Crank pins', 'Ø 47.8 mm'], ['Firing order', '1-3-4-2']],
    links: [['conrods', 'crank pins'], ['timingBelt', 'drives via toothed belt sprocket'], ['oilPump', 'drives via chain'], ['flywheel', 'bolted to rear flange'], ['sealingFlange', 'carries sender wheel'], ['crankPulley', 'drives ancillaries']],
  },
  pistons: {
    name: 'Pistons', sys: 'mech', label: 'inner',
    desc: 'Aluminium pistons with a central combustion recess that swirls the intake air for good mixture formation. Small valve pockets and a top land of only 9 mm shrink the dead area above the crown, cutting emissions. An undulating oil cooling channel runs behind the ring belt, and the piston pin axis is offset to stop the piston rocking at top dead centre.',
    specs: [['Diameter', '≈ 81 mm'], ['Piston crown depth', '9 mm (SSP 316)'], ['Pin', 'Ø 26 mm, offset axis'], ['Rings', '2 compression + 1 oil'], ['Cooling', 'Undulating oil channel']],
    links: [['conrods', 'piston pin'], ['block', 'run in the bores'], ['injectors', 'spray into the recess'], ['glowPlugs', 'heat the recess']],
  },
  conrods: {
    name: 'Connecting rods', sys: 'mech', label: 'inner',
    desc: 'Forged steel rods linking each piston pin to its crank pin. With a 144 mm centre distance and a 47.75 mm crank radius the rod swings ±19.4° either side of the cylinder axis.',
    specs: [['Centre distance', '144 mm'], ['Small end', 'Ø 26 mm'], ['Big end bore', '≈ 50.6 mm'], ['Max. rod angle', '±19.4°']],
    links: [['pistons', 'small end'], ['crankshaft', 'big end']],
  },
  headGasket: {
    name: 'Cylinder head gasket', sys: 'mech',
    desc: 'Multi-layer steel gasket sealing combustion pressure, coolant and oil passages between block and head.',
    specs: [['Type', 'Multi-layer steel'], ['Thickness', '≈ 1.5 mm (graded by piston projection)']],
    links: [['block', 'below'], ['head', 'above']],
  },
  head: {
    name: 'Cylinder head', sys: 'mech', label: 'always',
    desc: 'Cross-flow aluminium head with two inlet and two exhaust valves per cylinder, all installed vertically. The valve pattern is rotated 45° to the engine axis for the best flow through the ports. Inlet ports are on one side, exhaust ports on the other, and the unit injectors stand in the middle.',
    specs: [['Material', 'Aluminium (SSP 316)'], ['Layout', 'Cross-flow, 16 valves'], ['Valve pattern', 'Rotated 45°'], ['Camshafts', '2 overhead, belt driven']],
    links: [['valves', 'holds 16'], ['injectors', 'tapered seats'], ['bearingFrame', 'bolt-in-bolt on the head bolts'], ['intakeManifold', 'inlet side'], ['exhaustManifold', 'exhaust side'], ['coolantFlange', 'gearbox end']],
  },
  flywheel: {
    name: 'Dual-mass flywheel', sys: 'mech', label: 'always',
    desc: 'Two masses coupled by arc springs smooth the diesel torque pulses before they reach the gearbox. The starter ring gear is on the primary mass; the clutch runs on the secondary mass.',
    specs: [['Outer diameter', '≈ 288 mm'], ['Friction surface', 'Ø 240 mm'], ['Ring gear', '≈ 135 teeth']],
    links: [['crankshaft', 'bolted to flange'], ['sealingFlange', 'sits behind it']],
  },
  sealingFlange: {
    name: 'Sealing flange with sender wheel', short: 'Sealing flange', sys: 'mech', label: 'inner',
    desc: 'The crankshaft sealing flange on the flywheel side is combined with the engine speed sender wheel. The seal is PTFE. The wheel is a steel ring coated in a rubber compound full of metal particles magnetised alternately north and south; two wider north poles act as reference marks, making it a 60-2-2 wheel.',
    specs: [['Seal', 'PTFE (SSP 316)'], ['Sender wheel', '60-2-2 poles (SSP 316)'], ['Service tool', 'T10134 assembly device']],
    links: [['g28', 'read by'], ['crankshaft', 'pressed onto flange'], ['flywheel', 'in front of']],
  },
  crankPulley: {
    name: 'Vibration damper / belt pulley', short: 'Vibration damper', sys: 'aux', label: 'always',
    desc: 'Rubber-damped pulley on the crankshaft nose. It calms torsional vibration and drives the alternator and A/C compressor through the poly-V belt.',
    specs: [['Diameter', '≈ 142 mm over the ribs (140–143 mm in parts listings)'], ['Width', '41–42 mm (parts listings)'], ['Belt', 'Poly-V, 6 ribs']],
    links: [['crankshaft', 'bolted to sprocket'], ['auxBelt', 'drives']],
  },

  // ───────────── Valve gear & belt drive ─────────────
  valves: {
    name: 'Inlet and exhaust valves', short: 'Valves', sys: 'valve', label: 'inner',
    desc: 'Sixteen vertical valves. Shape, size and layout were chosen for volumetric efficiency and mixture flow. An extra chamfer narrows the valve seat for higher sealing pressure and good swirl, which is why seat rings must only be ground in, never reworked.',
    specs: [['Inlet head', 'Ø 28.1 mm'], ['Exhaust head', 'Ø 26.0 mm'], ['Stem', 'Ø 6 mm'], ['Length', '≈ 99 mm'], ['Lift (model)', '≈ 9 mm']],
    links: [['rockers', 'opened by'], ['camIn', 'inlet timing'], ['camEx', 'exhaust timing'], ['head', 'seated in']],
  },
  rockers: {
    name: 'Roller rocker arms', short: 'Rocker arms', sys: 'valve', label: 'inner',
    desc: 'Each valve is opened by a roller rocker arm pivoting on a knock-out spindle. A hydraulic valve clearance compensator sits directly above the valve stem and is fed with oil from the spindle through a channel in the arm; a floating glide element spreads the load. Because of the rotated valve pattern the four arms per cylinder differ in size and shape.',
    specs: [['Quantity', '16'], ['Pivot', 'Knock-out spindles'], ['Clearance', 'Hydraulic compensation'], ['Variants', '4 different arm shapes']],
    links: [['valves', 'press on'], ['camIn', 'followed by rollers'], ['camEx', 'followed by rollers']],
  },
  bearingFrame: {
    name: 'Bearing frame', sys: 'valve', label: 'inner',
    desc: 'Compact pressure-cast aluminium frame that mounts both camshafts, the spindle and guide for the injector rocker arms, the central connector and the cable channel for unit injectors and glow plugs. Five strong lateral supports stiffen the head and improve acoustics. It is fixed “bolt in bolt”: screwed straight into the heads of the two inner rows of cylinder head bolts.',
    specs: [['Material', 'Pressure-cast aluminium (SSP 316)'], ['Lateral supports', '5'], ['Fixing', 'Bolt-in-bolt']],
    links: [['camIn', 'mounts'], ['camEx', 'mounts'], ['injRockers', 'carries spindle'], ['head', 'bolted into head bolts']],
  },
  camIn: {
    name: 'Inlet camshaft', sys: 'valve', label: 'inner',
    desc: 'Controls inlet valve timing and, at the gearbox end, drives the tandem pump. At the belt end it carries the quick-start sender wheel read by Hall sender G40.',
    specs: [['Drive', 'Toothed belt, ½ crank speed'], ['Lobes', '8 valve lobes'], ['Also drives', 'Tandem pump']],
    links: [['timingBelt', 'driven by'], ['rockers', 'operates'], ['tandemPump', 'drives'], ['g40', 'position read by']],
  },
  camEx: {
    name: 'Exhaust camshaft', sys: 'valve', label: 'inner',
    desc: 'Controls exhaust valve timing and also drives the four unit injectors through their own roller rocker arms. The steep injection lobes are what build the very high injection pressure.',
    specs: [['Drive', 'Toothed belt, ½ crank speed'], ['Lobes', '8 valve + 4 injection lobes']],
    links: [['timingBelt', 'driven by'], ['rockers', 'operates'], ['injRockers', 'drives'], ['injectors', 'pressurises']],
  },
  valveCover: {
    name: 'Cylinder head cover', sys: 'valve', label: 'always',
    desc: 'Black plastic cover sealing the valve gear. The oil filler cap sits right of centre, with the round pressure-regulating valve of the crankcase breather next to it and a hose leading to the intake side of the turbocharger.',
    specs: [['Material', 'Plastic'], ['Integrated', 'Oil filler, breather']],
    links: [['head', 'seals'], ['bearingFrame', 'covers']],
  },
  timingBelt: {
    name: 'Toothed belt drive', sys: 'valve', label: 'inner',
    desc: 'The crankshaft drives both camshafts and the coolant pump with one toothed belt. The belt is 30 mm wide, with a polyamide cord-support backing that reduces edge wear, a rubber body, glass-fibre ply cords and a polyamide facing. A damped tensioner and idler rollers guide it. The two camshaft sprockets are large and sit almost touching; roller positions in this model are schematic.',
    specs: [['Width', '30 mm (SSP 316, belt maker’s catalogue)'], ['Teeth', '141'], ['Pitch', '9.525 mm → 1343 mm long'], ['Ratio crank : cam', '1 : 2 (26 / 52 teeth, modelled)']],
    links: [['crankshaft', 'driven by'], ['camIn', 'drives'], ['camEx', 'drives'], ['coolantPump', 'drives'], ['beltGuard', 'enclosed by']],
  },
  beltGuard: {
    name: 'Toothed belt guard', sys: 'valve', label: 'always',
    desc: 'Black plastic guard around the belt drive, with two round bulges over the camshaft sprockets. To insulate against noise it is lined inside with a woven layer of soft polyamide fibres.',
    specs: [['Material', 'Plastic + polyamide fibre lining (SSP 316)']],
    links: [['timingBelt', 'encloses']],
  },

  // ───────────── Unit injector system ─────────────
  injectors: {
    name: 'Unit injectors', sys: 'fuel', code: 'N240 – N243', label: 'inner',
    desc: 'Pump and injector in one unit per cylinder, standing vertically right above the centre of the piston recess. Each is held by two bolts, which keeps side loads and structure-borne noise out of the head, and centres itself in a tapered seat. A retraction plunger controls the pilot injection, and a hydraulic retraction plunger brake cushions it to cut injection noise. The six-hole nozzle has one hole forming an “ignition spray” aimed near the glow plug.',
    specs: [['Quantity', '4, solenoid valves N240–N243'], ['Nozzle', '6-hole (SSP 316)'], ['Fixing', '2 bolts, tapered seat'], ['Service tool', 'T10163 puller']],
    links: [['injRockers', 'plunger driven by'], ['camEx', 'pressure from'], ['tandemPump', 'fuel supply / return'], ['pistons', 'inject into recess'], ['glowPlugs', 'ignition spray towards']],
  },
  injRockers: {
    name: 'Injector roller rocker arms', short: 'Injector rockers', sys: 'fuel', label: 'inner',
    desc: 'Four roller rocker arms on a spindle carried by the bearing frame. The exhaust camshaft’s injection lobes lift the roller end; the other end pushes the pump plunger of the unit injector down.',
    specs: [['Quantity', '4'], ['Driven by', 'Exhaust camshaft']],
    links: [['camEx', 'lifted by'], ['injectors', 'press on'], ['bearingFrame', 'spindle mounted in']],
  },
  tandemPump: {
    name: 'Tandem pump', sys: 'fuel', label: 'always',
    desc: 'A vacuum pump and a fuel pump in one housing, driven by the inlet camshaft. The vacuum side uses an offset rotor with a plastic vane and supplies the brake servo and the vacuum units. The fuel side is an internal gear pump: it feeds the unit injectors at up to 11.5 bar at 4000 rpm, while a valve holds the return at about 1 bar so every injector solenoid sees the same pressure.',
    specs: [['Fuel pressure', 'max. 11.5 bar at 4000 rpm (SSP 316)'], ['Return pressure', '≈ 1 bar (SSP 316)'], ['Vacuum pump', 'Rotor + plastic vane'], ['Drive', 'Inlet camshaft']],
    links: [['camIn', 'driven by'], ['injectors', 'supplies fuel'], ['vacReservoir', 'vacuum stored in'], ['valveBlock', 'vacuum source for']],
  },

  // ───────────── Charge air & turbo ─────────────
  turbo: {
    name: 'Turbocharger GT1749VA – bearing housing', short: 'Turbocharger', sys: 'turbo', code: 'Garrett 724930', label: 'always',
    desc: 'Garrett GT1749VA with variable nozzle turbine: exhaust gas spins the turbine wheel, and the compressor wheel on the same shaft forces intake air towards the charge air cooler. This grey cast-iron bearing housing is the core everything else bolts to. Its bore carries the two floating journal bearings; the turbine housing is clamped to its hot flange, the seal plate and compressor housing to its cold flange. Engine oil enters through the union on top, lubricates and cools the bearings, and drains by gravity through the flange underneath. Press T (or the Turbo button) to pull the turbocharger apart along its shaft.',
    specs: [['Type', 'Garrett GT1749VA, variable nozzle turbine (VNT)'], ['Garrett number', '724930 (BKD, AZV)'], ['VW number', '03G 253 010 J / 03G 253 014 H, with exhaust manifold (ETKA 145-055)'], ['Shaft bearings', '2 floating journal bearings + 1 thrust bearing'], ['Lubrication', 'Engine oil: union on top, drain flange below'], ['Charge pressure control', 'Vacuum unit via N75, feedback from G31']],
    links: [['turbineHousing', 'hot flange clamped to'], ['sealPlate', 'cold flange carries'], ['journalBearingT', 'bore holds'], ['thrustBearing', 'pocket holds'], ['turbineWheel', 'shaft runs through'], ['turboOilFeed', 'oil in and out through'], ['vntActuator', 'crank passes through'], ['turboHeatShield', 'shielded from the turbine by'], ['compressorHousing', 'carries, via the seal plate'], ['exhaustManifold', 'driven by gas from'], ['catalyst', 'exhausts into'], ['chargePipe', 'compressed air ends in'], ['valveBlock', 'vanes set by N75 in'], ['oilFilter', 'oil feed from'], ['g31', 'pressure measured by']],
  },
  intakeManifold: {
    name: 'Intake manifold', sys: 'air', label: 'always',
    desc: 'Sand-cast aluminium manifold on the front of the head. Eight short runners – two per cylinder – fan out from a single central outlet underneath, where the EGR valve and intake manifold flap unit bolts on with three screws.',
    specs: [['Ports', '8 (2 per cylinder)'], ['Material', 'Cast aluminium'], ['Inlet', 'Central, facing down, 3-bolt flange']],
    links: [['head', 'bolted to inlet side'], ['intakeFlap', 'fed through'], ['egrValve', 'receives exhaust gas from']],
  },
  intakeFlap: {
    name: 'Anti-shudder valve (intake manifold flap)', short: 'Anti-shudder valve', sys: 'air', code: 'V157', label: 'always',
    desc: 'Electric throttle body, the first thing the charge air meets on the engine: an aluminium ring with a brass flap on a spindle, and a black plastic housing on its side for the positioning motor and gears with a five-pin connector. When the engine is switched off the flap closes and cuts off the air, so the high-compression engine stops smoothly instead of shuddering; while running it can also throttle the intake slightly to raise the EGR rate. It is bolted to the EGR valve with three bolts and an O-ring, and the charge air hose plugs onto its mouth with a retaining clip.',
    specs: [['ETKA', '131-080, throttle valve control element'], ['Actuation', 'Electric positioning motor V157'], ['To the EGR valve', 'O-ring 55 × 2.5, 3 bolts M6 × 20'], ['Hose joint', 'Plug-in coupling, retaining clip SCA52'], ['At switch-off', 'Flap closes']],
    links: [['egrValve', 'bolted to'], ['chargePipe', 'air from'], ['intakeManifold', 'air into, through the EGR valve'], ['g31', 'pressure measured upstream by']],
  },
  chargePipe: {
    name: 'Charge air pipe', sys: 'air',
    desc: 'Brings cooled, compressed air from the belt-side tank of the charge air cooler to the intake manifold flap: a hose at each end and a rigid plastic pipe between them, which carries the charge pressure sender.',
    specs: [['ETKA', '145-085'], ['Diameter', '≈ 58 mm'], ['Sections', 'Hose, plastic pipe, hose']],
    links: [['intakeFlap', 'feeds'], ['g31', 'carries'], ['turbo', 'air from']],
  },

  // ───────────── Exhaust & EGR ─────────────
  exhaustManifold: {
    name: 'Exhaust manifold', sys: 'exh', label: 'always',
    desc: 'Cast manifold collecting gas from the four exhaust ports and leading it to the turbine. Recirculated exhaust gas is tapped off here.',
    specs: [['Material', 'Cast iron']],
    links: [['head', 'bolted to exhaust side'], ['turbo', 'feeds turbine'], ['egrCooler', 'EGR tapped off to']],
  },
  catalyst: {
    name: 'Oxidising catalytic converter', short: 'Catalytic converter', sys: 'exh', label: 'always',
    desc: 'Mounted close to the turbocharger so it heats up quickly. It oxidises hydrocarbons and carbon monoxide; together with exhaust gas recirculation it brings the engine to EU4.',
    specs: [['Type', 'Oxidising'], ['Standard', 'EU4 (SSP 316)']],
    links: [['turbo', 'gas from'], ['egrCooler', 'warm-up helped by bypass']],
  },
  egrCooler: {
    name: 'Switchable EGR cooler', short: 'EGR cooler', sys: 'exh', label: 'always',
    desc: 'Coolant-cooled heat exchanger for recirculated exhaust gas, mounted high on the rear of the head beside the head cover. A flexible bellows pipe feeds it from the exhaust manifold. Cooler gas lowers combustion temperature, so more can be recirculated and fewer nitrogen oxides form. Below 50 °C coolant temperature a vacuum-operated flap sends the gas past the cooler so engine and catalytic converter warm up fast; from 50 °C changeover valve N345 closes the flap and the gas flows through the cooler.',
    specs: [['Switch point', '50 °C coolant (SSP 316)'], ['Flap control', 'Vacuum unit via N345'], ['Coolant', '2 connections']],
    links: [['exhaustManifold', 'gas from'], ['egrPipe', 'gas to'], ['valveBlock', 'flap switched by N345 in'], ['g62', 'switched by temperature from']],
  },
  egrPipe: {
    name: 'EGR pipe', sys: 'exh',
    desc: 'Carries the recirculated exhaust gas from the cooler down and round the gearbox end of the head, below the tandem pump and coolant flange, then along the front to the EGR valve.',
    specs: [['Diameter', '≈ 26 mm']],
    links: [['egrCooler', 'from'], ['egrValve', 'to']],
  },
  egrValve: {
    name: 'EGR valve', sys: 'exh', code: 'vacuum operated', label: 'always',
    desc: 'A short aluminium tube that all the intake air passes through, bolted between the anti-shudder valve and the intake manifold by a triangular three-bolt flange. A polished vacuum capsule stands out of its side: when solenoid valve N18 applies vacuum, the diaphragm pulls a poppet valve across the bore off its seat on the opposite side, and exhaust gas from the EGR cooler flows into the intake air. With no vacuum a spring holds it shut. It is easy to tell from the anti-shudder valve next to it: bare metal with a shiny round capsule, no electrical connector.',
    specs: [['Part', '038 131 501 AN (BKC / BKD, from a parts listing)'], ['Actuation', 'Vacuum capsule, controlled by N18'], ['To the manifold', 'O-ring 62 × 3'], ['Exhaust gas port', 'Two-bolt flange, seal 32 mm (ETKA 131-080)'], ['Regulated with', 'Air mass meter G70']],
    links: [['intakeManifold', 'bolted under'], ['intakeFlap', 'bolted to'], ['egrPipe', 'exhaust gas from'], ['valveBlock', 'vacuum metered by N18 in']],
  },

  vacReservoir: {
    name: 'Vacuum reservoir', sys: 'exh', label: 'always',
    desc: 'Black plastic sphere at the belt end, above the alternator. It stores vacuum from the tandem pump so the vacuum units for the EGR valve, the EGR cooler flap and the turbocharger guide vanes respond at once. The parts catalogue lists it with its bracket (ETKA 131-080, items 29 and 30); it is not described in the self-study programme.',
    specs: [['Diameter', '≈ 105 mm'], ['Fed by', 'Vacuum pump in the tandem pump']],
    links: [['tandemPump', 'vacuum from'], ['valveBlock', 'supplies']],
  },
  valveBlock: {
    name: 'Solenoid valve block', short: 'Solenoid valves', sys: 'elec', code: 'N18 · N345 · N75', label: 'always',
    desc: 'Three solenoid valves on one bracket at the gearbox end of the intake side. The engine control unit pulses them to meter vacuum: N18 for the EGR valve, N345 for the EGR cooler changeover flap and N75 for charge pressure control at the turbocharger.',
    specs: [['N18', 'Exhaust gas recirculation valve'], ['N345', 'EGR cooler changeover valve'], ['N75', 'Charge pressure control solenoid valve'], ['Controlled by', 'Engine control unit J248']],
    links: [['egrValve', 'N18 opens'], ['egrCooler', 'N345 switches flap of'], ['turbo', 'N75 sets vanes of'], ['vacReservoir', 'vacuum from']],
  },

  // ───────────── Cooling ─────────────
  coolantPump: {
    name: 'Coolant pump', sys: 'cool', label: 'inner',
    desc: 'Set into the belt end of the block and driven by the toothed belt along with the camshafts.',
    specs: [['Drive', 'Toothed belt (SSP 316)'], ['Sprocket', '19 teeth (parts listing)'], ['Housing', 'Size estimated (≈)']],
    links: [['timingBelt', 'driven by'], ['block', 'circulates coolant through'], ['thermostat', 'flow regulated by']],
  },
  coolantFlange: {
    name: 'Coolant outlet flange', short: 'Coolant flange', sys: 'cool',
    desc: 'Plastic flange at the gearbox end of the head where hot coolant leaves for the radiator and heater. It carries coolant temperature sender G62.',
    specs: [['Material', 'Plastic'], ['Carries', 'G62']],
    links: [['head', 'bolted to'], ['g62', 'carries']],
  },
  thermostat: {
    name: 'Thermostat housing', sys: 'cool',
    desc: 'Holds the coolant thermostat that keeps the engine at operating temperature by opening the radiator circuit. Its position in this model is approximate.',
    specs: [['Position', 'Front of block (≈)']],
    links: [['block', 'bolted to'], ['coolantPump', 'feeds']],
  },

  // ───────────── Lubrication ─────────────
  sump: {
    name: 'Oil sump', sys: 'oil', label: 'always',
    desc: 'Ribbed cast-aluminium sump that closes the crankcase and stores the engine oil. It holds the drain plug and the oil level / temperature sender, and its rear face bolts to the gearbox.',
    specs: [['Material', 'Cast aluminium'], ['Outside size', '430 × 277 × 120 mm (parts listings for 038 103 603 AG)'], ['As drawn', 'Body ≈ 248 mm wide; the 277 mm is taken across the two gearbox lugs'], ['Sender', 'Opening for the oil level / temperature sender']],
    links: [['block', 'bolted to'], ['oilPump', 'houses']],
  },
  oilPump: {
    name: 'Oil pump', sys: 'oil', label: 'inner',
    desc: 'Chain-driven from the crankshaft. Draws oil through the strainer in the sump and delivers it to the filter module, bearings, piston cooling jets and the head – including the spindles that feed the hydraulic clearance compensators.',
    specs: [['Drive', 'Chain from crankshaft'], ['Pickup', 'Strainer in sump']],
    links: [['crankshaft', 'driven by'], ['sump', 'draws from'], ['oilFilter', 'delivers to']],
  },
  oilFilter: {
    name: 'Oil filter module', sys: 'oil', label: 'always',
    desc: 'Aluminium housing bolted to the front of the block towards the gearbox end. The canister stands upright with a black screw cap on top, reached from above next to the EGR pipe; the paper element sits inside. A stacked-plate oil cooler, through which engine coolant flows, hangs underneath. The turbocharger oil feed pipe starts here.',
    specs: [['Position', 'Front of block, gearbox-end half'], ['Element', 'Paper cartridge Ø 71 × 141 mm under the screw cap (filter maker’s catalogue)'], ['Canister', '≈ Ø 88 × 160 mm with cap, drawn round the element'], ['Cooler', 'Oil / coolant plate type, below the canister (size ≈)']],
    links: [['block', 'bolted to'], ['oilPump', 'oil from'], ['turbo', 'oil feed pipe to']],
  },
  dipstick: {
    name: 'Oil dipstick', sys: 'oil',
    desc: 'Guide tube and dipstick for checking the oil level in the sump.',
    specs: [],
    links: [['sump', 'reaches into']],
  },

  // ───────────── Sensors & preglow ─────────────
  glowPlugs: {
    name: 'Glow plugs', sys: 'elec', code: 'Q10 – Q13', label: 'always',
    desc: 'Quick-start glow plugs: slim because four valves leave little room, with a winding combination about a third shorter than usual. They reach 1000 °C in 2 seconds and start safely down to −24 °C. Glow plug control unit J370 switches them with a PWM signal on command from the engine control unit, and monitors each plug. Nominal voltage is 4.4 V – never test them with 12 V.',
    specs: [['Nominal voltage', '4.4 V (SSP 316)'], ['Size', 'M8 × 1 thread, 8 mm hexagon, 118 mm long (parts listing); drawn ≈ 140 mm so the terminal clears the modelled head'], ['Heat-up', '1000 °C in 2 s (SSP 316)'], ['Preglow', 'Below 14 °C, ≈ 11 V for max. 2 s'], ['Extended glow', 'Up to 3 min, below 20 °C coolant'], ['Control', 'J370, PWM']],
    links: [['head', 'screwed into'], ['injectors', 'next to ignition spray of'], ['g62', 'glow time from']],
  },
  g28: {
    name: 'Engine speed sender', short: 'Speed sender', sys: 'elec', code: 'G28', label: 'always',
    desc: 'Hall sender bolted to the crankshaft sealing flange housing, on the front side just above crank height. From the 60-2-2 sender wheel the control unit gets engine speed and exact crank position, which set injection quantity and start of injection. If it fails, this engine keeps running in an emergency mode on the camshaft signal, limited to 3200–3500 rpm.',
    specs: [['Type', 'Hall sender (SSP 316)'], ['Reads', '60-2-2 wheel'], ['On failure', 'Emergency running, 3200–3500 rpm']],
    links: [['sealingFlange', 'reads wheel in'], ['g40', 'backed up by']],
  },
  g40: {
    name: 'Hall sender (camshaft)', short: 'Hall sender', sys: 'elec', code: 'G40', label: 'inner',
    desc: 'Fixed to the head below the inlet camshaft, reading a quick-start sender wheel. Four segments of 6°, 12°, 18° and 24° identify the cylinders at start; a further 45° segment lets the engine run in emergency mode if the speed sender fails. Without G40 the engine still starts on G28, just a little slower.',
    specs: [['Segments', '6°, 12°, 18°, 24° + 45° (SSP 316)'], ['Use', 'Cylinder recognition, emergency running']],
    links: [['camIn', 'reads wheel on'], ['g28', 'works with']],
  },
  g62: {
    name: 'Coolant temperature sender', short: 'Coolant temp.', sys: 'elec', code: 'G62', label: 'always',
    desc: 'Reports coolant temperature at the head outlet. The control unit uses it for exhaust gas recirculation, the EGR cooler changeover at 50 °C and glow period control.',
    specs: [['Used for', 'EGR, cooler changeover, preglow']],
    links: [['coolantFlange', 'mounted in'], ['egrCooler', 'triggers changeover'], ['glowPlugs', 'sets glow period']],
  },
  g31: {
    name: 'Charge pressure / intake air temperature sender', short: 'Charge pressure', sys: 'elec', code: 'G31 / G42', label: 'always',
    desc: 'Combined sender in the charge air path. G31 feeds charge pressure control; G42 measures intake air temperature, one of the inputs for the EGR map.',
    specs: [['G31', 'Charge air pressure'], ['G42', 'Intake air temperature']],
    links: [['chargePipe', 'mounted on'], ['turbo', 'closes control loop for']],
  },

  // ───────────── Ancillary drive ─────────────
  auxBelt: {
    name: 'Poly-V belt and tensioner', sys: 'aux',
    desc: 'One ribbed belt from the crankshaft pulley drives the alternator and A/C compressor; a sprung tensioner keeps it tight. Both units hang on a cast bracket on the front of the block at the belt end.',
    specs: [['Belt', 'Poly-V 6PK1050: 6 ribs, 21.4 mm wide, 1050 mm long (belt maker’s catalogue)'], ['Path as modelled', '≈ 1054 mm with the listed pulley diameters']],
    links: [['crankPulley', 'driven by'], ['alternator', 'drives'], ['acCompressor', 'drives']],
  },
  alternator: {
    name: 'Alternator', sys: 'aux', label: 'always',
    desc: 'Three-phase alternator charging the battery and supplying the vehicle electrical system. It sits high on the front of the engine at the belt end, directly below the vacuum reservoir.',
    specs: [['Output', '14 V, 140 A (parts listings for 06F 903 023 F)'], ['Length', '≈ 178 mm (177–178 mm in two listings, 201 mm in a third)'], ['Pulley', 'Freewheel pulley Ø 56 × 41 mm, 6 ribs (parts listings)'], ['Body', '≈ Ø 140 mm']],
    links: [['auxBelt', 'driven by']],
  },
  acCompressor: {
    name: 'A/C compressor', sys: 'aux', label: 'always',
    desc: 'Refrigerant compressor for the air conditioning, bolted low on the front of the block under the alternator, level with the crankshaft.',
    specs: [['Pulley', 'Ø 110 mm, 6 ribs (parts listings for 1K0 820 803 / 859)'], ['Length', '216 mm overall (parts listing); drawn ≈ 218 mm'], ['Body', '≈ Ø 112 mm']],
    links: [['auxBelt', 'driven by']],
  },

  // ═════════════ Parts around the engine (Golf V engine bay) ═════════════
  // Layout from the ETKA illustrations for the Golf 2004–2005 with engine BKD; sizes are estimates (≈).
  intercooler: {
    name: 'Charge air cooler (intercooler)', short: 'Charge air cooler', sys: 'air', label: 'always',
    desc: 'Air-to-air cooler in the cooling pack at the front of the car, between the A/C condenser and the radiator. Compressing the intake air in the turbocharger heats it; cooling it again makes it denser, so more oxygen reaches the cylinders. Hot air enters at the bottom of the gearbox-side tank and leaves half-way up the belt-side tank.',
    specs: [['ETKA', '145-085, part 1K0 145 803 A / S (BKD, AZV)'], ['Core', '615 × 406 × 32 mm (cooler maker’s listing for the Golf 2003–2011; a listing for later part numbers gives 625 × 398 × 32)'], ['Tanks', 'Plastic, crimped to an aluminium core'], ['Seals', 'Rubber strips top and bottom']],
    links: [['boostPipe', 'hot air from'], ['chargePipe', 'cooled air to'], ['radiator', 'sits in front of'], ['condenser', 'sits behind'], ['fans', 'air drawn through by']],
  },
  boostPipe: {
    name: 'Pressure pipe, turbocharger to cooler', short: 'Pressure pipe', sys: 'air',
    desc: 'Carries the compressed, hot air from the compressor outlet to the charge air cooler: a hose at the turbocharger, a rigid plastic pipe passing over the gearbox, and a hose into the bottom of the cooler. A pulsation damper on the rising section smooths pressure waves. The catalogue confirms the parts and both end points; the run between them is simplified here.',
    specs: [['ETKA', '145-085, pressure hose 1K0 145 834 G / L'], ['Bore', '≈ 52 mm'], ['Extras', 'Pulsation damper, 2 brackets']],
    links: [['turbo', 'compressed air from'], ['intercooler', 'delivers to'], ['gearbox', 'passes over']],
  },
  airbox: {
    name: 'Air filter housing', sys: 'air', label: 'always',
    desc: 'Plastic housing above the gearbox, behind the battery, holding the paper air filter element. Outside air arrives through a duct on the lock carrier and a snorkel that runs round the battery; filtered air leaves through the air mass meter.',
    specs: [['ETKA', '129-050 (BKD, AZV, BMM)'], ['Size', '≈ 250 × 170 × 230 mm'], ['Element', 'Paper panel filter under the lid']],
    links: [['maf', 'clean air leaves through'], ['intakePipe', 'feeds'], ['battery', 'sits behind'], ['gearbox', 'sits above']],
  },
  maf: {
    name: 'Air mass meter', sys: 'elec', code: 'G70', label: 'always',
    desc: 'Hot-film sensor in the outlet of the air filter housing. It measures the mass of air actually drawn in; the engine control unit uses it to limit the injected quantity (smoke limit) and to regulate exhaust gas recirculation.',
    specs: [['Type', 'Hot-film air mass meter'], ['Bore', '≈ 70 mm'], ['Used for', 'EGR control, smoke limitation']],
    links: [['airbox', 'mounted on'], ['intakePipe', 'air flows on to'], ['egrValve', 'EGR rate regulated with'], ['loom', 'wired through']],
  },
  intakePipe: {
    name: 'Intake pipe to the turbocharger', short: 'Intake pipe', sys: 'air',
    desc: 'A corrugated rubber bellows takes up engine movement; a rigid plastic pipe then crosses behind the cylinder head cover, above the EGR cooler, and curves down into the compressor inlet at the belt end. The crankcase breather gases join here.',
    specs: [['ETKA', '129-050'], ['Bore', '≈ 60 mm'], ['Sections', 'Bellows + rigid pipe']],
    links: [['maf', 'air from'], ['turbo', 'feeds the compressor of'], ['valveCover', 'breather gases from'], ['egrCooler', 'passes above']],
  },
  radiator: {
    name: 'Radiator', sys: 'cool', label: 'always',
    desc: 'Cross-flow aluminium radiator with plastic end tanks, last in the cooling pack before the fans. Coolant from the cylinder head enters at the top of the gearbox-side tank and returns from the bottom of the same tank to the thermostat, which only opens this circuit once the engine is warm.',
    specs: [['ETKA', '121-045 (BKD, AZV)'], ['Core', '650 × 432 × 32 mm (two radiator listings for the BKD part numbers)'], ['Connections', 'Both on the gearbox-side tank'], ['Mounting', 'Rubber bushes in the lock carrier']],
    links: [['hoseTop', 'hot coolant from'], ['hoseBottom', 'cooled coolant to'], ['fans', 'air drawn through by'], ['intercooler', 'sits behind'], ['expansionTank', 'vents to']],
  },
  fans: {
    name: 'Radiator fans with shroud', short: 'Radiator fans', sys: 'cool', code: 'V7 · V35', label: 'always',
    desc: 'Two electric fans in a plastic shroud bolted to the back of the radiator. They pull air through the condenser, charge air cooler and radiator when the car is slow or the air conditioning needs it. The fan control unit on the shroud switches them in stages.',
    specs: [['ETKA', '121-090 twin fan ring'], ['Fan diameters', '360 mm (300 W) and 295 mm (parts listings)'], ['Shroud', '≈ 712 × 444 mm, outline estimated'], ['Control', 'Fan control unit J293 on the shroud']],
    links: [['radiator', 'bolted to'], ['intercooler', 'draws air through'], ['condenser', 'draws air through'], ['hoseBottom', 'switched using G83 in'], ['loom', 'wired through']],
  },
  hoseTop: {
    name: 'Upper radiator hose', short: 'Upper hose', sys: 'cool',
    desc: 'Takes hot coolant from the outlet flange on the gearbox end of the cylinder head to the top of the radiator.',
    specs: [['Bore', '≈ 32 mm'], ['Ends', 'Quick-release couplings with spring clips']],
    links: [['coolantFlange', 'starts at'], ['radiator', 'ends at']],
  },
  hoseBottom: {
    name: 'Lower radiator hose', short: 'Lower hose', sys: 'cool',
    desc: 'Returns cooled coolant from the bottom of the radiator along the front of the engine to the thermostat housing. The coupling next to the radiator carries coolant temperature sender G83, which the engine control unit compares with G62 to run the fans.',
    specs: [['Bore', '≈ 32 mm'], ['Carries', 'Radiator outlet coolant temperature sender G83']],
    links: [['radiator', 'starts at'], ['thermostat', 'ends at'], ['fans', 'G83 helps switch'], ['g62', 'G83 compared with']],
  },
  heaterHoses: {
    name: 'Heater hoses', sys: 'cool',
    desc: 'Feed and return hoses between the engine and the heat exchanger behind the bulkhead. The feed leaves the coolant flange on the head; the return joins the steel pipe along the back of the block. This circuit is open even when the thermostat is closed, so the heater warms up with the engine.',
    specs: [['Bore', '≈ 18 mm'], ['Quantity', '2 (feed and return)']],
    links: [['coolantFlange', 'feed from'], ['coolantPipes', 'return into']],
  },
  coolantPipes: {
    name: 'Coolant pipes and small hoses', short: 'Coolant pipes', sys: 'cool',
    desc: 'The small coolant circuit. A steel pipe along the back of the block collects the returns from the heater, the EGR cooler and the expansion tank and leads them to the pump. A second pipe on the front links the thermostat housing with the oil cooler under the oil filter. Two hoses run coolant through the EGR cooler.',
    specs: [['ETKA', '121-045, 121-080'], ['Rear pipe', 'Steel, ≈ Ø 22 mm'], ['Front pipe', 'Steel, ≈ Ø 18 mm']],
    links: [['coolantPump', 'returns to'], ['heaterHoses', 'collects'], ['egrCooler', 'cools'], ['oilFilter', 'feeds the oil cooler under'], ['thermostat', 'front pipe from'], ['expansionTank', 'topped up from'], ['coolantFlange', 'EGR cooler return to']],
  },
  expansionTank: {
    name: 'Coolant expansion tank', short: 'Expansion tank', sys: 'cool', label: 'always',
    desc: 'Translucent sphere at the rear of the engine bay on the belt side, the highest point of the cooling system. It gives the coolant room to expand, lets air out through a thin vent hose and holds system pressure with the valve in its blue cap. A sender in the bottom warns of low coolant.',
    specs: [['Position', 'Rear of the engine bay, belt side'], ['Diameter', '≈ 170 mm'], ['Cap', 'Pressure relief valve'], ['Sender', 'Coolant shortage indicator G32']],
    links: [['coolantPipes', 'feeds the return pipe'], ['egrCooler', 'vent hose from'], ['radiator', 'vented from']],
  },
  fuelFilter: {
    name: 'Fuel filter', sys: 'fuel', label: 'always',
    desc: 'Canister on the body beside the belt end of the engine. Diesel from the tank is filtered here before the tandem pump draws it in; a preheating valve in the lid sends warm return fuel back through the filter in cold weather so the paraffin in the diesel does not clog it. Water collects at the bottom.',
    specs: [['ETKA', '127-020 (BKC, BDK, BKD, AZV, BRU)'], ['Canister', '≈ Ø 90 × 140 mm'], ['Lid', 'Preheating valve, 4 line connections'], ['Bottom', 'Water drain screw']],
    links: [['tandemPump', 'supplies / takes return from'], ['injectors', 'filtered fuel for']],
  },
  vacuumLines: {
    name: 'Vacuum lines', sys: 'exh',
    desc: 'Thin plastic pipes that distribute vacuum from the pump in the tandem pump: one thicker line to the brake servo on the bulkhead, a supply to the solenoid valve block and the reservoir, and one controlled line from each solenoid valve to its vacuum unit.',
    specs: [['Lines', 'Brake servo, reservoir, 3 controlled lines'], ['N75', 'To the turbocharger guide vane unit'], ['N18', 'To the EGR valve'], ['N345', 'To the EGR cooler flap']],
    links: [['tandemPump', 'vacuum from'], ['valveBlock', 'metered by'], ['vacReservoir', 'stored in'], ['turbo', 'moves the guide vanes of'], ['egrValve', 'opens'], ['egrCooler', 'switches the flap of']],
  },
  loom: {
    name: 'Engine wiring loom', short: 'Wiring loom', sys: 'elec', label: 'always',
    desc: 'The harness between the engine control unit and everything electrical on the engine. The trunk comes through the bulkhead, passes round the gearbox end and runs along the front edge of the cylinder head cover; branches drop to each sender and actuator. The unit injectors and glow plugs share one central connector on the head.',
    specs: [['Trunk', 'Corrugated conduit, ≈ Ø 20 mm'], ['Branches modelled', '11'], ['Control unit', 'Engine control unit, behind the bulkhead (not modelled)']],
    links: [['injectors', 'central connector for'], ['glowPlugs', 'supplies'], ['g62', 'reads'], ['g28', 'reads'], ['g40', 'reads'], ['g31', 'reads'], ['maf', 'reads'], ['valveBlock', 'drives'], ['intakeFlap', 'drives'], ['alternator', 'excites'], ['starter', 'terminal 50 to']],
  },
  battery: {
    name: 'Battery', sys: 'elec', label: 'always',
    desc: 'Twelve-volt starter battery on a tray above the gearbox, in front of the air filter housing. It supplies the starter and glow plugs before the engine runs and is recharged by the alternator.',
    specs: [['Voltage', '12 V'], ['Case modelled', '≈ 250 × 176 × 190 mm'], ['Position', 'Front left of the engine bay']],
    links: [['powerCables', 'connected by'], ['starter', 'supplies'], ['alternator', 'charged by'], ['airbox', 'sits in front of']],
  },
  starter: {
    name: 'Starter', sys: 'elec', label: 'always',
    desc: 'Electric motor flanged to the gearbox bell housing on the intake side. When the key is turned, the solenoid switch pushes the pinion into the ring gear on the flywheel and closes the main contact, and the motor cranks the engine.',
    specs: [['Position', 'Bell housing, front'], ['Rating', '12 V, 2.0 kW (parts listing for 02Z 911 023 F; two other listings say 1.7 kW)'], ['Length', '233 mm (233–234 mm in two listings)'], ['Flange', 'Ø 76 mm register'], ['Pinion', '10 teeth (parts listing)'], ['Motor and switch', '≈ Ø 76 mm and ≈ Ø 52 mm'], ['Terminals', '30 (battery), 50 (start signal)']],
    links: [['flywheel', 'pinion meshes with ring gear of'], ['gearbox', 'bolted to'], ['powerCables', 'supplied through'], ['loom', 'start signal from']],
  },
  powerCables: {
    name: 'Battery cables', sys: 'elec',
    desc: 'The heavy cables: battery positive to terminal 30 of the starter, on from there to the B+ stud of the alternator, and the earth cable from battery negative to the gearbox, which grounds the whole power unit.',
    specs: [['Positive', 'Battery → starter → alternator'], ['Earth', 'Battery → gearbox'], ['Section', '≈ 25–35 mm²']],
    links: [['battery', 'from'], ['starter', 'to terminal 30 of'], ['alternator', 'to B+ of'], ['gearbox', 'earth point on']],
  },
  gearbox: {
    name: 'Manual gearbox', sys: 'mech', label: 'always',
    desc: 'Six-speed manual gearbox bolted to the flywheel end of the block, shown as a simplified outline. The bell housing encloses the dual-mass flywheel and clutch; the final drive at the back sends power to both front wheels. The starter, the earth cable and the pressure pipe all use it as a mounting point.',
    specs: [['Type', '6-speed manual, transverse'], ['Length modelled', '≈ 450 mm'], ['Detail', 'Outline only']],
    links: [['flywheel', 'encloses'], ['block', 'bolted to'], ['starter', 'carries'], ['powerCables', 'earth point for'], ['sealingFlange', 'bolts up against']],
  },
  condenser: {
    name: 'A/C condenser', sys: 'aux', label: 'always',
    desc: 'First cooler in the pack, directly behind the bumper. Hot refrigerant gas from the compressor gives up its heat here and becomes liquid; the receiver-dryer stands at its side. The thinner pipe is the high-pressure line from the compressor, the thicker one the suction line returning from the evaporator behind the bulkhead.',
    specs: [['Core', '540 × 388 × 16 mm (two parts listings give 535–540 × 388)'], ['Overall', '≈ 580 × 400 mm over the header tubes, the size a third listing gives'], ['Refrigerant', 'R134a'], ['Lines modelled', 'High-pressure and suction line']],
    links: [['acCompressor', 'gas from'], ['intercooler', 'sits in front of'], ['fans', 'air drawn through by']],
  },
  frontPipe: {
    name: 'Front exhaust pipe', sys: 'exh',
    desc: 'Leads the cleaned exhaust gas from the catalytic converter down and back under the car. A braided flexible joint lets the engine rock on its mounts without straining the rest of the exhaust system.',
    specs: [['Bore', '≈ 55 mm'], ['Flexible joint', 'Stainless braid, ≈ 120 mm long']],
    links: [['catalyst', 'gas from']],
  },

  // ═════════════ Turbocharger GT1749VA, component by component ═════════════
  turbineHousing: {
    name: 'Turbine housing', sys: 'turbo', label: 'inner',
    desc: 'Cast in one piece with the exhaust manifold: the catalogue lists a single part, “exhaust manifold with turbocharger”. Gas from the collector enters the scroll, which wraps it round the nozzle ring so it reaches every vane at the same speed. The open side faces the bearing housing and is closed by it; four clamp plates with bolts hold the two together and let the housing be turned to any angle on assembly. The round outlet ends in a tapered flange for the V-band clamp of the catalytic converter pipe, and a steel support braces the casting against the cylinder block.',
    specs: [['Part', 'One casting with the exhaust manifold (ETKA 145-055, item 1B)'], ['To the head', '8 self-locking M8 nuts with washers, gasket 03G 253 039'], ['To the bearing housing', '≈ 4 clamp plates with bolts'], ['Outlet', 'Tapered flange for V-band clamp'], ['Support', '038 145 535 K, M8 × 35 bolt to the block'], ['Heat shield', '03G 129 969 G on two M8 studs']],
    links: [['exhaustManifold', 'one casting with'], ['turbo', 'clamped to'], ['vntVanes', 'houses'], ['turbineWheel', 'surrounds'], ['catClamp', 'outlet joined by'], ['block', 'braced against']],
  },
  catClamp: {
    name: 'V-band clamp to the catalytic converter', short: 'V-band clamp', sys: 'turbo', label: 'inner',
    desc: 'The catalytic converter is part of the front exhaust pipe and hangs directly on the turbine outlet. Both flanges are tapered; the V-shaped band wedges them together as its single bolt is tightened, squeezing a seal ring between them. One clamp, one seal and one nut are the whole joint, which is why the turbo can be separated from the exhaust without disturbing the manifold.',
    specs: [['Clamp', '1K0 253 725 (ETKA 253-065, item 2)'], ['Seal', '1K0 253 115 T (item 3)'], ['Pipe', 'Exhaust pipe with catalyst 1K0 254 502 …'], ['Fastening', 'One T-bolt with nut']],
    links: [['turbineHousing', 'clamps outlet flange of'], ['catalyst', 'to inlet flange of']],
  },
  vntVanes: {
    name: 'Guide vanes', short: 'Guide vanes', sys: 'turbo', label: 'inner',
    desc: 'The variable geometry itself. Eleven small vanes stand in a circle round the turbine wheel, each on a pivot pin that passes through the ring plate and ends in a short arm on the back. Turned nearly closed, the vanes leave narrow gaps: gas speeds up and hits the wheel at a flat angle, so boost builds at low engine speed. Turned open, they let a large gas flow through at high speed without over-speeding the turbo. Three spacer pins fix the gap to the housing wall so the vanes can move without leaking. The ring sits in the mouth of the turbine housing and is trapped there by the bearing housing.',
    specs: [['Vanes', '11 (counted on a GT1749V nozzle ring)'], ['Vane height', '≈ 7 mm'], ['Pivot circle', '≈ Ø 62 mm'], ['Spacer pins', '3'], ['Typical fault', 'Vanes stuck by soot → over- or under-boost']],
    links: [['vntUnison', 'vane arms sit in the slots of'], ['turbineHousing', 'seated in'], ['turbineWheel', 'directs gas onto'], ['turbo', 'held in place by']],
  },
  vntUnison: {
    name: 'Unison ring', sys: 'turbo', label: 'inner',
    desc: 'Flat steel ring behind the nozzle ring, also called the adjusting ring. It has one slot per vane arm, so turning the ring a few degrees swings all eleven vanes together by exactly the same angle. Three rollers on the nozzle ring keep it centred. A lug on its rim is moved by the inner arm of the actuator crank.',
    specs: [['Slots', '11, one per vane arm'], ['Travel', 'A few degrees of rotation'], ['Guided by', '3 rollers on the nozzle ring'], ['Driven by', 'Crank from the vacuum actuator']],
    links: [['vntVanes', 'turns the vanes of'], ['vntActuator', 'turned by the crank of']],
  },
  turbineWheel: {
    name: 'Turbine wheel and shaft', sys: 'turbo', label: 'inner',
    desc: 'Radial-inflow wheel of a nickel alloy that survives exhaust gas at up to 800 °C or more, friction-welded to a hardened steel shaft. Gas enters at the rim and leaves along the axis. Behind the wheel a boss carries a piston ring that keeps gas out of the bearing housing and oil in. The shaft passes through both journal bearings, the thrust collar and the compressor wheel, and the lock nut at the far end clamps the whole stack against the shoulder of the shaft.',
    specs: [['Wheel', '≈ Ø 43 mm inlet / Ø 36 mm outlet (rebuild-part listing)'], ['Blades', '9 (typical for GT17)'], ['Shaft journals', '≈ Ø 8 mm'], ['Seal', 'Piston ring in the hub'], ['Speed', 'Well over 150 000 rpm']],
    links: [['vntVanes', 'driven by gas from'], ['journalBearingT', 'runs in'], ['thrustCollar', 'carries'], ['compressorWheel', 'drives'], ['turboHeatShield', 'backed by'], ['turbineHousing', 'spins inside']],
  },
  turboHeatShield: {
    name: 'Turbine heat shield', short: 'Heat shield', sys: 'turbo', label: 'inner',
    desc: 'Dished sheet-steel disc trapped between the bearing housing and the turbine housing, directly behind the turbine wheel. It keeps the hot gas off the bearing housing face so the oil at the turbine-end bearing does not coke.',
    specs: [['Material', 'Stainless sheet'], ['Held by', 'The clamped joint of the two housings']],
    links: [['turbo', 'protects'], ['turbineWheel', 'sits behind'], ['turbineHousing', 'clamped by']],
  },
  journalBearingT: {
    name: 'Journal bearing, turbine side', short: 'Journal bearing T', sys: 'turbo', label: 'inner',
    desc: 'One of two bronze bushes that float freely; this one works at the hot end. Both float: an oil film separates each from the shaft inside and from the housing bore outside, and the bush itself turns at roughly half shaft speed. The double film damps the shaft and tolerates the heat. Radial holes pass oil to the inner film, and retaining rings in the bore stop the bushes from wandering along the shaft.',
    specs: [['Quantity', '2 in the turbocharger'], ['Type', 'Fully floating plain bearing'], ['Material', 'Bronze'], ['Located by', 'Retaining rings in the housing bore'], ['Depends on', 'Clean oil at pressure – the usual cause of turbo failure']],
    links: [['turbo', 'float in the bore of'], ['turbineWheel', 'carry the shaft of'], ['turboOilFeed', 'fed by']],
  },
  thrustCollar: {
    name: 'Thrust collar', sys: 'turbo', label: 'inner',
    desc: 'Hardened steel spool pushed onto the thin end of the shaft. Its two shoulders grip the thrust bearing from both sides, so it passes the axial push of the wheels into the bearing. Its sleeve runs through the seal plate and carries the compressor-side piston ring, which keeps oil out of the intake air.',
    specs: [['Material', 'Hardened steel'], ['Seal', 'Piston ring on the sleeve'], ['Clamped by', 'Compressor wheel and lock nut']],
    links: [['thrustBearing', 'shoulders run against'], ['turbineWheel', 'sits on the shaft of'], ['sealPlate', 'sleeve seals in'], ['compressorWheel', 'clamped by']],
  },
  thrustBearing: {
    name: 'Thrust bearing', sys: 'turbo', label: 'inner',
    desc: 'Horseshoe-shaped bronze plate that slides into the groove of the thrust collar and sits in a pocket on the compressor side of the bearing housing. Gas forces push the shaft towards one end or the other depending on load; tapered pads on both faces build an oil wedge against the shoulders of the thrust collar and hold the shaft in place axially. A drilling feeds the pads with oil from the housing gallery, and two pins stop the plate from turning.',
    specs: [['Material', 'Bronze'], ['Faces', 'Tapered-land pads on both sides'], ['Located by', '2 pins, held by the seal plate'], ['Checked by', 'Axial play of the shaft']],
    links: [['thrustCollar', 'runs between the shoulders of'], ['turbo', 'sits in a pocket of'], ['sealPlate', 'held in by']],
  },
  sealPlate: {
    name: 'Seal plate', sys: 'turbo', label: 'inner',
    desc: 'Aluminium back plate of the compressor. Screwed to the cold flange of the bearing housing, it closes the thrust bearing pocket and forms the rear wall of the diffuser behind the compressor wheel. The thrust collar sleeve passes through its centre bore, where the piston ring seals. A sheet-metal deflector on the oil side throws oil away from that seal, and an O-ring on the rim seals against the compressor housing.',
    specs: [['Material', 'Aluminium'], ['To the bearing housing', '≈ 4 screws'], ['Rim seal', 'O-ring'], ['Centre seal', 'Piston ring of the thrust collar']],
    links: [['turbo', 'screwed to'], ['compressorHousing', 'closes'], ['thrustBearing', 'retains'], ['thrustCollar', 'sealed by piston ring of'], ['compressorWheel', 'sits behind']],
  },
  compressorWheel: {
    name: 'Compressor wheel', sys: 'turbo', label: 'inner',
    desc: 'Aluminium wheel with six full and six splitter blades. Air enters along the axis at the small inducer, is flung outward and leaves the rim at high speed; the diffuser and volute then turn that speed into pressure. The wheel is a sliding fit on the shaft and is driven only by the clamping force of the lock nut, which has a left-hand thread so that it cannot work loose.',
    specs: [['Size', '≈ Ø 35 mm inducer / Ø 49 mm exducer (rebuild-part listing)'], ['Blades', '6 + 6 (typical)'], ['Material', 'Cast aluminium'], ['Fixing', 'Lock nut, left-hand thread'], ['Balancing', 'Checked as a rotating assembly']],
    links: [['turbineWheel', 'clamped on the shaft of'], ['compressorHousing', 'spins inside'], ['thrustCollar', 'clamps'], ['sealPlate', 'runs in front of']],
  },
  compressorHousing: {
    name: 'Compressor housing', sys: 'turbo', label: 'inner',
    desc: 'Aluminium casting with the air inlet in the middle and the spiral volute round the outside. The intake pipe from the air mass meter pushes over the inlet stub. Clamp plates with bolts hold the housing to the rim of the seal plate, sealed by an O-ring. The outlet leaves the volute tangentially and turns down and back; the pressure hose to the charge air cooler plugs onto it with a seal ring and a spring clip rather than a screw clamp.',
    specs: [['Material', 'Aluminium'], ['Inlet', '≈ Ø 46 mm bore, intake pipe pushed on'], ['Outlet', '≈ Ø 44 mm, plug-in coupling with seal ring and retaining clip'], ['To the seal plate', '≈ 5 clamp plates with bolts'], ['Also carries', 'Bracket of the vacuum actuator']],
    links: [['intakePipe', 'air in from'], ['boostPipe', 'compressed air out to'], ['sealPlate', 'bolted to'], ['compressorWheel', 'surrounds'], ['vntActuator', 'carries the bracket of']],
  },
  vntActuator: {
    name: 'Vacuum actuator', short: 'Vane actuator', sys: 'turbo', label: 'inner',
    desc: 'Vacuum unit that sets the guide vanes. A diaphragm pulls the control rod against a spring when solenoid valve N75 applies vacuum. The rod turns a small crank whose shaft passes through the housing; the inner arm of the crank moves the lug of the unison ring. With no vacuum the spring holds the vanes open (low boost, the safe position); full vacuum closes them for maximum boost at low revs. The engine control unit pulses N75 and watches charge pressure sender G31 to close the loop. A stop screw limits the smallest gap.',
    specs: [['Type', 'Vacuum diaphragm unit with return spring'], ['Controlled by', 'Solenoid valve N75 (charge pressure control)'], ['No vacuum', 'Vanes open'], ['Full vacuum', 'Vanes closed'], ['Mounting', 'Bracket on the compressor housing'], ['Adjustment', 'Rod length and minimum-flow stop screw']],
    links: [['vntUnison', 'crank turns'], ['valveBlock', 'vacuum metered by N75 in'], ['vacuumLines', 'vacuum arrives through'], ['compressorHousing', 'bracket bolted to'], ['turbo', 'crank shaft passes through'], ['g31', 'loop closed by']],
  },
  turboOilFeed: {
    name: 'Turbocharger oil feed', short: 'Turbo oil feed', sys: 'turbo', label: 'inner',
    desc: 'Thin steel pipe that brings filtered, pressurised oil from the oil filter module round the gearbox end of the engine to a threaded union on top of the bearing housing. Two clips hold it against vibration. The oil lubricates and cools both journal bearings and the thrust bearing; without it the shaft seizes within seconds.',
    specs: [['Feed pipe', '038 145 771 AG (ETKA 145-055, item 9)'], ['Union', 'M10 × 1 / M14 × 1.5 with seal, 028 145 786'], ['Clips', '2, M6']],
    links: [['oilFilter', 'feed starts at'], ['turbo', 'feeds and drains'], ['journalBearingT', 'lubricates'], ['thrustBearing', 'lubricates'], ['block', 'returns into'], ['sump', 'drains to']],
  },

  turbineClamps: {
    name: 'Clamp plates and bolts, turbine side', short: 'Turbine clamps', sys: 'turbo', label: 'inner',
    desc: 'Small steel plates, each held by one bolt screwed into the bearing housing, that hook over the rim of the turbine housing and pull it against the hot flange. Because the housing is only clamped, not pinned, it can be turned to any angle before the bolts are tightened. The heat shield and the nozzle ring are trapped by this joint.',
    specs: [['Quantity', '≈ 4 plates + 4 bolts'], ['Screwed into', 'Bearing housing'], ['Note', 'Bolts seize with heat; renewed on overhaul']],
    links: [['turbineHousing', 'clamp'], ['turbo', 'bolts screw into'], ['turboHeatShield', 'joint traps'], ['nozzleRing', 'joint traps']],
  },
  catSeal: {
    name: 'Seal ring, turbine outlet', short: 'Outlet seal', sys: 'turbo', label: 'inner',
    desc: 'Metal seal ring that sits between the tapered flange of the turbine outlet and the flange of the catalytic converter pipe. The V-band clamp squeezes it as it is tightened. It is renewed every time the joint is opened.',
    specs: [['Part', '1K0 253 115 T (ETKA 253-065, item 3)'], ['Renew', 'Each time the joint is opened']],
    links: [['catClamp', 'squeezed by'], ['turbineHousing', 'seals outlet of'], ['catalyst', 'seals inlet of']],
  },
  nozzleRing: {
    name: 'Nozzle ring', sys: 'turbo', label: 'inner',
    desc: 'Flat ring plate that carries the variable geometry. Eleven bores take the pivot pins of the guide vanes; three spacer pins on the vane side rest against the turbine housing wall and set the running clearance of the vanes; three rollers on the back keep the unison ring centred. The plate sits in the mouth of the turbine housing and is trapped there when the bearing housing is clamped on.',
    specs: [['Pivot bores', '11, on ≈ Ø 62 mm'], ['Spacer pins', '3'], ['Guide rollers', '3'], ['Material', 'Heat-resistant steel']],
    links: [['vntVanes', 'carries'], ['vntUnison', 'rollers guide'], ['turbineHousing', 'seated in'], ['turbineClamps', 'trapped by the joint of']],
  },
  pistonRingT: {
    name: 'Piston ring, turbine side', short: 'Turbine seal ring', sys: 'turbo', label: 'inner',
    desc: 'Small split steel ring in the groove of the shaft boss behind the turbine wheel. It springs outward against the bore of the bearing housing and stays still while the shaft turns inside it. It is a gas seal more than an oil seal: it keeps exhaust pressure out of the bearing housing, and the oil is kept in mainly by the drain being free.',
    specs: [['Type', 'Split ring, like a piston ring'], ['Seat', 'Groove in the shaft boss'], ['Seals against', 'Bore of the bearing housing']],
    links: [['turbineWheel', 'sits in the groove of'], ['turbo', 'seals in the bore of']],
  },
  journalBearingC: {
    name: 'Journal bearing, compressor side', short: 'Journal bearing C', sys: 'turbo', label: 'inner',
    desc: 'The second of the two floating bronze bushes, at the cold end of the bearing housing. Like its twin it rides on an oil film inside and outside and turns at roughly half shaft speed. Two retaining rings in the bore keep it in position.',
    specs: [['Type', 'Fully floating plain bearing'], ['Material', 'Bronze'], ['Size', '≈ Ø 8 × Ø 12.3 × 9 mm'], ['Oil holes', '4 radial']],
    links: [['turbo', 'floats in the bore of'], ['turbineWheel', 'carries the shaft of'], ['bearingCirclips', 'located by'], ['turboOilFeed', 'fed by']],
  },
  bearingCirclips: {
    name: 'Bearing retaining rings', short: 'Retaining rings', sys: 'turbo', label: 'inner',
    desc: 'Four spring rings snapped into grooves in the bore of the bearing housing, one each side of each journal bearing. They stop the floating bushes from sliding along the shaft while leaving them free to turn.',
    specs: [['Quantity', '4'], ['Seat', 'Grooves in the housing bore']],
    links: [['journalBearingT', 'locate'], ['journalBearingC', 'locate'], ['turbo', 'snap into']],
  },
  pistonRingC: {
    name: 'Piston ring, compressor side', short: 'Compressor seal ring', sys: 'turbo', label: 'inner',
    desc: 'Split steel ring in the groove of the thrust collar sleeve. It seals against the centre bore of the seal plate and keeps oil mist out of the intake air. When the engine idles there is slight vacuum behind the compressor wheel, so this seal relies on the oil deflector keeping it dry.',
    specs: [['Type', 'Split ring'], ['Seat', 'Groove in the thrust collar'], ['Seals against', 'Bore of the seal plate']],
    links: [['thrustCollar', 'sits in the groove of'], ['sealPlate', 'seals in the bore of'], ['oilDeflector', 'kept dry by']],
  },
  oilDeflector: {
    name: 'Oil deflector', sys: 'turbo', label: 'inner',
    desc: 'Thin dished steel disc between the thrust bearing and the seal plate. Oil leaving the thrust bearing is thrown outward by the spinning collar; the deflector catches it and leads it down to the drain instead of letting it reach the compressor-side piston ring.',
    specs: [['Material', 'Sheet steel'], ['Held by', 'Seal plate']],
    links: [['sealPlate', 'held by'], ['thrustBearing', 'catches oil from'], ['pistonRingC', 'protects']],
  },
  sealPlateScrews: {
    name: 'Seal plate screws', sys: 'turbo', label: 'inner',
    desc: 'Screws that fix the seal plate to the cold flange of the bearing housing. Tightening them also clamps the thrust bearing and the oil deflector in their pocket.',
    specs: [['Quantity', '≈ 4'], ['Screwed into', 'Bearing housing']],
    links: [['sealPlate', 'fix'], ['turbo', 'screw into']],
  },
  housingOring: {
    name: 'O-ring, compressor housing', short: 'Housing O-ring', sys: 'turbo', label: 'inner',
    desc: 'Rubber ring between the rim of the seal plate and the compressor housing. It seals the charge pressure inside the housing.',
    specs: [['Material', 'Heat-resistant rubber'], ['Diameter', '≈ 97 mm']],
    links: [['sealPlate', 'sits on the rim of'], ['compressorHousing', 'seals']],
  },
  shaftNut: {
    name: 'Shaft lock nut', sys: 'turbo', label: 'inner',
    desc: 'Self-locking nut on the threaded end of the shaft. It clamps the compressor wheel and the thrust collar against the shoulder of the shaft, so the wheel is driven by friction alone. The thread is left-handed so that the nut tends to tighten as the wheel spins up. Loosening it changes the balance of the rotating assembly.',
    specs: [['Thread', 'Left-hand'], ['Clamps', 'Compressor wheel + thrust collar'], ['After refitting', 'Rotating assembly rebalanced']],
    links: [['compressorWheel', 'clamps'], ['turbineWheel', 'screws onto the shaft of'], ['thrustCollar', 'clamps']],
  },
  compressorClamps: {
    name: 'Clamp plates and bolts, compressor side', short: 'Compressor clamps', sys: 'turbo', label: 'inner',
    desc: 'Clamp plates with bolts that hold the compressor housing against the rim of the seal plate. As on the turbine side, the housing can be turned before they are tightened, which sets where the outlet points.',
    specs: [['Quantity', '≈ 5 plates + 5 bolts'], ['Screwed into', 'Seal plate']],
    links: [['compressorHousing', 'clamp'], ['sealPlate', 'bolts screw into']],
  },
  vntRod: {
    name: 'Control rod', sys: 'turbo', label: 'inner',
    desc: 'Thin steel rod from the diaphragm of the vacuum actuator to the outer lever of the vane crank. Its length, set with the adjusting nut, decides at what vacuum the vanes start to move.',
    specs: [['Adjustment', 'Threaded end with lock nut'], ['Travel', '≈ 12 mm']],
    links: [['vntActuator', 'pulled by'], ['vntCrank', 'turns']],
  },
  vntCrank: {
    name: 'Vane crank', sys: 'turbo', label: 'inner',
    desc: 'Small crank that carries the actuator movement into the hot turbine. The outer lever is pulled by the control rod; its shaft passes through a bush in the bearing housing flange; the inner arm ends in a pin that engages the lug of the unison ring. A stop screw limits how far the vanes can close.',
    specs: [['Parts', 'Outer lever, shaft, inner arm with pin'], ['Bearing', 'Bush in the bearing housing'], ['Stop', 'Minimum-flow screw']],
    links: [['vntRod', 'turned by'], ['vntUnison', 'pin moves the lug of'], ['turbo', 'shaft runs in a bush of']],
  },
  turboOilReturn: {
    name: 'Turbocharger oil return', short: 'Turbo oil return', sys: 'turbo', label: 'inner',
    desc: 'Wide pipe bolted to the flange under the bearing housing with a gasket and two bolts. The oil, now foamy and hot, falls back by gravity through a union in the cylinder block into the sump. The return must stay wide and steep: if it is kinked or blocked, oil backs up in the bearing housing and is pushed past both piston rings into the intake and exhaust.',
    specs: [['Return line', '038 145 736 C (ETKA 145-055, item 5C)'], ['Flange', 'Gasket 028 145 757, 2 × M6 × 16'], ['Block union', '12 / M18 × 1.5'], ['Flow', 'By gravity only']],
    links: [['turbo', 'drains'], ['block', 'returns into'], ['sump', 'drains to'], ['pistonRingT', 'a blocked return floods'], ['pistonRingC', 'a blocked return floods']],
  },
};

Object.assign(PARTS, DRIVETRAIN, ENGINE_DETAIL, COOLING, LINES, INJECTOR, BAY);

// Connections from the engine's own parts to the parts around it.
const MORE_LINKS = {
  crankshaft: [['flywheelBolts', 'flange takes']],
  block: [['gearbox', 'gearbox bolted to'], ['flangeShaftR', 'carries the support bearing of']],
  turbo: [['journalBearingC', 'bore holds'], ['bearingCirclips', 'grooves hold'], ['turboOilReturn', 'oil drains through'], ['turbineClamps', 'takes the bolts of'], ['sealPlateScrews', 'takes'], ['pistonRingT', 'bore sealed by'], ['vntCrank', 'bush carries']],
  turbineWheel: [['pistonRingT', 'groove carries'], ['journalBearingC', 'runs in'], ['shaftNut', 'thread takes']],
  turbineHousing: [['turbineClamps', 'held by'], ['catSeal', 'outlet sealed by'], ['nozzleRing', 'seats']],
  vntVanes: [['nozzleRing', 'pivot in']],
  vntUnison: [['nozzleRing', 'centred by rollers on'], ['vntCrank', 'lug moved by']],
  vntActuator: [['vntRod', 'pulls'], ['vntCrank', 'acts through']],
  thrustCollar: [['pistonRingC', 'groove carries'], ['shaftNut', 'clamped by']],
  thrustBearing: [['oilDeflector', 'oil caught by'], ['turboOilFeed', 'fed by']],
  sealPlate: [['sealPlateScrews', 'fixed by'], ['housingOring', 'rim carries'], ['oilDeflector', 'holds'], ['pistonRingC', 'bore sealed by'], ['compressorClamps', 'takes the bolts of']],
  compressorWheel: [['shaftNut', 'clamped by']],
  compressorHousing: [['compressorClamps', 'held by'], ['housingOring', 'sealed by']],
  catClamp: [['catSeal', 'squeezes']],
  journalBearingT: [['bearingCirclips', 'located by']],
  chargePipe: [['intercooler', 'cooled air from']],
  exhaustManifold: [['turbineHousing', 'one casting with']],
  catalyst: [['catClamp', 'held to the turbine by'], ['frontPipe', 'gas to']],
  intakePipe: [['compressorHousing', 'pushes onto the inlet of']],
  boostPipe: [['compressorHousing', 'plugs onto the outlet of']],
  vacuumLines: [['vntActuator', 'N75 line ends at'], ['airbox', 'vent hose ends in']],
  airbox: [['vacuumLines', 'takes the vent hose of the solenoid valves']],
  block: [['turboOilReturn', 'turbo oil returns into'], ['turbineHousing', 'support bolted to']],
  coolantFlange: [['hoseTop', 'radiator feed'], ['coolantPipes', 'feeds the EGR cooler and heater through'], ['ventLines', 'vented through']],
  thermostat: [['hoseBottom', 'radiator return']],
  coolantPump: [['coolantPipes', 'heater, oil cooler and tank return through']],
  egrCooler: [['coolantPipes', 'coolant from the flange through'], ['heaterHoses', 'coolant on to the heater through'], ['vacuumLines', 'flap vacuum through']],
  egrValve: [['vacuumLines', 'vacuum through']],
  oilFilter: [['coolantPipes', 'oil cooler coolant from'], ['turboOilFeed', 'turbo oil feed pipe']],
  tandemPump: [['fuelFilter', 'fuel from'], ['vacuumLines', 'vacuum out through']],
  valveBlock: [['vacuumLines', 'vacuum out through'], ['loom', 'driven through'], ['vntActuator', 'N75 controls']],
  vacReservoir: [['vacuumLines', 'connected by']],
  alternator: [['powerCables', 'B+ cable'], ['battery', 'charges'], ['loom', 'excitation through']],
  acCompressor: [['condenser', 'refrigerant to']],
  g31: [['loom', 'wired through']],
  g62: [['loom', 'wired through']],
  g28: [['loom', 'wired through']],
  g40: [['loom', 'wired through']],
  glowPlugs: [['loom', 'supplied through']],
  injectors: [['loom', 'triggered through']],
  intakeFlap: [['loom', 'driven through']],
  valveCover: [['intakePipe', 'breather hose runs from the pressure-regulating valve to']],
};
for (const [id, extra] of Object.entries(MORE_LINKS)) PARTS[id].links.push(...extra);
for (const [id, extra] of Object.entries(ENGINE_LINKS)) PARTS[id].links.push(...extra);
for (const [id, note] of Object.entries(ENGINE_NOTES)) PARTS[id].desc += note;
