// Brands and model families for the Add Watch dropdowns.
// To add a brand or model, add it here (alphabetical order is applied automatically).
// People can still type any brand/model that isn't listed.

export const watchCatalog: Record<string, string[]> = {
  "A. Lange & Söhne": ["1815", "Datograph", "Lange 1", "Odysseus", "Saxonia", "Zeitwerk"],
  "Audemars Piguet": ["Code 11.59", "Royal Oak", "Royal Oak Chronograph", "Royal Oak Jumbo", "Royal Oak Offshore"],
  Awake: ["Mission to Earth", "Mission to Space"],
  Baltic: ["Aquascaphe", "Bicompax", "HMS 002", "MR01"],
  "Bell & Ross": ["BR 03", "BR 05", "BR-X5"],
  Blancpain: ["Fifty Fathoms", "Fifty Fathoms Bathyscaphe", "Villeret"],
  Breguet: ["Classique", "Marine", "Type XX"],
  Breitling: ["Avenger", "Chronomat", "Navitimer", "Premier", "Superocean", "Superocean Heritage", "Top Time"],
  Bulgari: ["Bulgari Bulgari", "Octo Finissimo", "Serpenti"],
  Cartier: ["Ballon Bleu", "Panthère", "Pasha", "Santos", "Santos-Dumont", "Tank Française", "Tank Louis", "Tank Must"],
  "Casio G-Shock": ["DW-5600", "GA-2100", "GMW-B5000", "MR-G"],
  Chopard: ["Alpine Eagle", "Happy Sport", "L.U.C", "Mille Miglia"],
  "Christopher Ward": ["C1", "C60 Trident", "C63 Sealander", "The Twelve"],
  Citizen: ["Eco-Drive", "Promaster", "Tsuyosa"],
  Doxa: ["SUB 200", "SUB 300", "SUB 300T"],
  "Echo/Neutra": ["Averau", "Rivanera"],
  "Furlan Marri": ["Disco Volante", "Mechaquartz", "Tasti Tondi"],
  "Girard-Perregaux": ["Laureato", "Laureato Absolute"],
  "Grand Seiko": ["Evolution 9", "Heritage", "Snowflake (SBGA211)", "Sport", "White Birch (SLGH005)"],
  "H. Moser & Cie": ["Endeavour", "Pioneer", "Streamliner"],
  Hamilton: ["Jazzmaster", "Khaki Aviation", "Khaki Field", "Khaki Field Mechanical", "Ventura"],
  Hermès: ["Arceau", "H08", "Heure H"],
  Hublot: ["Big Bang", "Classic Fusion", "Spirit of Big Bang"],
  IWC: ["Big Pilot", "Ingenieur", "Pilot's Watch", "Portofino", "Portugieser", "Aquatimer"],
  "Jaeger-LeCoultre": ["Master Control", "Polaris", "Reverso", "Rendez-Vous"],
  "Konstantin Chaykin": ["Joker", "Wristmon"],
  "Kurono Tokyo": ["Bunkyo", "Chronograph", "Grand Mori", "Toki"],
  Longines: ["Conquest", "HydroConquest", "Legend Diver", "Master Collection", "Spirit", "Spirit Flyback", "Spirit Zulu Time"],
  Mido: ["Commander", "Multifort", "Ocean Star"],
  Montblanc: ["1858", "Star Legacy", "TimeWalker"],
  Nomos: ["Ahoi", "Club", "Metro", "Orion", "Tangente"],
  Omega: ["Aqua Terra", "Constellation", "De Ville", "Railmaster", "Seamaster 300M", "Seamaster Planet Ocean", "Speedmaster Moonwatch", "Speedmaster Racing"],
  Oris: ["Aquis", "Big Crown Pointer Date", "Divers Sixty-Five", "ProPilot"],
  Panerai: ["Luminor", "Luminor Due", "Radiomir", "Submersible"],
  "Patek Philippe": ["Aquanaut", "Calatrava", "Complications", "Grand Complications", "Nautilus", "Twenty~4"],
  Rado: ["Captain Cook", "Centrix", "True Square"],
  "Richard Mille": ["RM 011", "RM 035", "RM 67-01"],
  Rolex: ["Air-King", "Cosmograph Daytona", "Datejust 36", "Datejust 41", "Day-Date 40", "Explorer", "Explorer II", "GMT-Master II", "Land-Dweller", "Oyster Perpetual", "Sea-Dweller", "Sky-Dweller", "Submariner", "Submariner Date", "Yacht-Master"],
  Seiko: ["5 Sports", "Alpinist", "Presage", "Prospex", "Prospex Turtle"],
  Serica: ["4512 Field Chronometer", "5303 Diver", "8315 Chronograph"],
  Sinn: ["104", "556", "EZM 3"],
  Swatch: ["MoonSwatch", "Scuba Fifty Fathoms", "Sistem51"],
  "TAG Heuer": ["Aquaracer", "Carrera", "Formula 1", "Monaco"],
  Tissot: ["Gentleman", "PRX", "Seastar", "Visodate"],
  Tudor: ["1926", "Black Bay", "Black Bay 54", "Black Bay 58", "Black Bay 58 GMT", "Black Bay Chrono", "Black Bay GMT", "Black Bay Pro", "Pelagos", "Pelagos 39", "Ranger", "Royal"],
  "Ulysse Nardin": ["Diver", "Freak", "Marine"],
  "Vacheron Constantin": ["Fiftysix", "Historiques 222", "Overseas", "Patrimony", "Traditionnelle"],
  Zenith: ["Chronomaster Original", "Chronomaster Sport", "Defy", "Pilot"],
};

export const watchBrands: string[] = Object.keys(watchCatalog).sort((a, b) => a.localeCompare(b));

export function modelsForBrand(brand: string): string[] {
  const key = watchBrands.find((b) => b.toLowerCase() === brand.trim().toLowerCase());
  return key ? [...watchCatalog[key]].sort((a, b) => a.localeCompare(b)) : [];
}

// Returns the catalog's spelling for a typed brand, or the brand as typed.
export function canonicalBrand(brand: string): string {
  return watchBrands.find((b) => b.toLowerCase() === brand.trim().toLowerCase()) ?? brand;
}
