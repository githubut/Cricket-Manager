// Data & Content Engine for Willow & Leather Cricket Club Manager

const CRICKET_DATA = {
  DIVISIONS: [
    {
      id: 4,
      name: "Village Sunday League",
      short: "Div 4 (Village)",
      prize: 1200,
      minOvers: 5,
      clubs: [
        { id: "c1", name: "Willow Creek CC", color: "#2d6a4f", accent: "#d8f3dc", short: "WCK", rep: 35 },
        { id: "c2", name: "Bramblewood Greens", color: "#1b4332", accent: "#e9c46a", short: "BWG", rep: 32 },
        { id: "c3", name: "Millpond Rangers", color: "#3a506b", accent: "#b5e2fa", short: "MPR", rep: 30 },
        { id: "c4", name: "Oakham Village CC", color: "#6b4226", accent: "#f3c68f", short: "OAK", rep: 33 },
        { id: "c5", name: "Highfield Strollers", color: "#8b2635", accent: "#f7d6d0", short: "HFS", rep: 28 },
        { id: "c6", name: "Meadowbrook XI", color: "#2b2d42", accent: "#edf2f4", short: "MBK", rep: 34 }
      ]
    },
    {
      id: 3,
      name: "District Championship",
      short: "Div 3 (District)",
      prize: 3500,
      minOvers: 5,
      clubs: [
        { id: "c7", name: "Thames Valley Strikers", color: "#1d3557", accent: "#a8dadc", short: "TVS", rep: 48 },
        { id: "c8", name: "Cotswold Royals", color: "#4a154b", accent: "#e8c547", short: "CWR", rep: 50 },
        { id: "c9", name: "Beacon Hill CC", color: "#bc4749", accent: "#f2e8cf", short: "BHC", rep: 46 },
        { id: "c10", name: "Severn Valley Rhinos", color: "#386641", accent: "#a7c957", short: "SVR", rep: 49 },
        { id: "c11", name: "Northern Peaks XI", color: "#283618", accent: "#dda15e", short: "NPK", rep: 47 },
        { id: "c12", name: "Wessex Dragons", color: "#9e2a2b", accent: "#ffddd2", short: "WSX", rep: 52 }
      ]
    },
    {
      id: 2,
      name: "County Championship",
      short: "Div 2 (County)",
      prize: 9000,
      minOvers: 5,
      clubs: [
        { id: "c13", name: "Yorkshire Blades", color: "#003049", accent: "#669bbc", short: "YOR", rep: 68 },
        { id: "c14", name: "Surrey Lions", color: "#780000", accent: "#fdf0d5", short: "SUR", rep: 72 },
        { id: "c15", name: "Lancashire Storm", color: "#c1121f", accent: "#fdf0d5", short: "LAN", rep: 70 },
        { id: "c16", name: "Warwickshire Bears", color: "#005f73", accent: "#94d2bd", short: "WAR", rep: 66 },
        { id: "c17", name: "Hampshire Hawks", color: "#0a9396", accent: "#ee9b00", short: "HAM", rep: 69 },
        { id: "c18", name: "Nottingham Stags", color: "#2b9348", accent: "#80b918", short: "NOT", rep: 67 }
      ]
    },
    {
      id: 1,
      name: "Premier Super League",
      short: "Div 1 (Premier)",
      prize: 25000,
      minOvers: 5,
      clubs: [
        { id: "c19", name: "London Lords XI", color: "#14213d", accent: "#fca311", short: "LON", rep: 88 },
        { id: "c20", name: "Mumbai Typhoons", color: "#0077b6", accent: "#ffd166", short: "MUM", rep: 92 },
        { id: "c21", name: "Melbourne Thunder", color: "#2b9348", accent: "#55a630", short: "MEL", rep: 89 },
        { id: "c22", name: "Kolkata Knights", color: "#5a189a", accent: "#e0aaff", short: "KOL", rep: 87 },
        { id: "c23", name: "Sydney Comets", color: "#d90429", accent: "#ef233c", short: "SYD", rep: 90 },
        { id: "c24", name: "Lahore Leopards", color: "#004b23", accent: "#38b000", short: "LAH", rep: 86 }
      ]
    }
  ],

  PITCH_TYPES: {
    green: {
      name: "Green Seamer",
      desc: "Lush grass cover. Fierce seam movement and extra bounce for fast pacers.",
      paceBonus: 1.25,
      spinBonus: 0.85,
      batBonus: 0.88,
      wearRate: 0.8,
      icon: "🌱"
    },
    dusty: {
      name: "Dusty Turner",
      desc: "Dry and cracking. Generates wicked bite, grip and venomous spin.",
      paceBonus: 0.85,
      spinBonus: 1.35,
      batBonus: 0.90,
      wearRate: 1.4,
      icon: "🏜️"
    },
    flat: {
      name: "Flat Highway",
      desc: "Hard rolled batting paradise. High scores, true bounce, and fireworks.",
      paceBonus: 0.95,
      spinBonus: 0.90,
      batBonus: 1.25,
      wearRate: 1.0,
      icon: "🛣️"
    },
    bouncy: {
      name: "Hard & Bouncy",
      desc: "Stiff clay foundation. Terrific carry to keeper and rewards crisp pull shots.",
      paceBonus: 1.15,
      spinBonus: 0.95,
      batBonus: 1.05,
      wearRate: 1.1,
      icon: "⚡"
    }
  },

  GROUND_LEVELS: [
    {
      level: 1,
      name: "The Village Green",
      capacity: 220,
      ticketPrice: 6,
      upgradeCost: 1500,
      image: "assets/village_ground.jpg",
      perk: "Bake sale tea tent & white picket boundary."
    },
    {
      level: 2,
      name: "Township Oval",
      capacity: 950,
      ticketPrice: 12,
      upgradeCost: 4200,
      image: "assets/village_ground.jpg",
      perk: "Wooden stands, manual tin scoreboard, and pavilion bar."
    },
    {
      level: 3,
      name: "County Grounds",
      capacity: 4800,
      ticketPrice: 24,
      upgradeCost: 11000,
      image: "assets/village_ground.jpg",
      perk: "Covered grandstand, sight screens, and official media box."
    },
    {
      level: 4,
      name: "Metropolitan Arena",
      capacity: 18500,
      ticketPrice: 42,
      upgradeCost: 28000,
      image: "assets/lords_stadium.jpg",
      perk: "Towering floodlights, electronic replay screens & fan store."
    },
    {
      level: 5,
      name: "Lord's Colosseum",
      capacity: 46000,
      ticketPrice: 75,
      upgradeCost: 0,
      image: "assets/lords_stadium.jpg",
      perk: "World-class cathedral of cricket with champagne terrace."
    }
  ],

  FACILITIES: [
    {
      id: "nets",
      name: "Practice Nets",
      level: 1,
      maxLevel: 4,
      baseCost: 800,
      desc: "Improves player training XP and batting/bowling accuracy.",
      perk: "+10% Player skill growth per week"
    },
    {
      id: "physio",
      name: "Physiotherapy Suite",
      level: 1,
      maxLevel: 4,
      baseCost: 700,
      desc: "Helps squad fitness and faster stamina recovery between fixtures.",
      perk: "+15% Weekly stamina recovery"
    },
    {
      id: "curator",
      name: "Master Pitch Curator",
      level: 1,
      maxLevel: 3,
      baseCost: 1200,
      desc: "Grants ability to handpick pitch preparation for home matches.",
      perk: "Tailor pitch conditions to your bowling attack"
    },
    {
      id: "academy",
      name: "Youth Scouting Academy",
      level: 1,
      maxLevel: 4,
      baseCost: 1500,
      desc: "Scouts hidden village talent and teenage bowling prodigies.",
      perk: "Generates free youth prospects each season"
    }
  ],

  SPONSORS: [
    { id: "sp1", name: "Ye Olde Village Bakery", weekly: 180, divMin: 4, desc: "Fresh pies and cream tea for the team." },
    { id: "sp2", name: "County Motors & Garage", weekly: 420, divMin: 3, desc: "Reliable team minibus and travel sponsorship." },
    { id: "sp3", name: "Gunn & Willow Crafts", weekly: 950, divMin: 2, desc: "Custom Grade-1 English willow bats for squad." },
    { id: "sp4", name: "Apex Energy Drink", weekly: 2200, divMin: 1, desc: "Global energy brand with stadium LED branding." }
  ],

  NAME_BANK: {
    first: [
      "Oliver", "Jack", "Harry", "George", "William", "Albie", "James", "Freddie",
      "Rohit", "Virat", "Jasprit", "Ravindra", "Shubman", "Rishabh", "Sachin", "Sunil",
      "Mitchell", "Pat", "David", "Steve", "Glenn", "Travis", "Shane", "Ricky",
      "Ben", "Joe", "Jofra", "Jos", "Stuart", "Jimmy", "Eoin", "Graeme",
      "Babar", "Shaheen", "Wasim", "Waqar", "Imran", "Haris", "Rizwan",
      "Kane", "Trent", "Tim", "Brendon", "Ross", "Devon",
      "Kagiso", "Dale", "Quinton", "AB", "Jacques", "Faf",
      "Chris", "Brian", "Viv", "Andre", "Kieron", "Curtly", "Jason"
    ],
    last: [
      "Broad", "Anderson", "Root", "Stokes", "Buttler", "Cook", "Flintoff", "Bell",
      "Sharma", "Kohli", "Bumrah", "Jadeja", "Gill", "Pant", "Tendulkar", "Ashwin",
      "Starc", "Cummins", "Warner", "Smith", "Maxwell", "Head", "Warne", "Ponting",
      "Afridi", "Akram", "Younis", "Khan", "Rauf", "Malik",
      "Williamson", "Boult", "Southee", "McCullum", "Taylor", "Conway",
      "Rabada", "Steyn", "de Kock", "de Villiers", "Kallis", "du Plessis",
      "Gayle", "Lara", "Richards", "Russell", "Pollard", "Ambrose", "Holder",
      "Archer", "Brook", "Wood", "Woakes", "Ali", "Bairstow", "Pope"
    ]
  },

  ROLES: [
    { id: "OPEN_BAT", label: "Opening Batter", type: "BAT", desc: "Specialist in facing new ball pace & swing." },
    { id: "TOP_BAT", label: "Top-Order Batter", type: "BAT", desc: "Anchor who builds high scoring partnerships." },
    { id: "MID_BAT", label: "Middle-Order Anchor", type: "BAT", desc: "Solid against both spin and medium pace." },
    { id: "FINISHER", label: "Power Finisher", type: "BAT", desc: "Deadly boundary hitter in death overs." },
    { id: "WK_BAT", label: "Wicketkeeper Batter", type: "WK", desc: "Quick reflexes behind stumps & agile batting." },
    { id: "BAT_ALL", label: "Batting All-Rounder", type: "ALL", desc: "Top batsman who chips in with key overs." },
    { id: "BOWL_ALL", label: "Bowling All-Rounder", type: "ALL", desc: "Frontline bowler with explosive lower-order batting." },
    { id: "FAST_BOWL", label: "Fast Seamer", type: "BOWL", desc: "Speeds up to 145+ km/h with dangerous seam bounce." },
    { id: "SWING_BOWL", label: "Swing Bowler", type: "BOWL", desc: "Moves the red cherry both ways in the air." },
    { id: "SPIN_BOWL", label: "Mystery Spinner", type: "BOWL", desc: "Wrist spin, googlies & arm balls that bamboozle." }
  ],

  TRAITS: [
    "Clutch Finisher",
    "Death Yorker Specialist",
    "Powerplay Blaster",
    "Spin Magician",
    "Steep Bouncer Enforcer",
    "Rock-Solid Anchor",
    "Golden Arm",
    "Safe Hands Slip Fielder",
    "Boundary Rider Bullet Arm",
    "Speed Demon"
  ],

  // Interactive Big Chance Shots and Deliveries
  SHOTS: [
    {
      id: "cover_drive",
      name: "Cover Drive",
      type: "ground",
      idealAgainst: ["full", "outswing"],
      risk: "medium",
      reward: "high",
      runsOutcome: [4, 4, 2, 1, 0],
      desc: "Classy leaning drive through extra cover along the turf."
    },
    {
      id: "pull_shot",
      name: "Pull / Hook",
      type: "aerial",
      idealAgainst: ["short", "bouncer"],
      risk: "high",
      reward: "maximum",
      runsOutcome: [6, 6, 4, 1, "W"],
      desc: "Ferocious pivot swatting the ball into the mid-wicket stands."
    },
    {
      id: "straight_drive",
      name: "Lofted Straight Drive",
      type: "aerial",
      idealAgainst: ["full", "half_volley"],
      risk: "high",
      reward: "maximum",
      runsOutcome: [6, 6, 4, 2, "W"],
      desc: "Elevated high-elbow drive soaring straight back over the bowler."
    },
    {
      id: "flick",
      name: "Helicopter / Flick",
      type: "aerial",
      idealAgainst: ["yorker", "inswing", "straight"],
      risk: "medium",
      reward: "high",
      runsOutcome: [6, 4, 4, 2, 1],
      desc: "Wristy flick with heavy bat speed flashing over cow corner."
    },
    {
      id: "late_cut",
      name: "Late Cut / Dab",
      type: "ground",
      idealAgainst: ["wide", "spin", "outswing"],
      risk: "low",
      reward: "medium",
      runsOutcome: [4, 4, 2, 1, 1],
      desc: "Delicate touch gliding past slips down to third man."
    },
    {
      id: "block",
      name: "Forward Defensive",
      type: "defense",
      idealAgainst: ["yorker", "inswing", "good_length"],
      risk: "very_low",
      reward: "low",
      runsOutcome: [1, 0, 0, 0, 0],
      desc: "Rock-solid bat and pad together to preserve your wicket."
    }
  ],

  DELIVERIES: [
    {
      id: "yorker",
      name: "In-Dipping Yorker",
      speed: "144 km/h",
      length: "yorker",
      wicketChance: 0.42,
      dotChance: 0.38,
      boundaryRisk: 0.20,
      desc: "Toe-crusher aimed directly at the base of leg stump."
    },
    {
      id: "outswing",
      name: "Curving Outswinger",
      speed: "138 km/h",
      length: "good_length",
      wicketChance: 0.38,
      dotChance: 0.45,
      boundaryRisk: 0.17,
      desc: "Angles in, pitches on off-stump and shapes away to kiss the outside edge."
    },
    {
      id: "bouncer",
      name: "Fierce Throat Bouncer",
      speed: "142 km/h",
      length: "short",
      wicketChance: 0.35,
      dotChance: 0.35,
      boundaryRisk: 0.30,
      desc: "Digs hard into the turf rushing towards the batsman's helmet visor."
    },
    {
      id: "slower",
      name: "Knuckle Slower Ball",
      speed: "112 km/h",
      length: "full",
      wicketChance: 0.40,
      dotChance: 0.40,
      boundaryRisk: 0.20,
      desc: "Deceptive dip in the air; batsman is through the shot way too early!"
    },
    {
      id: "googly",
      name: "Sharp Turning Googly",
      speed: "88 km/h",
      length: "good_length",
      wicketChance: 0.44,
      dotChance: 0.36,
      boundaryRisk: 0.20,
      desc: "Looks like standard leg-spin but spins violently back through the gate!"
    }
  ]
};

// Player Generation Helper
function generatePlayer(options = {}) {
  const firstNames = CRICKET_DATA.NAME_BANK.first;
  const lastNames = CRICKET_DATA.NAME_BANK.last;
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  
  const role = options.role || CRICKET_DATA.ROLES[Math.floor(Math.random() * CRICKET_DATA.ROLES.length)];
  const repTier = options.tier || 4; // 4 = Village, 1 = Premier
  
  // Rating ranges based on tier
  const baseMin = 40 + (4 - repTier) * 12;
  const baseMax = 55 + (4 - repTier) * 11;
  
  const randStat = (min, max) => Math.min(99, Math.max(30, Math.floor(Math.random() * (max - min + 1)) + min));
  
  let bat = randStat(baseMin - 8, baseMax - 4);
  let timing = randStat(baseMin - 8, baseMax - 4);
  let power = randStat(baseMin - 8, baseMax - 4);
  let bowl = randStat(baseMin - 12, baseMax - 8);
  let accuracy = randStat(baseMin - 12, baseMax - 8);
  let speed = randStat(baseMin - 12, baseMax - 8);
  
  if (role.type === "BAT") {
    bat = randStat(baseMin + 5, baseMax + 6);
    timing = randStat(baseMin + 4, baseMax + 7);
    power = role.id === "FINISHER" ? randStat(baseMin + 8, baseMax + 9) : randStat(baseMin, baseMax + 4);
    bowl = randStat(30, 48);
    accuracy = randStat(30, 45);
  } else if (role.type === "BOWL") {
    bowl = randStat(baseMin + 5, baseMax + 7);
    accuracy = randStat(baseMin + 4, baseMax + 6);
    speed = randStat(baseMin + 3, baseMax + 8);
    bat = randStat(30, 50);
    timing = randStat(30, 48);
    power = randStat(35, 55);
  } else if (role.type === "ALL") {
    bat = randStat(baseMin + 1, baseMax + 3);
    bowl = randStat(baseMin + 1, baseMax + 3);
    timing = randStat(baseMin, baseMax + 2);
    accuracy = randStat(baseMin, baseMax + 2);
    power = randStat(baseMin, baseMax + 4);
  } else if (role.type === "WK") {
    bat = randStat(baseMin + 2, baseMax + 5);
    timing = randStat(baseMin + 2, baseMax + 5);
    bowl = randStat(25, 40);
  }
  
  const fielding = randStat(baseMin - 4, baseMax + 4);
  const age = randStat(18, 35);
  const trait = CRICKET_DATA.TRAITS[Math.floor(Math.random() * CRICKET_DATA.TRAITS.length)];
  const form = Math.floor(Math.random() * 3) + 3; // 3 to 5
  
  const overall = Math.round(
    role.type === "BAT" ? (bat * 0.5 + timing * 0.3 + power * 0.2) :
    role.type === "BOWL" ? (bowl * 0.5 + accuracy * 0.3 + speed * 0.2) :
    role.type === "ALL" ? (bat * 0.45 + bowl * 0.45 + fielding * 0.1) :
    (bat * 0.6 + fielding * 0.4)
  );

  const wage = Math.max(25, Math.round((overall * overall * 0.08) * (5 - repTier) * 0.3));
  const value = wage * 38;

  // Avatar initials and unique color
  const initials = name.split(" ").map(n => n[0]).join("");
  const hues = [12, 35, 145, 195, 220, 275, 330];
  const avatarColor = `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 65%, 45%)`;

  return {
    id: "p_" + Math.random().toString(36).substr(2, 9),
    name,
    initials,
    avatarColor,
    role,
    age,
    overall,
    bat,
    timing,
    power,
    bowl,
    accuracy,
    speed,
    fielding,
    stamina: 100,
    maxStamina: 100,
    form,
    trait,
    wage,
    value,
    stats: {
      matches: 0,
      runs: 0,
      highScore: 0,
      hundreds: 0,
      fifties: 0,
      ballsFaced: 0,
      wickets: 0,
      bestBowling: "0/0",
      oversBowled: 0,
      runsConceded: 0,
      catches: 0
    }
  };
}

// Generate Starter Squad of 15 players for the User
function generateStarterSquad(tier = 4) {
  const rolesList = [
    CRICKET_DATA.ROLES[0], // OPEN_BAT
    CRICKET_DATA.ROLES[0], // OPEN_BAT
    CRICKET_DATA.ROLES[1], // TOP_BAT
    CRICKET_DATA.ROLES[2], // MID_BAT
    CRICKET_DATA.ROLES[4], // WK_BAT
    CRICKET_DATA.ROLES[5], // BAT_ALL
    CRICKET_DATA.ROLES[6], // BOWL_ALL
    CRICKET_DATA.ROLES[7], // FAST_BOWL
    CRICKET_DATA.ROLES[8], // SWING_BOWL
    CRICKET_DATA.ROLES[9], // SPIN_BOWL
    CRICKET_DATA.ROLES[7], // FAST_BOWL
    // Bench reserves
    CRICKET_DATA.ROLES[3], // FINISHER
    CRICKET_DATA.ROLES[2], // MID_BAT
    CRICKET_DATA.ROLES[8], // SWING_BOWL
    CRICKET_DATA.ROLES[9]  // SPIN_BOWL
  ];

  return rolesList.map(role => generatePlayer({ role, tier }));
}

window.CRICKET_DATA = CRICKET_DATA;
window.generatePlayer = generatePlayer;
window.generateStarterSquad = generateStarterSquad;
