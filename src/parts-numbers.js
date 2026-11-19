// Part numbers of the modelled parts. One model part can cover several catalogue items (a pipe and its seal,
// a housing and its bolts), so every part has a list of rows.
//   e(number, what, qty, illustration, item, extra)   read in the ETKA catalogue for the Golf 2004–2005
//   l(number, what, qty, extra)                       from a parts listing, not checked in the catalogue
// extra = { alt: [other numbers the catalogue gives for the same item: another build date, maker or variant], note: '…' }.
// The first number of a row is the one for a BKD with the 6-speed manual gearbox GRF / HDV where the catalogue says so;
// otherwise it is simply the first one listed. Quantities the catalogue gives as "X" (as required) are written as 1.
// NONE lists parts that have no number of their own, with the reason. A part in neither list is still to be looked up:
// `npm run check` counts them and `npm run numbers` writes the whole list to PART-NUMBERS.md.
const e = (n, what, qty, etka, item, extra) => ({ n, what, qty, src: 'etka', etka, item: item == null ? '' : String(item), ...extra });
const l = (n, what, qty, extra) => ({ n, what, qty, src: 'listing', ...extra });

export const NUMBERS = {
  // ───────── cylinder block and crank drive: 103-020, 105-030, 107-000 ─────────
  block: [e('038 103 011 BL', 'Crankcase housing', 1, '103-020', 1, { alt: ['038 103 011 BC'], note: 'BC up to chassis numbers 1K-4B057000 / 4P051000 / 4W102000; catalogue adds "no replacement part" for AZV / BKD' })],
  blockDowels: [
    e('022 103 139', 'Dowel sleeve 16 × 13.5', 2, '103-020', 10),
    e('028 103 039 A', 'Dowel sleeve 14.15 × 21', 2, '103-020', 4, { note: 'Which of the two sizes locates the head is not stated in the list' }),
  ],
  oilJets: [e('038 103 157 B', 'Oil spray jet', 4, '103-020', 6)],
  frontFlange: [
    e('038 103 153 D', 'Sealing flange', 1, '103-020', 12),
    e('038 103 085 E', 'Shaft oil seal 35 × 48 × 10', 1, '103-020', 11),
  ],
  sealingFlange: [e('038 103 171 S', 'Sealing flange with sealing ring and trigger wheel', 1, '103-020', 16)],
  sump: [e('038 103 603 AG', 'Engine oil sump with opening for the oil level sensor', 1, '103-020', 19, { alt: ['038 103 601 AK'], note: '601 AK is the sump without the sensor opening' })],
  crankshaft: [e('038 105 021 AA', 'Crankshaft', 1, '105-030', 1, { alt: ['038 105 021 AB', '038 105 021 R'] })],
  crankPulley: [
    e('03G 105 243', 'Vibration damper', 1, '105-030', 4),
    e('045 105 229', '12-point bolt M16 × 1.5 × 59, toothed belt pulley', 1, '105-030', 3),
  ],
  flywheel: [e('03G 105 266 AF', 'Dual-mass flywheel, 240 mm LuK', 1, '105-030', 7, { alt: ['03G 105 266 BN', '03G 105 266 AD'], note: 'BN and AD are the Sachs versions' })],
  conrods: [e('038 105 401 J', 'Connecting rod', 4, '105-030', 14)],
  rodBolts: [e('045 105 425', 'Connecting rod bolt M8 × 1 × 44', 8, '105-030', 15)],
  thrustWashers: [e('026 198 421', 'Set of thrust washers', 1, '105-030', 17)],
  mainBearings: [
    e('038 105 561 A', 'Crankshaft bearing shell', 5, '105-030', 18, { alt: ['038 105 561 AM'] }),
    e('038 105 591 A', 'Crankshaft bearing shell, other half', 5, '105-030', 18, { alt: ['038 105 591 AM'] }),
  ],
  rodBearings: [
    e('038 105 701 B', 'Connecting rod bearing shell', 4, '105-030', 19),
    e('038 105 701 A', 'Connecting rod bearing shell, other half', 4, '105-030', 19),
  ],
  pistons: [e('03G 107 065 J', 'Piston complete (Alcan), from 16.03.2004', 4, '107-000', 1, { alt: ['03G 107 065 E', '03G 107 065 C', '03G 107 065'], note: 'E from chassis 1K-5-000001, C is the Mahle piston, no suffix up to 15.03.2004' })],
  pistonRings: [e('03G 198 151', 'Set of piston rings, 81 mm', 4, '107-000', 4)],

  // ───────── cylinder head and valve gear: 103-065, 109-025, 109-075 ─────────
  head: [e('03G 103 351 B', 'Cylinder head, from 16.03.2004', 1, '103-065', 1, { alt: ['03G 103 351 E', '03G 103 264 FX'], note: 'E up to 15.03.2004 with manual gearbox; 264 FX is the head with valves and camshafts' })],
  headGasket: [e('03G 103 383', 'Cylinder head gasket (metal), 1.55 mm', 1, '103-065', 12, { alt: ['03G 103 383 A', '03G 103 383 B'], note: 'A = 1.63 mm, B = 1.71 mm, chosen by piston projection' })],
  headBolts: [e('03G 103 384', 'Socket head bolt M12 × 149', 10, '103-065', 13)],
  valveCover: [
    e('03G 103 469 R', 'Cylinder head cover', 1, '103-065', 20, { alt: ['03G 103 469 N', '03G 103 469'] }),
    e('03G 128 773 B', 'Collared bolt M6 with guide sleeve', 11, '103-065', 23),
    e('038 103 493 AC', 'Breather line', 1, '103-065', 27),
  ],
  coverGasket: [e('03G 103 483', 'Seal, cylinder head cover', 1, '103-065', 22)],
  camSeals: [e('038 103 085 C', 'Shaft oil seal 47 × 10 × 32', 2, '103-065', 10)],
  camIn: [e('03G 109 101 A', 'Camshaft', 1, '109-025', 1, { alt: ['03G 109 101'], note: 'The catalogue calls items 1 and 2 only "camshaft"; taking item 1 as the inlet shaft is an assumption' })],
  camEx: [e('03G 109 102 B', 'Camshaft', 1, '109-025', 2, { alt: ['03G 109 102 A'], note: 'See the inlet camshaft: which item is which is an assumption' })],
  camBearings: [
    e('03G 103 651', 'Camshaft bearing shell', 10, '109-025', 3),
    e('03G 103 652', 'Camshaft bearing shell', 5, '109-025', 4),
    e('03G 103 652 A', 'Camshaft bearing shell', 5, '109-025', 5),
  ],
  rockers: [
    e('03G 109 411 B', 'Roller rocker arm', 4, '109-025', 13),
    e('03G 109 411 C', 'Roller rocker arm', 4, '109-025', 14),
    e('03G 109 412 B', 'Roller rocker arm', 4, '109-025', 17),
    e('03G 109 412 C', 'Roller rocker arm', 4, '109-025', 18),
    e('03G 109 365', 'Rocker axle', 1, '109-025', 12),
    e('03G 109 366 A', 'Rocker axle', 1, '109-025', 15),
  ],
  valves: [
    e('03G 109 601 B', 'Inlet valve 87.8 mm', 8, '109-025', 22, { alt: ['03G 109 601 A'], note: 'A (88.5 mm) up to chassis 1K-4-900000' }),
    e('03G 109 611 D', 'Exhaust valve 87.5 mm', 8, '109-025', 23, { alt: ['03G 109 611 B'], note: 'B (88 mm) up to chassis 1K-4-900000' }),
    e('03G 109 623', 'Valve spring', 16, '109-025', 24),
    e('058 109 641', 'Spring disc', 16, '109-025', 25),
    e('036 109 651 A', 'Split cotter', 32, '109-025', 26),
  ],
  valveSeals: [e('036 109 675 A', 'Valve stem seal 6 mm', 16, '109-025', 27)],
  timingBelt: [
    e('03G 109 119', 'Toothed belt, 141 teeth', 1, '109-075', 11),
    e('03G 109 243', 'Tensioning roller', 1, '109-075', 13),
    e('038 109 244 J', 'Idler pulley', 1, '109-075', 16),
    e('03G 109 244', 'Idler pulley on the alternator bracket', 1, '109-075', 20, { alt: ['03G 109 244 A'] }),
    e('038 109 111 E', 'Toothed belt pulley, camshaft', 2, '109-025', 6),
    e('03G 109 239 B', 'Camshaft hub', 1, '109-025', 7),
    e('03G 109 240', 'Camshaft hub', 1, '109-025', 8),
    e('038 105 263 F', 'Toothed belt pulley, crankshaft', 1, '105-030', 2),
  ],
  beltGuard: [
    e('03G 109 107 C', 'Toothed belt guard', 1, '109-075', 1, { alt: ['03G 109 107'] }),
    e('03G 109 145 A', 'Cover', 1, '109-075', 3),
    e('045 109 147 A', 'Toothed belt guard', 1, '109-075', 6),
    e('038 109 175', 'Toothed belt guard', 1, '109-075', 8),
    e('026 109 150 A', 'Spring clip', 3, '109-075', 2),
  ],

  // ───────── unit injectors and fuel: 130-035, 145-005, 127-020 ─────────
  injectors: [e('03G 130 073 G', 'Pump injector unit', 4, '130-035', 1, { alt: ['03G 130 073 B'], note: 'B up to chassis 1K-4B070759 / 4P060890; G after' })],
  injSeals: [e('03G 198 051 A', 'Gasket set for one pump injector', 4, '130-035', 2)],
  injClamp: [e('WHT 003 179', 'Socket head bolt M6 × 88, two per injector', 8, '130-035', 3, { note: 'The BKD page lists no clamping piece; the tensioning plate 038 130 069 B is on the page for the 8-valve engines (130-030)' })],
  injRockers: [
    e('03G 109 527 B', 'Rocker arm shaft with rocker arms', 1, '109-025', 28, { alt: ['03G 109 527 A'] }),
    e('038 109 451 B', 'Adjusting screw with ball head M12 × 1.25 × 26.75', 4, '130-035', 4, { alt: ['WHT 000 530'] }),
    e('038 130 335 A', 'Ball pin', 4, '130-035', 5, { alt: ['WHT 002 791'] }),
  ],
  tandemPump: [
    e('03G 145 209 C', 'Fuel and vacuum pump', 1, '145-005', 1, { alt: ['03G 145 209'] }),
    e('03G 145 215 A', 'Seal', 1, '145-005', 2, { alt: ['03G 145 215'] }),
  ],
  fuelFilter: [
    e('1K0 127 400 B', 'Fuel filter with flange', 1, '127-020', 1, { alt: ['1K0 127 400 K', '1K0 127 400 J', '1K0 127 400 C'] }),
    e('1K0 127 434 A', 'Filter element with gasket', 1, '127-020', 2, { alt: ['1K0 127 434 B'], note: 'B only for filter 1K0 127 400 K' }),
    e('1K0 127 811 D', 'Retainer for the fuel filter', 1, '127-020', 5),
  ],

  // ───────── lubrication: 115-020, 115-070 ─────────
  oilPump: [
    e('03G 115 105', 'Oil pump', 1, '115-020', 1),
    e('038 115 230 A', 'Drive chain', 1, '115-020', 9),
    e('038 115 121 A', 'Chain sprocket, 23 teeth', 1, '115-020', 7),
    e('038 115 130', 'Chain tensioner', 1, '115-020', 10),
    e('038 115 251 B', 'Suction line', 1, '115-020', 3),
  ],
  dipstick: [
    e('03G 115 611', 'Oil dipstick', 1, '115-020', 17),
    e('03G 103 634 S', 'Tube for the oil dipstick', 1, '115-020', 14, { alt: ['03G 103 634 A', '03G 103 634 AE', '03G 103 634 C'], note: 'A up to engine number BKD 120000' }),
  ],
  oilFilter: [
    e('045 115 389 J', 'Oil filter with flange', 1, '115-070', 1, { alt: ['045 115 389 E', '045 115 389 C'] }),
    e('045 115 433 D', 'Cover', 1, '115-070', 2, { alt: ['045 115 433 A'] }),
    e('071 115 562 C', 'Filter element with gasket', 1, '115-070', 4),
    e('038 117 021 D', 'Oil cooler', 1, '115-070', 12, { alt: ['038 117 021 B'] }),
    e('038 919 081 K', 'Oil pressure switch 0.55–0.85 bar, M10 × 1', 1, '919-040', 8, { alt: ['038 919 081 C'] }),
  ],

  // ───────── cooling: 121-010, 121-045, 121-080, 121-090 ─────────
  coolantPump: [
    e('038 121 011 K', 'Coolant pump with sealing ring', 1, '121-010', 1, { alt: ['038 121 011 H'] }),
    e('038 121 119', 'Seal ring 57 × 4', 1, '121-010', 2),
  ],
  thermostat: [
    e('03G 121 113', 'Coolant regulator, 87–102 °C', 1, '121-010', 6),
    e('03G 121 121 B', 'Pipe union (thermostat cover)', 1, '121-010', 9, { alt: ['03G 121 121 D', '03L 121 121 A'] }),
    e('038 121 119 B', 'Seal ring 50 × 4', 1, '121-010', 7),
  ],
  g62: [
    e('06A 919 501 A', 'Coolant temperature sender, 20 mm', 1, '121-010', 10, { alt: ['06A 919 501'] }),
    e('032 121 142', 'Retaining spring', 1, '121-010', 12),
  ],
  coolantFlange: [
    e('038 121 132 G', 'Flange with sealing ring', 1, '121-080', 2),
    e('037 121 688', 'Seal ring 50 × 3.15', 1, '121-080', 5),
  ],
  radiator: [
    e('1K0 121 251 DM', 'Cooler for coolant, 648 × 454 mm', 1, '121-080', 15, { alt: ['1K0 121 251 BK', '1K0 121 251 N'], note: 'N is 648 × 444 mm' }),
    e('1K0 121 367 G', 'Bracket', 2, '121-080', 16, { alt: ['1K0 121 367 D'] }),
  ],
  expansionTank: [
    e('1K0 121 407 A', 'Coolant expansion tank', 1, '121-080', 20),
    e('3B0 121 321', 'Cap', 1, '121-080', 21),
    e('1K0 122 109 M', 'Coolant hose, expansion tank to coolant pipe', 1, '121-045', 50),
  ],
  fans: [e('1K0 121 205 G', 'Twin fan ring', 1, '121-090', 1, { alt: ['1K0 121 205 J', '1K0 121 205 AD'], note: 'The fan motors are on illustration 959-050, not read yet' })],
  hoseBottom: [
    e('1K0 122 051 FQ', 'Coolant hose with quick-release coupling, radiator to pump', 1, '121-045', 1, { alt: ['1K0 122 051 R'] }),
    e('1K0 122 291 L', 'Quick-acting coupling', 1, '121-045', 5),
  ],
  hoseTop: [e('1K0 121 156 AF', 'Coolant hose with quick-release coupling', 1, '121-045', 23, { note: 'The catalogue does not name this as the upper radiator hose; assigned by elimination' })],
  coolantPipes: [
    e('03G 121 065 H', 'Coolant pipe', 1, '121-045', 10),
    e('06B 121 687', 'Seal ring 20.5 × 5.5', 1, '121-045', 11),
    e('1K0 121 058 C', 'Coolant hose, oil cooler to water pipe', 1, '121-045', 15),
    e('1K0 121 096 C', 'Coolant hose, oil cooler to cylinder block', 1, '121-045', 16),
  ],
  heaterHoses: [
    e('1K0 121 157 BJ', 'Coolant hose, exhaust gas cooler to flange', 1, '121-045', 44),
    e('1K0 121 157 BM', 'Coolant hose', 1, '121-045', 45),
    e('1K0 121 073 P', 'Coolant hose, heat exchanger to coolant pipe', 1, '121-045', 42),
    e('3B0 122 291 B', 'Quick-acting coupling', 1, '121-045', 43),
    e('1K0 122 291 H', 'Quick-acting coupling', 1, '121-045', 46),
  ],
  ventLines: [
    e('1K0 121 070 F', 'Coolant pipe (vent pipe)', 1, '121-045', 38),
    e('1K0 121 447 AH', 'Coolant hose', 1, '121-045', 24),
    e('1K0 122 447 CC', 'Coolant hose', 1, '121-045', 25),
    e('1K0 121 087 B', 'Distributor 8 × 8 × 8, 60°', 1, '121-045', 26),
    e('1K0 122 447 T', 'Coolant hose, breather pipe to coolant pipe', 1, '121-045', 48),
    e('1K0 121 447 S', 'Coolant hose, reservoir to breather tube', 1, '121-045', 49),
  ],

  // ───────── air path: 129-050, 145-085, 131-080 ─────────
  airbox: [
    e('1K0 129 607 S', 'Air filter', 1, '129-050', 1, { alt: ['3C0 129 607 AQ', '3C0 129 607 AB'], note: 'Three housings are listed without saying which engine takes which' }),
    e('1K0 129 620 D', 'Air filter element', 1, '129-050', 2, { alt: ['1K0 129 620 G', '3C0 129 620 B'] }),
    e('1K0 129 618 AF', 'Air guide', 1, '129-050', 18, { alt: ['1K0 129 618 BQ', '1K0 129 618 AT'] }),
  ],
  maf: [
    e('074 906 461 B', 'Air mass meter', 1, '129-050', 4),
    e('357 129 625 A', 'O-ring 79 × 6', 1, '129-050', 3, { alt: ['357 129 625'] }),
  ],
  intakePipe: [
    e('1K0 129 654 AJ', 'Air hose', 1, '129-050', 9, { alt: ['1K0 129 654 K'] }),
    e('1K0 129 684 L', 'Connecting pipe', 1, '129-050', 6),
    e('1K0 129 627 B', 'Intake hose', 1, '129-050', 11, { alt: ['1J0 129 627 D'] }),
    e('1K0 145 790 C', 'Pressure hose before the turbocharger', 1, '145-085', 13, { alt: ['1T0 145 790 E', '1T0 145 790 D'] }),
  ],
  intakeManifold: [
    e('03G 129 713', 'Intake connection (the catalogue name of the intake manifold)', 1, '129-050', 15),
    e('03G 129 717 B', 'Seal', 1, '129-050', 16, { alt: ['03G 129 717', '03G 129 717 D'] }),
  ],
  intakeFlap: [e('038 128 063 L', 'Throttle valve control element', 1, '131-080', 3, { alt: ['038 128 063 G'] })],
  intercooler: [e('1K0 145 803 A', 'Charge air cooler', 1, '145-085', 1, { alt: ['1K0 145 803 S'] })],
  boostPipe: [
    e('1K0 145 762 CL', 'Pressure pipe', 1, '145-085', 11, { alt: ['1K0 145 762 Q'] }),
    e('1K0 145 834 G', 'Pressure hose', 1, '145-085', 4, { alt: ['1K0 145 834 L'] }),
    e('1J0 145 769 G', 'Retaining clip SCA52', 2, '145-085', 5, { alt: ['1J0 145 769 H'] }),
    e('1K0 145 263 C', 'Bracket, charge air tube', 1, '145-085'),
    e('1J0 145 117 L', 'Seal ring 58.05 mm', 1, '145-085', 3, { alt: ['3C0 145 117 F'], note: '3C0 145 117 F is 57.85 mm' }),
  ],
  chargePipe: [
    e('1K0 145 770 AF', 'Air pipe', 1, '145-085', 6, { alt: ['1K0 145 770 D'] }),
    e('1K0 145 838 D', 'Pressure hose', 1, '145-085', 7),
    e('1K0 145 832 E', 'Connecting pipe', 1, '145-085', 9, { alt: ['1K0 145 832 C'], note: 'Which hoses belong to the hot and which to the cold side is my reading of the item order, not stated in the list' }),
  ],
  g31: [e('038 906 051 C', 'Pressure sensor, intake manifold', 1, '145-085', 18)],

  // ───────── turbocharger, exhaust and EGR: 145-055, 253-065, 131-080 ─────────
  turbo: [e('03G 253 010 J', 'Exhaust manifold with turbocharger', 1, '145-055', '1B', { alt: ['03G 253 014 H'] })],
  turbineHousing: [
    e('03G 253 039', 'Seal, exhaust manifold to cylinder head', 1, '145-055', 28, { alt: ['03L 253 039 B'] }),
    e('038 145 535 K', 'Support, turbocharger to cylinder block', 1, '145-055', 22),
    e('03G 129 969 G', 'Heat shield, exhaust gas turbocharger', 1, '145-055', 30),
    e('038 145 859 F', 'Bracket, exhaust manifold', 1, '145-055', 24),
  ],
  turboOilFeed: [
    e('038 145 771 AG', 'Oil pipe', 1, '145-055', 9),
    e('028 145 786', 'Threaded union with seal, M10 × 1 / M14 × 1.5', 1, '145-055', '4A'),
  ],
  turboOilReturn: [
    e('038 145 736 C', 'Oil return line', 1, '145-055', '5C'),
    e('028 145 757', 'Seal', 1, '145-055', 19),
  ],
  catalyst: [
    e('1K0 254 502 CX', 'Exhaust pipe with catalyst', 1, '253-065', 1, { alt: ['1K0 254 504 BX', '1K0 254 502 SX'] }),
    e('1K0 253 144 AD', 'Bracket', 1, '253-065', 4),
    e('1K0 253 047 K', 'Support', 1, '253-065', 6, { alt: ['1K0 253 047 Q'] }),
  ],
  catClamp: [e('1K0 253 725', 'Clamp', 1, '253-065', 2)],
  catSeal: [e('1K0 253 115 T', 'Seal', 1, '253-065', 3, { alt: ['7H0 253 115 B'] })],
  egrValve: [e('038 131 501 AN', 'Exhaust recirculation valve', 1, '131-080', 1, { alt: ['038 131 501 AF', '038 131 501 S'] })],
  egrCooler: [e('03G 131 513', 'Cooler for exhaust gas recirculation, manual gearbox', 1, '131-080', 13, { alt: ['03G 131 513 D', '03G 131 513 J', '03G 131 512 L'], note: 'D up to chassis 1K-4-140000; 512 L is the cooler with control flap' })],
  egrPipe: [
    e('03G 131 521 A', 'Connecting pipe', 1, '131-080', 9),
    e('03G 131 521', 'Connecting pipe', 1, '131-080', 18, { alt: ['03G 131 521 T'] }),
    e('069 131 547 D', 'Seal 32 mm', 3, '131-080', 6),
  ],
  vacReservoir: [e('7M0 129 808', 'Vacuum reservoir (the catalogue calls it "damper")', 1, '131-080', 29, { note: 'Identified by its number group 129 808, not by the catalogue name' })],
  vacuumLines: [
    e('03G 131 051 AF', 'Vacuum hoses with connection', 1, '131-080', 27, { alt: ['03G 131 051 BK', '03G 131 051 CF', '03G 131 051 GD', '03G 131 051 ED', '03G 131 051 BR'] }),
    e('1K0 612 041 BC', 'Vacuum pipe with non-return valve, to the brake servo', 1, '611-070', 6, { alt: ['1K0 612 041 DC', '1K0 612 041 FL'] }),
  ],
  valveBlock: [
    e('6Q0 906 625 E', 'Solenoid valve block', 1, '906-030', 18, { alt: ['6Q0 906 625'] }),
    e('1K0 906 279 B', 'Bracket', 1, '906-030', 17),
  ],

  // ───────── senders: 906-030 ─────────
  g28: [e('045 906 433 A', 'Impulse sender, crankshaft', 1, '906-030', 8, { alt: ['036 906 433 E'], note: 'Both listed from chassis 1K-5W009723; the sealing flange page names 036 906 433 A for earlier cars' })],
  g40: [e('03G 957 147 C', 'Impulse sender, camshaft, 345 mm', 1, '906-030', 8, { alt: ['03G 957 147 A'], note: 'A up to chassis 1K-4-098000' })],

  // ───────── ancillaries: 260-020, 260-042, 903-060 ─────────
  acCompressor: [e('1K0 820 803 S', 'A/C compressor, diesel engine', 1, '260-020', 1, { alt: ['1K0 820 803 G', '1K0 820 859 F'] })],
  condenser: [e('1K0 820 411 AC', 'A/C condenser with dryer (Modine)', 1, '260-042', 1)],
  auxBelt: [
    e('03G 903 137 B', 'Poly-V belt 21.18 × 1050 mm, with air conditioning', 1, '903-060', 6, { alt: ['03G 903 137 A'], note: 'A (950 mm) is for cars without air conditioning' }),
    e('03G 903 315 A', 'Tensioner', 1, '903-060', 7),
    e('03G 903 139 F', 'Bracket for alternator and refrigerant compressor', 1, '903-060', 1, { alt: ['03G 903 139 A'] }),
  ],
  alternator: [l('06F 903 023 F', 'Alternator 14 V 140 A', 1)],
  starter: [l('02Z 911 023 F', 'Starter', 1)],

  // ───────── clutch and its hydraulics: 141-060, 721-025 ─────────
  clutchDisc: [e('022 141 015 S', 'Clutch plate and pressure plate, 240 mm LuK (one set)', 1, '141-060', 1, { alt: ['03G 141 015 L'], note: '03G 141 015 L is the Sachs set' })],
  pressurePlate: [e('022 141 015 S', 'Supplied in one set with the clutch plate', 1, '141-060', 1, { alt: ['03G 141 015 L'] })],
  csc: [e('0A5 141 671', 'Release bearing with hydraulic operation', 1, '141-060', 3, { alt: ['0A5 141 671 R'] })],
  cscLine: [
    e('1J0 721 468 C', 'Breather assembly', 1, '721-025', 20, { alt: ['1J0 721 468 B'] }),
    e('02F 141 143 A', 'Seal ring 9.25 × 6.07 × 1.78', 1, '141-060', 4),
    e('1K0 721 491 A', 'Clip', 1, '721-025', 21, { alt: ['1J0 721 491'] }),
  ],
  clutchPipe: [
    e('1K2 721 465 AQ', 'Pipe / hose line', 1, '721-025', 30, { alt: ['1K2 721 465 AD', '1K2 721 465 G'] }),
    e('1K2 721 465 AE', 'Pipe / hose line', 1, '721-025', 31, { alt: ['1K2 721 465 H'], note: 'Rows for equipment code 0EN, the one the catalogue pairs with the BKD selector cables' }),
  ],
  clutchMaster: [
    e('1K0 721 388 F', 'Master cylinder', 1, '721-025', 17, { alt: ['1K0 721 388 L', '1K0 721 388 S'] }),
    e('1K0 927 810 D', 'Hall sensor (clutch position)', 1, '721-025', 18, { alt: ['1K0 927 810 B', '1K0 927 810 A', '1K0 927 810'] }),
  ],
  clutchPedal: [
    e('1K2 721 318 B', 'Clutch pedal', 1, '721-025', 10, { alt: ['1K2 721 318 D'] }),
    e('1K2 721 174 A', 'Clutch pedal pad', 1, '721-025', 11),
    e('1K0 721 403', 'Over-centre spring', 1, '721-025', 13, { alt: ['1J2 721 403 A', '1J2 721 403 B'], note: 'Depends on the equipment code (0EN / 0EJ / 0EM)' }),
    e('1K0 721 373 H', 'Bracket', 1, '721-025', 2, { alt: ['1K0 721 373 F', '1K0 721 373 E'] }),
  ],

  // ───────── gearbox 02Q (GRF / HDV): 301-045, 311-042, 311-043, 311-044, 311-092, 409-030 ─────────
  gearbox: [e('02Q 301 107 J', 'Clutch housing', 1, '301-045', 1, { alt: ['02Q 301 107'] })],
  gearboxHousing: [e('02Q 301 103 L', 'Gear housing', 1, '301-045', 20)],
  gearboxCover: [
    e('02M 301 211 B', 'End cap 79.35', 1, '301-045', 27),
    e('02Q 301 211', 'End cap 45', 1, '301-045', 23),
  ],
  inputSeal: [e('02M 311 113 A', 'Shaft oil seal 28.3 × 42.28 × 7', 1, '301-045', 7, { alt: ['02M 311 113'] })],
  driveSeals: [
    e('02Q 409 189', 'Radial shaft seal 54 × 73 × 8 (gearbox GRF)', 1, '301-045', 3),
    e('02M 301 189 B', 'Seal ring 60 × 74.3 × 8', 1, '301-045', 30),
  ],
  reverseSwitch: [
    e('02T 945 415 P', 'Switch for reversing light', 1, '927-040', 4, { alt: ['02T 945 415 D', '02T 945 415'] }),
    e('020 301 244', 'Seal ring 12 × 21 × 1.5', 1, '927-040', 5),
  ],
  inputShaft: [e('02M 311 101 AE', 'Input shaft', 1, '311-042', 2)],
  inputRollerSleeve: [e('02T 311 373 G', 'Roller sleeve 55 × 32 × 18', 1, '311-042', 1, { alt: ['02T 311 373 D'] })],
  inputBallBearing: [
    e('02M 311 235 A', 'Grooved ball bearing 30 × 72 × 22', 1, '311-042', 3),
    e('0A5 311 183', 'Securing ring 69.4 × 2', 1, '311-042', 4),
    e('02M 398 008', 'Set of circlips 1.79–1.98', 1, '311-042', 5),
  ],
  reverseIdler: [
    e('02M 311 509 R', 'Reverse gear idler spindle, 36 + 14 teeth', 1, '311-042', 10, { alt: ['02M 311 509 K'] }),
    e('02M 311 517', 'Thrust washer 25.1 × 45 × 3.5', 2, '311-042', 11),
    e('02M 311 523 A', 'Needle bush', 2, '311-042', 12),
  ],
  outShaft1: [e('02M 311 205 G', 'Output shaft, 20 teeth', 1, '311-043', 1)],
  out1BearingA: [
    e('02M 311 220', 'Taper roller bearing 40 × 80 × 21', 1, '311-043', 2),
    e('02M 301 308 A', 'Oil thrower', 1, '311-043', '2A'),
    e('02M 311 456', 'Cup washer 14 × 27.15', 1, '311-043', '1A', { alt: ['WHT 002 057'] }),
  ],
  gear2: [e('02M 311 261 H', 'Change gear 48 / 23', 1, '311-043', 4)],
  gear1: [e('02M 311 251 K', 'Change gear 49 / 13', 1, '311-043', 13)],
  gear4: [e('02M 311 145 P', 'Change gear, 42 teeth', 1, '311-043', 17)],
  gear3: [e('02M 311 129 J', 'Change gear 45 / 34', 1, '311-043', 27)],
  synchro12: [
    e('02M 311 239 D', 'Synchronizing hub with locking collar', 1, '311-043', 8, { alt: ['02M 311 239 C'] }),
    e('02M 311 247 A', 'Synchronizer ring', 2, '311-043', 7),
    e('02F 311 279', 'Outer ring', 2, '311-043', 6),
    e('02M 311 277 A', 'Synchronizer ring, inner', 2, '311-043', 5),
    e('0A5 311 313 D', 'Locking piece', 3, '311-043', 9, { alt: ['0A5 311 313 C', '0A5 311 313 B'] }),
    e('0A5 311 249', 'Spring 1.6', 2, '311-043', 10),
    e('008 311 231', 'Securing ring', 1, '311-043', 11),
  ],
  synchro34: [
    e('02M 311 301 E', 'Synchronizing hub with locking collar', 1, '311-043', 19, { alt: ['02M 311 301 D'] }),
    e('02M 311 269 H', 'Synchronizer ring, 4th gear', 1, '311-043', 18, { alt: ['02M 311 269 E'] }),
    e('02M 311 269 D', 'Synchronizer ring, 3rd gear', 1, '311-043', 23),
    e('02Q 311 279', 'Outer ring, 3rd gear', 1, '311-043', 24, { alt: ['02M 311 279'] }),
    e('02M 311 277', 'Synchronizer ring, inner, 3rd gear', 1, '311-043', 25),
    e('0A5 311 313 D', 'Locking piece', 3, '311-043', 20, { alt: ['0A5 311 313 C', '0A5 311 313 B'] }),
    e('0A5 311 311', 'Spring', 2, '311-043', 21),
    e('02F 311 187', 'Securing ring', 1, '311-043', 22),
  ],
  needles1: [
    e('02F 311 265', 'Needle bearing 42 × 48 × 26.8', 3, '311-043', 3),
    e('02F 311 115', 'Needle bearing 38 × 44 × 26.8', 1, '311-043', 26),
  ],
  out1Washers: [
    e('02M 311 175 B', 'Thrust washer', 1, '311-043', 14),
    e('02M 311 919 A', 'Retaining ring 56 × 60 × 3', 1, '311-043', 15),
    e('02M 398 008', 'Set of circlips 1.79–1.98', 1, '311-043', 29),
    e('084 498 383 A', 'Set of shims 0.7–2.4', 1, '311-043', 30),
  ],
  out1BearingB: [e('02M 311 123', 'Taper roller bearing 30 × 62 × 17', 1, '311-043', 28)],
  outShaft2: [e('02M 311 208 G', 'Output shaft, 25 teeth', 1, '311-044', 1)],
  out2BearingA: [
    e('02M 311 214', 'Taper roller bearing 38 × 65 × 19.8', 1, '311-044', 2),
    e('02K 409 210', 'Adjusting washer 0.65', 1, '311-044', '2A'),
  ],
  synchroR: [
    e('02M 311 759 B', 'Synchronizing hub with locking collar', 1, '311-044', 3),
    e('008 311 231', 'Securing ring', 1, '311-044', 4),
  ],
  gearR: [e('02M 311 215 A', 'Change gear 23 / 14', 1, '311-044', 6)],
  out2Spacer: [
    e('02M 311 470 A', 'Spacer sleeve', 1, '311-044', 7),
    e('02M 311 183', 'Securing ring 37.2 × 43.6 × 2.5', 1, '311-044', 8),
  ],
  gear6: [e('02M 311 349 J', 'Change gear 35 / 43', 1, '311-044', 10)],
  gear5: [e('02M 311 159 AA', 'Change gear 39 / 40', 1, '311-044', 18)],
  synchro56: [
    e('02M 311 241 C', 'Synchronizing hub with locking collar', 1, '311-044', 12),
    e('02M 311 295 E', 'Synchronizer ring', 2, '311-044', 11, { alt: ['02M 311 295 C', '02M 311 295 A'] }),
    e('0A5 311 313 D', 'Locking piece', 3, '311-044', 13, { alt: ['0A5 311 313 C', '0A5 311 313 B'] }),
    e('02M 311 336', 'Spring', 2, '311-044', 14),
    e('02M 311 317', 'Securing ring 34.2 × 40.6 × 2.5', 1, '311-044', 15),
  ],
  needles2: [
    e('02M 311 432', 'Needle bearing 43 × 51 × 30.8', 1, '311-044', 5),
    e('02M 311 116', 'Needle bearing 40 × 46 × 26.8', 1, '311-044', 9),
    e('02M 311 151', 'Needle bearing 37 × 43 × 46.8', 1, '311-044', 17),
  ],
  out2BearingB: [
    e('02M 311 123', 'Taper roller bearing 30 × 62 × 17', 1, '311-044', 19),
    e('084 498 383 A', 'Set of shims 0.7–2.4', 1, '311-044', 21),
  ],
  shiftTower: [
    e('02Q 301 230 B', 'Switch unit', 1, '311-092', 1),
    e('02A 301 227 M', 'Shaft oil seal 24.3 × 6.4', 1, '311-092', 3),
    e('014 301 485', 'Cap for venting the gearbox', 1, '311-092', 4),
  ],
  shiftDetent: [
    e('02M 301 241 A', 'Locking screw M27 × 1.5', 1, '311-092', 11, { alt: ['02M 301 241 D'] }),
    e('02T 301 234 F', 'Retaining sleeve', 1, '311-092', 10),
    e('02J 301 358 C', 'Detent pin', 1, '311-092', 12),
  ],
  shiftForks: [
    e('02M 311 559 L', 'Selector shaft with selector fork', 1, '311-092', 13),
    e('02M 311 549 M', 'Selector shaft with selector fork', 1, '311-092', 14),
    e('02M 311 570 C', 'Selector fork', 1, '311-092', 15, { alt: ['02M 311 570 D', '02M 311 570 E'] }),
    e('02M 311 577 A', 'Selector shaft', 1, '311-092', 16),
    e('02M 311 562 N', 'Selector shaft with selector fork', 1, '311-092', 17),
  ],
  shiftCables: [
    e('1K0 711 265 AS', 'Gear selector cable', 1, '711-030', 41, { alt: ['1K0 711 265 AA', '1K0 711 265'] }),
    e('1K0 711 266', 'Selector cable', 1, '711-030', 40),
    e('1K0 711 789 J', 'Abutment (cable support)', 1, '711-030', 42, { alt: ['1K0 711 789'] }),
  ],
  diffCage: [e('02Q 409 021 D', 'Differential 69 / 20 / 25 (gearbox GRF)', 1, '409-030', 1, { alt: ['02Q 409 021 G', '02Q 409 021 R'], note: 'G and R are for gearbox HDV' })],
  diffGears: [
    e('02Q 498 081 B', 'Set of differential pinions', 1, '409-030', 3, { alt: ['02Q 498 081'] }),
    e('02M 409 374 A', 'Tapered ring', 2, '409-030', 12),
    e('02M 409 378 A', 'Thrust washer 32 × 47', 2, '409-030', 13),
  ],
  diffBearings: [
    e('02M 517 185', 'Taper roller bearing 48 × 76 × 18', 1, '409-030', 2, { alt: ['02M 517 185 A'] }),
    e('002 517 185 A', 'Taper roller bearing 46 × 75 × 18', 1, '409-030', 5, { alt: ['002 517 185 M'] }),
    e('02B 498 210', 'Set of shims 0.65–1.25', 1, '409-030', 7),
  ],
  flangeShaftL: [
    e('02M 409 343 D', 'Flanged shaft', 1, '409-030', 10),
    e('084 409 379', 'Pressure spring', 2, '409-030', 14),
    e('02J 409 359', 'Socket head bolt M8 × 83.2', 2, '409-030', 30, { note: 'Taking item 10 as the left shaft is an assumption: the list does not say which side' }),
  ],
  flangeShaftR: [e('02Q 409 345', 'Stub shaft (gearbox GRF)', 1, '409-030', 20, { alt: ['02Q 409 344 B', '02Q 409 344'], note: '409 344 is the flanged shaft for gearbox GVT / HDV' })],
};

const IN_TURBO = 'inside the turbocharger, which the catalogue lists only complete with the exhaust manifold (03G 253 010 J)';
const IN_INJECTOR = 'inside the unit injector, which the catalogue lists only complete (03G 130 073 G)';
const IN_HEAD = 'pressed into the cylinder head and not listed on its own (head 03G 103 351 B)';
export const NONE = {
  exhaustManifold: 'one casting with the turbine housing: the catalogue lists it as "exhaust manifold with turbocharger" 03G 253 010 J',
  vntVanes: IN_TURBO, vntUnison: IN_TURBO, nozzleRing: IN_TURBO, turbineWheel: IN_TURBO, turboHeatShield: IN_TURBO,
  journalBearingT: IN_TURBO, journalBearingC: IN_TURBO, bearingCirclips: IN_TURBO, thrustCollar: IN_TURBO, thrustBearing: IN_TURBO,
  pistonRingT: IN_TURBO, pistonRingC: IN_TURBO, oilDeflector: IN_TURBO, sealPlate: IN_TURBO, sealPlateScrews: IN_TURBO,
  housingOring: IN_TURBO, compressorWheel: IN_TURBO, shaftNut: IN_TURBO, compressorHousing: IN_TURBO, compressorClamps: IN_TURBO,
  turbineClamps: IN_TURBO, vntActuator: IN_TURBO, vntRod: IN_TURBO, vntCrank: IN_TURBO,
  injPlunger: IN_INJECTOR, injSolenoid: IN_INJECTOR, injNozzleSpring: IN_INJECTOR, injSpacer: IN_INJECTOR, injNozzle: IN_INJECTOR, injNozzleNut: IN_INJECTOR,
  valveSeats: IN_HEAD, valveGuides: IN_HEAD,
  bearingFrame: 'not listed on its own on the cylinder head page (103-065); it is machined together with the head',
  mainCaps: 'machined together with the cylinder block and not listed on its own',
  rodCaps: 'part of the connecting rod 038 105 401 J',
  pistonPins: 'supplied with the complete piston 03G 107 065 J',
  dmfSprings: 'inside the dual-mass flywheel 03G 105 266 AF',
  dmfSecondary: 'inside the dual-mass flywheel 03G 105 266 AF',
  diaphragmSpring: 'part of the pressure plate, set 022 141 015 S',
  clutchCover: 'part of the pressure plate, set 022 141 015 S',
  releaseBearing: 'one unit with the slave cylinder 0A5 141 671',
  ringGear: 'riveted to the differential and supplied with it (02Q 409 021 D)',
};
