// Small parts of the engine itself (crankcase, block, head).
// Sizes are scaled to the modelled engine (≈); they are not catalogue dimensions.
const p = (name, sys, desc, specs, links, extra = {}) => ({ name, sys, label: 'inner', desc, specs, links, ...extra });
const m = (name, desc, specs, links, extra) => p(name, 'mech', desc, specs, links, extra);
const v = (name, desc, specs, links, extra) => p(name, 'valve', desc, specs, links, extra);

export const ENGINE_DETAIL = {
  mainBearings: m('Main bearing shells', 'Ten thin steel-backed half shells, two for each of the five main bearings. The upper shells sit in the block and have an oil groove and hole that feed oil on to the big-end bearings through drillings in the crankshaft; the lower shells in the caps are plain because they carry the firing load. Press 1 (or the Crankcase button) to drop the bottom end out of the block.',
    [['Quantity', '5 upper + 5 lower'], ['Journal', '≈ Ø 54 mm'], ['Upper shell', 'Oil groove and feed hole'], ['Lower shell', 'Plain, load-bearing']],
    [['crankshaft', 'carry'], ['block', 'upper shells sit in'], ['mainCaps', 'lower shells sit in'], ['oilPump', 'fed with oil by']]),
  thrustWashers: m('Crankshaft thrust washers', 'Four half washers either side of the middle main bearing. They take the push along the crankshaft, mainly when the clutch is pressed, and set the crankshaft end float. Their oil grooves face the crank webs.',
    [['Position', 'Main bearing 3'], ['Quantity', '4 halves: 2 in the block, 2 on the cap'], ['Sets', 'Crankshaft end float']],
    [['crankshaft', 'locate'], ['mainCaps', 'lower halves on cap 3 of'], ['block', 'upper halves in']]),
  mainCaps: m('Main bearing caps', 'Five cast-iron caps that clamp the crankshaft into the block. They are machined together with the block, so each has its own place and direction; cast-in marks number them 1 to 5 from the belt end.',
    [['Quantity', '5'], ['Material', 'Grey cast iron'], ['Fit', 'Line-bored with the block, not interchangeable']],
    [['mainCapBolts', 'held by'], ['mainBearings', 'carry the lower shells of'], ['block', 'bolted to'], ['crankshaft', 'clamp']]),
  mainCapBolts: m('Main bearing cap bolts', 'Two stretch bolts per cap, screwed up into the block. They are tightened to a torque and then turned a further angle, and are renewed every time.',
    [['Quantity', '10'], ['Type', 'Stretch bolts, single use'], ['Tightening', 'Torque plus angle']],
    [['mainCaps', 'clamp'], ['block', 'screw into']]),
  frontFlange: m('Front sealing flange', 'Aluminium cover on the belt end of the crankcase. It carries the front crankshaft oil seal and is sealed to the block with liquid sealant; the toothed belt sprocket runs just outside it.',
    [['Material', 'Aluminium'], ['Carries', 'Crankshaft oil seal'], ['Fixing', '≈ 6 bolts']],
    [['block', 'bolted to'], ['crankshaft', 'seals the nose of'], ['timingBelt', 'sits behind the sprocket of']]),

  pistonRings: m('Piston rings', 'Three rings per piston. The top compression ring is wedge-shaped (keystone) so that it keeps moving in its groove and does not stick with soot; the second is a taper-faced compression ring that also scrapes oil; the third is an oil scraper ring pressed outward by a coil expander spring. Press 2 (or the Block button) to pull the pistons and rods out of the block.',
    [['Per piston', '3'], ['1st', 'Keystone compression ring'], ['2nd', 'Taper-face compression ring'], ['3rd', 'Oil scraper ring with expander spring'], ['Gaps', 'Staggered 120° on assembly']],
    [['pistons', 'sit in the grooves of'], ['block', 'seal against the bores of']]),
  pistonPins: m('Piston pins and circlips', 'Hollow hardened steel pin linking piston and connecting rod. It floats in both, and a wire circlip in a groove at each end of the piston bore stops it sliding out against the cylinder wall.',
    [['Pin', '≈ Ø 26 × 66 mm, hollow'], ['Fit', 'Fully floating'], ['Circlips', '2 per piston']],
    [['pistons', 'pass through'], ['conrods', 'carry the small end of'], ['rodBearings', 'run in the small-end bush of']]),
  rodBearings: m('Big-end shells and small-end bushes', 'Two half shells in each big end and a bronze bush pressed into each small end. The upper shell, in the rod itself, takes the full firing load.',
    [['Big-end shells', '2 per rod'], ['Crank pin', '≈ Ø 47.8 mm'], ['Small-end bush', 'Bronze, pressed in']],
    [['conrods', 'sit in'], ['rodCaps', 'lower shells sit in'], ['crankshaft', 'run on the pins of'], ['pistonPins', 'bush carries']]),
  rodCaps: m('Connecting rod caps', 'Lower half of each big end. Rod and cap are made as one piece and then cracked apart, so the rough fracture faces fit only their own partner and locate the cap exactly.',
    [['Quantity', '4'], ['Location', 'Fracture-split faces']],
    [['conrods', 'matched to'], ['rodBolts', 'held by'], ['rodBearings', 'carry the lower shell of']]),
  rodBolts: m('Connecting rod bolts', 'Two stretch bolts per rod, screwed up through the cap into the rod. Renewed every time.',
    [['Quantity', '8'], ['Type', 'Stretch bolts, single use']], [['rodCaps', 'clamp'], ['conrods', 'screw into']]),
  oilJets: m('Piston cooling oil jets', 'One spray jet per cylinder, bolted into the crankcase below the bore. Above a set oil pressure a valve in the jet opens and it sprays oil up into the cooling channel inside the piston.',
    [['Quantity', '4'], ['Opens', 'Above ≈ 2 bar oil pressure'], ['Aims at', 'Cooling channel in the piston']],
    [['pistons', 'cool'], ['block', 'bolted into'], ['oilPump', 'supplied by']]),
  blockDowels: m('Head locating dowels', 'Two hollow dowel sleeves in the block deck that position the head gasket and the cylinder head exactly over the bores.',
    [['Quantity', '2']], [['block', 'pressed into'], ['headGasket', 'locate'], ['head', 'locate']]),

  headBolts: v('Cylinder head bolts', 'Ten stretch bolts clamp the head and gasket to the block. Each has a threaded bore in its head: the bolts of the bearing frame screw into the head bolts themselves (“bolt in bolt”), which saves space between the four valves. Tightened from the centre outwards in stages, and always renewed. Press 3 (or the Head button) to take the head apart.',
    [['Quantity', '10'], ['Type', 'Stretch bolts with internal thread (SSP 316)'], ['Sequence', 'From the centre outwards, in stages']],
    [['head', 'clamp'], ['block', 'screw into'], ['bearingFrame', 'take the bolts of'], ['headGasket', 'compress']]),
  valveSeats: v('Valve seat inserts', 'Hardened rings shrunk into the aluminium head. The valve head closes against them, and most of the heat of an exhaust valve leaves through this contact.',
    [['Quantity', '16'], ['Fit', 'Shrunk in']], [['head', 'shrunk into'], ['valves', 'seal against']]),
  valveGuides: v('Valve guides', 'Bronze sleeves pressed into the head. They keep each valve stem in line and carry heat from the stem into the head.',
    [['Quantity', '16'], ['Stem', '≈ Ø 6 mm']], [['head', 'pressed into'], ['valves', 'guide'], ['valveSeals', 'carry']]),
  valveSeals: v('Valve stem seals', 'Small rubber caps with a garter spring, pushed over the top of each guide. They wipe the stem so that only a film of oil reaches the guide; worn seals show as blue smoke after idling.',
    [['Quantity', '16'], ['Seat', 'Top of the valve guide']], [['valveGuides', 'sit on'], ['valves', 'wipe the stems of']]),
  camBearings: v('Camshaft bearing shells', 'Each camshaft runs in five split bearings: the lower shells lie in the head, the upper shells in the bearing frame. Shells are used because the exhaust camshaft also has to carry the high forces of the unit injector drive.',
    [['Quantity', '10 lower + 10 upper'], ['Journal', '≈ Ø 29 mm']], [['camIn', 'carry'], ['camEx', 'carry'], ['head', 'lower shells in'], ['bearingFrame', 'upper shells in']]),
  camSeals: v('Camshaft oil seals', 'A lip seal round each camshaft at the belt end keeps oil off the toothed belt. At the gearbox end the exhaust camshaft bore is closed by a sealing cap; the inlet camshaft drives the tandem pump there.',
    [['Belt end', '2 lip seals'], ['Gearbox end', 'Sealing cap (exhaust camshaft)']], [['camIn', 'seal'], ['camEx', 'seal'], ['head', 'pressed into'], ['timingBelt', 'keep oil off']]),
  coverGasket: v('Cylinder head cover gasket', 'Moulded rubber seal between the head and its cover.', [['Material', 'Rubber, moulded']], [['valveCover', 'seals'], ['head', 'sits on']]),
};

// ───────────── Coolant hoses and pipes, connected as in ETKA 121-045 ─────────────
// Which hose joins which component, the pipe fittings and the clamp sizes are from the catalogue.
// The paths between the end points are modelled routes, not measured ones.
const k = (name, desc, specs, links, extra) => p(name, 'cool', desc, specs, links, { label: undefined, ...extra });
export const COOLING = {
  hoseTop: k('Upper radiator hose', 'Takes hot coolant from the flange on the gearbox end of the cylinder head to the top of the radiator. Both ends are plug-in quick-release couplings: a plastic sleeve with an O-ring, locked by a wire retaining spring that is pulled out to release it. A spring band clamp holds the rubber on each coupling.',
    [['ETKA', '121-045, quick-acting coupling with retaining spring 32 mm'], ['Hose', '≈ 32 mm bore, 40 mm outside'], ['Clamps', 'Spring band 40 × 12'], ['Seal', 'O-ring 32 × 4 in each coupling']],
    [['coolantFlange', 'starts at'], ['radiator', 'ends at']], { short: 'Upper hose' }),
  hoseBottom: k('Lower radiator hose', 'Catalogue item 1, “coolant hose with quick-release coupling (radiator / pump)”: returns cooled coolant from the bottom of the radiator along the front of the engine to the thermostat housing at the pump inlet. The coupling next to the radiator carries coolant temperature sender G83, which the engine control unit compares with G62 to run the fans.',
    [['ETKA', '121-045, item 1'], ['Hose', '≈ 32 mm bore, 40 mm outside'], ['Clamps', 'Spring band 40 × 12'], ['Carries', 'Radiator outlet temperature sender G83']],
    [['radiator', 'starts at'], ['thermostat', 'ends at'], ['fans', 'G83 helps switch'], ['g62', 'G83 compared with']], { short: 'Lower hose' }),
  coolantPipes: k('Coolant pipe and engine hoses', 'The fixed part of the small circuit. A steel pipe (item 10) lies along the front of the block: its branch plugs into the pump inlet with a seal ring, a lug and a double stud hold it, and its far end rises at the gearbox end to take the heater return. Two hoses serve the oil cooler under the oil filter: one from the block, one back into the pipe. A third hose (item 44) takes coolant from the flange on the head to the EGR cooler.',
    [['Coolant pipe', 'Item 10, seal ring 20.5 × 5.5, bolt M7 × 12, double stud M10 × 20 / M8 × 12'], ['Oil cooler hoses', 'Item 15 (cooler → pipe), item 16 (cooler → block)'], ['Item 44', 'Flange → exhaust gas cooler'], ['Clamps', 'Spring band 23 × 12 and 27 × 12']],
    [['coolantPump', 'returns to'], ['heaterHoses', 'takes the heater return from'], ['egrCooler', 'feeds'], ['oilFilter', 'serves the oil cooler under'], ['coolantFlange', 'hose 44 starts at'], ['expansionTank', 'takes the hose from'], ['block', 'pipe bolted to']], { short: 'Coolant pipes' }),
  heaterHoses: k('Heater hoses', 'The heater is fed through the EGR cooler: hose 45 runs from the cooler over the intake pipe to the heat exchanger connection on the bulkhead, and hose 42 brings the coolant back round the gearbox end into the steel pipe on the front of the block. Each plugs onto the heat exchanger with a quick-release coupling. This circuit flows even when the thermostat is closed, so heater and EGR cooler work while the engine is still warming up.',
    [['Feed', 'Item 45, EGR cooler → heat exchanger, coupling item 46'], ['Return', 'Item 42, heat exchanger → coolant pipe, coupling item 43'], ['Hose', '27 mm outside'], ['Clamps', 'Spring band 27 × 12']],
    [['egrCooler', 'feed leaves'], ['coolantPipes', 'return joins']]),
  ventLines: k('Coolant vent lines', 'Thin lines that carry air and steam bubbles from the two highest points — the flange on the head and the top of the radiator — to the expansion tank. A small steel pipe (item 38) is bracketed along the back of the head cover; short hoses join it to the flange, and a three-way distributor joins it and the radiator vent hose to the hose into the top of the tank.',
    [['Vent pipe', 'Item 38, brackets 7.2 × 6.5 with M6 × 15'], ['Hoses', 'Items 24, 25, 48 (twin), 49'], ['Distributor', 'Item 26, 8 × 8 × 8, 60°'], ['Hose', '8 mm bore, 14 mm outside'], ['Clamps', 'Spring band 14 × 12']],
    [['coolantFlange', 'vents'], ['radiator', 'vents'], ['expansionTank', 'ends in the top of']], { short: 'Vent lines' }),
  expansionTank: k('Coolant expansion tank', 'Translucent sphere beside the belt end of the engine, about level with the head cover and the highest point of the cooling system; the fuel filter stands just in front of it. It gives the coolant room to expand and holds system pressure with the valve in its blue cap; a sender in the bottom warns of low coolant. The vent lines enter at the top. From the bottom, hose 50 returns coolant to the steel pipe at the pump inlet; in this model it runs down the belt end, under the vibration damper and up behind the A/C compressor.',
    [['Position', 'Beside the belt end, fuel filter in front of it'], ['Diameter', '≈ 170 mm'], ['Return hose', 'Item 50, expansion tank → coolant pipe, bracket item 51'], ['Clamps', 'Spring band 23 × 12'], ['Sender', 'Coolant shortage indicator G32']],
    [['coolantPipes', 'hose 50 joins'], ['ventLines', 'vented into by'], ['radiator', 'vented from']], { short: 'Expansion tank', label: 'always' }),
};

// ───────────── Vacuum lines and fuel filter, as in ETKA 131-080, 611-070 and 127-020 ─────────────
export const LINES = {
  vacuumLines: p('Vacuum lines', 'exh', 'Vacuum from the pump in the tandem pump goes first to the brake servo, through a plastic pipe with a non-return valve so that the servo keeps its reserve when the engine stops. A branch with its own non-return valve supplies the solenoid valve unit. From its connector strip one hose stores vacuum in the reservoir, one controlled hose each runs to the EGR valve, the EGR cooler flap and the turbocharger actuator, and a vent hose ends in the air filter housing so the valves breathe clean air. Every hose end has a small spring band clamp.',
    [['ETKA', '131-080 (hoses, valve unit, reservoir), 611-070 item 6 (servo pipe, BKD)'], ['Non-return valves', '2: servo pipe and valve unit supply'], ['Controlled lines', 'N18 → EGR valve, N345 → cooler flap, N75 → turbocharger'], ['Vent', 'Hose to the air filter housing'], ['Hose', '8 mm outside'], ['Clamps', 'Spring band 8 × 6']],
    [['tandemPump', 'vacuum from'], ['valveBlock', 'metered by'], ['vacReservoir', 'stored in'], ['turbo', 'moves the guide vanes of'], ['egrValve', 'opens'], ['egrCooler', 'switches the flap of']], { label: undefined }),
  fuelFilter: p('Fuel filter', 'fuel', 'Canister with a flange lid, held by a retainer bolted to the engine mount bracket beside the belt end. Diesel from the tank passes through the paper element before the tandem pump draws it in; the element and its gasket are replaced through the lid, which is sealed by a ring and held by five screws. The four line connections on the lid are the feed from the tank, the feed to the pump, and the return in both directions: in cold weather a preheating valve in the lid sends warm return fuel back through the filter. Water collects at the bottom.',
    [['ETKA', '127-020: fuel filter with flange, filter element with gasket'], ['Lid', 'Oval socket-head bolts M6 × 12, seal ring'], ['Retainer', 'Item 5, bolt M6 × 10 and nut M6'], ['Lines', '4 connections, hose 14 mm outside, spring band clamps 14 × 12'], ['Canister', '≈ Ø 90 × 140 mm']],
    [['tandemPump', 'supplies / takes return from'], ['injectors', 'filtered fuel for']], { label: 'always' }),
};

// ───────────── Unit injector, component by component ─────────────
// How the unit works is from SSP 316; the sizes of the internal parts are scaled to the modelled unit (≈).
const f = (name, desc, specs, links, extra) => p(name, 'fuel', desc, specs, links, extra);
export const INJECTOR = {
  injPlunger: f('Pump piston with ball pin and spring', 'The pump half of the unit. The injector rocker presses on the ball pin, which pushes the pump piston down into the high-pressure chamber of the body; the piston spring returns it and keeps the ball pin against the rocker. One stroke per cycle builds the injection pressure right at the nozzle, so there are no high-pressure pipes. Press 4 (or the Injector button) to take the units apart.',
    [['Driven by', 'Injector rocker on the exhaust camshaft'], ['Stroke', '≈ 7 mm (modelled)'], ['Pressure', 'Up to about 2050 bar'], ['Parts', 'Ball pin, pump piston, piston spring, spring seat']],
    [['injRockers', 'pushed by'], ['injectors', 'works in the bore of'], ['camEx', 'stroke timed by']], { short: 'Pump piston' }),
  injSolenoid: f('Injector solenoid valve', 'Decides when and how much fuel is injected. While the valve needle is open, the fuel the pump piston displaces simply flows back to the supply gallery. When the engine control unit energises the coil, the armature pulls the needle onto its seat, the chamber is sealed and pressure rises until the nozzle opens; switching off ends the injection. One valve per cylinder.',
    [['Codes', 'N240 – N243'], ['Parts', 'Valve needle, spring seat, magnet coil, armature plate, cap nut'], ['Connector', '2-pin, to the central connector on the head'], ['Controlled by', 'Engine control unit']],
    [['injectors', 'screwed into'], ['loom', 'triggered through'], ['injPlunger', 'seals the chamber fed by']], { short: 'Solenoid valve', code: 'N240 – N243' }),
  injClamp: f('Injector clamping piece and bolts', 'Each unit injector is held in its tapered seat by a clamping piece and two bolts, which keeps side loads and structure-borne noise out of the head.',
    [['Fixing', '2 bolts per unit (SSP 316)'], ['Seat', 'Tapered, self-centring']], [['injectors', 'holds down'], ['head', 'bolted to']], { short: 'Injector clamp' }),
  injSeals: f('Injector O-rings and heat shield seal', 'Three O-rings on the body separate the fuel supply gallery, the fuel return gallery and the oil space of the head. Below the nozzle nut a copper heat shield seal, held by a retaining ring, seals the combustion pressure and protects the nozzle from heat. All are renewed whenever the injector is removed.',
    [['O-rings', '3 per unit'], ['Heat shield seal', 'Copper, with retaining ring'], ['Renew', 'Every time the unit is removed']], [['injectors', 'sit on'], ['head', 'seal against the bore in'], ['injNozzleNut', 'heat shield seal sits under']], { short: 'Injector seals' }),
  injNozzleSpring: f('Retraction piston and nozzle spring', 'The parts that shape the injection. The nozzle spring holds the needle shut until fuel pressure overcomes it. After a small pilot quantity the retraction piston gives way and briefly drops the pressure, so the needle closes again; that pause lets the pilot fuel ignite before the main injection, which makes combustion quieter. On the way back, a hydraulic brake cushions the retraction piston to cut injection noise.',
    [['Function', 'Pilot injection and opening pressure'], ['Parts', 'Retraction piston, nozzle spring, spring seat'], ['Noise control', 'Hydraulic retraction piston brake (SSP 316)']], [['injNozzle', 'holds the needle of'], ['injectors', 'sits below the pump chamber of'], ['injSpacer', 'rests on']], { short: 'Nozzle spring' }),
  injSpacer: f('Intermediate disc', 'Hardened disc between the pump body and the nozzle, located by two pins. It limits the lift of the nozzle needle and carries the fuel drillings from the chamber to the nozzle.',
    [['Location', '2 pins'], ['Function', 'Needle lift stop, fuel passage']], [['injNozzle', 'sits on'], ['injNozzleSpring', 'supports'], ['injNozzleNut', 'clamped by']]),
  injNozzle: f('Nozzle and nozzle needle', 'Six-hole nozzle standing vertically over the centre of the piston recess. The needle lifts when fuel pressure overcomes the nozzle spring and sprays through the six holes; one hole is aimed near the glow plug as an “ignition spray”.',
    [['Holes', '6 (SSP 316)'], ['Position', 'Vertical, central over the piston recess'], ['Parts', 'Nozzle body, nozzle needle']], [['injNozzleNut', 'held by'], ['pistons', 'sprays into the recess of'], ['glowPlugs', 'one spray aimed near'], ['injSpacer', 'needle lift limited by']], { short: 'Nozzle' }),
  injNozzleNut: f('Nozzle nut', 'Long union nut that screws onto the pump body and clamps the nozzle, intermediate disc and spring housing together. Its lower end sits on the heat shield seal in the head.',
    [['Function', 'Clamps nozzle and intermediate disc to the body'], ['Seat', 'On the heat shield seal']], [['injectors', 'screws onto'], ['injNozzle', 'clamps'], ['injSeals', 'sits on the heat shield seal of']]),
};

// ───────────── Air path and battery, placed from an engine-bay photograph of a Golf V 2.0 TDI ─────────────
// Positions follow the photograph; joint types and seal sizes follow ETKA 129-050 and 145-085.
export const BAY = {
  airbox: p('Air filter housing', 'air', 'Black plastic housing at the front left of the engine bay (front right as you look in from the bumper), ahead of the battery. Outside air enters through a wide flat duct on the lock carrier; the paper panel filter lies under the ribbed lid, which is held by screws. Filtered air leaves through a neck at the rear inboard corner, where the air mass meter is screwed on. The vent hose of the vacuum solenoid valves also ends here.',
    [['ETKA', '129-050 (BKD, AZV, BMM)'], ['Position', 'Front left of the engine bay, ahead of the battery'], ['Size', '≈ 260 × 140 × 180 mm'], ['Element', 'Paper panel filter under the lid'], ['Mounting', 'Rubber mounts']],
    [['maf', 'clean air leaves through'], ['intakePipe', 'feeds'], ['battery', 'sits in front of'], ['gearbox', 'sits above']], { label: 'always' }),
  maf: p('Air mass meter', 'elec', 'Hot-film sensor in a short plastic tube, fixed to the outlet neck of the air filter housing with two screws. It measures the mass of air actually drawn in; the engine control unit uses it to limit the injected quantity (smoke limit) and to regulate exhaust gas recirculation. The intake hose is held on its other end by a worm-drive hose clip.',
    [['Code', 'G70'], ['Type', 'Hot-film air mass meter'], ['Bore', '≈ 70 mm'], ['Fixing', '2 screws to the housing, seal ring'], ['Used for', 'EGR control, smoke limitation']],
    [['airbox', 'screwed to'], ['intakePipe', 'air flows on to'], ['egrValve', 'EGR rate regulated with'], ['loom', 'wired through']], { code: 'G70', label: 'always' }),
  intakePipe: p('Intake hose and pipe to the turbocharger', 'air', 'From the air mass meter a corrugated rubber hose runs back along the gearbox end of the cylinder head and takes up engine movement. A rigid plastic pipe then crosses behind the head cover, above the EGR cooler, and curves down to the compressor inlet at the belt end, where a rubber connecting piece with an O-ring joins it to the turbocharger. The joints are held by worm-drive hose clips; the crankcase breather gases join the pipe on the way.',
    [['ETKA', '129-050: hose item 6 with clips 7 and 8, pipe item 10, connecting piece items 11–13'], ['Hose outside Ø', '≈ 78 mm'], ['Pipe outside Ø', '≈ 64 mm'], ['Clips', 'Worm-drive hose clips'], ['Sections', 'Corrugated hose, rigid pipe, connecting piece']],
    [['maf', 'air from'], ['turbo', 'feeds the compressor of'], ['valveCover', 'breather gases from'], ['egrCooler', 'passes above']], { short: 'Intake pipe' }),
  battery: p('Battery', 'elec', 'Twelve-volt starter battery in a fabric insulating jacket on a tray at the left rear of the engine bay, behind the air filter housing and next to the bulkhead. It supplies the starter and glow plugs before the engine runs and is recharged by the alternator.',
    [['Voltage', '12 V'], ['Position', 'Left rear of the engine bay, behind the air filter housing'], ['Case modelled', '≈ 242 × 175 × 190 mm'], ['Cover', 'Insulating fabric jacket']],
    [['powerCables', 'connected by'], ['starter', 'supplies'], ['alternator', 'charged by'], ['airbox', 'sits behind']], { label: 'always' }),
  boostPipe: p('Pressure pipe, turbocharger to cooler', 'air', 'Carries the compressed, hot air from the compressor outlet to the charge air cooler: a rubber hose at the turbocharger, a rigid plastic pipe with a pulsation damper, and a hose into the bottom of the cooler. None of the joints uses a screw clamp. Each hose end is crimped into a moulded collar that pushes over the mating stub; a seal ring inside makes it airtight and a wire retaining clip locks it, so the joint comes apart by pulling the clip. The catalogue confirms the parts and joints; the run between the end points is a modelled route.',
    [['ETKA', '145-085, pressure hoses 1K0 145 834 G / L'], ['Seal rings', '57.85 mm and 58.05 mm'], ['Retaining clips', 'SCA52, 1J0 145 769 G / H'], ['Hose outside Ø', '≈ 56 mm'], ['Extras', 'Pulsation damper, bracket 1K0 145 263 C']],
    [['turbo', 'compressed air from'], ['intercooler', 'delivers to'], ['gearbox', 'passes over']], { short: 'Pressure pipe' }),
  chargePipe: p('Charge air pipe', 'air', 'Brings cooled, compressed air from the belt-side tank of the charge air cooler to the intake manifold flap: a hose at each end and a rigid plastic pipe between them, which carries the charge pressure sender. As on the pressure pipe, every joint is a plug-in coupling with a seal ring and a wire retaining clip, and the hose ends are crimped with steel ferrules.',
    [['ETKA', '145-085'], ['Seal rings', '57.85 mm and 58.05 mm'], ['Retaining clips', 'SCA52'], ['Hose outside Ø', '≈ 58 mm'], ['Sections', 'Hose, plastic pipe, hose']],
    [['intakeFlap', 'feeds'], ['g31', 'carries'], ['turbo', 'air from']], { label: undefined }),
};

// Extra connections and notes for the engine parts that already existed.
export const ENGINE_LINKS = {
  pistons: [['pistonRings', 'grooves carry'], ['pistonPins', 'joined to the rods by'], ['oilJets', 'cooled by']],
  conrods: [['rodBearings', 'run on'], ['rodCaps', 'closed by'], ['rodBolts', 'clamped by'], ['pistonPins', 'small end on']],
  head: [['headBolts', 'clamped by'], ['valveSeats', 'holds'], ['valveGuides', 'holds'], ['camBearings', 'lower shells in'], ['coverGasket', 'sealed to the cover by'], ['blockDowels', 'located by']],
  valves: [['valveSeats', 'close on'], ['valveGuides', 'slide in'], ['valveSeals', 'stems wiped by']],
  bearingFrame: [['camBearings', 'upper shells in'], ['headBolts', 'bolted into']],
  camIn: [['camBearings', 'runs in'], ['camSeals', 'sealed by']],
  camEx: [['camBearings', 'runs in'], ['camSeals', 'sealed by']],
  valveCover: [['coverGasket', 'sealed by']],
  sump: [['mainCaps', 'encloses']],
  crankshaft: [['mainBearings', 'runs in'], ['thrustWashers', 'located by'], ['mainCaps', 'held by'], ['rodBearings', 'pins run in'], ['frontFlange', 'nose sealed by']],
  block: [['mainCaps', 'takes'], ['mainCapBolts', 'takes'], ['frontFlange', 'belt end closed by'], ['pistonRings', 'bores sealed by'], ['oilJets', 'carries'], ['blockDowels', 'carries']],
};
export const ENGINE_NOTES = {
  valves: ' In the exploded head view each valve comes apart into the valve, lower spring seat, spring, retainer and the two collets that lock the retainer to the stem.',
  injectors: ' In the exploded head view each unit shows its clamping piece with two bolts, the three O-rings that seal the fuel galleries and the heat shield seal with its retaining ring under the nozzle shoulder.',
};
