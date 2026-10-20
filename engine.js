// Match Engine & Interactive Big Chances for Willow & Leather Cricket Manager

class CricketMatchEngine {
  constructor(matchData) {
    this.userClub = matchData.userClub;
    this.oppClub = matchData.oppClub;
    this.pitch = matchData.pitch || CRICKET_DATA.PITCH_TYPES.flat;
    this.maxOvers = matchData.maxOvers || 5;
    this.isHome = matchData.isHome !== false;
    this.userSquad = matchData.userSquad;
    this.oppSquad = matchData.oppSquad;
    this.userTactics = matchData.userTactics || { batting: "normal", bowling: "balanced", field: "balanced" };
    
    // Toss & Innings setup
    this.tossWinner = null;
    this.userBattedFirst = true;
    this.currentInnings = 1; // 1 or 2
    
    // In-game score tracking
    this.innings = [
      this.initInningsState(this.userClub, this.oppClub, true),
      this.initInningsState(this.oppClub, this.userClub, false)
    ];

    this.isFinished = false;
    this.winner = null;
    this.resultSummary = "";
    this.activeBigChance = null;
    this.wagonWheel = []; // Array of { angle, distance, runs, batsman }
    this.manhattan = [[], []]; // runs per over
    this.commentary = [];
    this.callbacks = {};
  }

  initInningsState(batTeam, bowlTeam, isUserBatting) {
    return {
      batTeam,
      bowlTeam,
      isUserBatting,
      totalRuns: 0,
      wickets: 0,
      balls: 0,
      oversStr: "0.0",
      extras: 0,
      currentStrikerIdx: 0,
      currentNonStrikerIdx: 1,
      currentBowlerIdx: 0,
      fallOfWickets: [],
      overRuns: 0,
      currentOverBalls: [],
      battingCard: [],
      bowlingCard: []
    };
  }

  setupMatch(userChoseBat = true) {
    // Determine toss
    this.tossWinner = Math.random() < 0.5 ? "user" : "opp";
    if (this.tossWinner === "user") {
      this.userBattedFirst = userChoseBat;
    } else {
      // AI decision: 60% prefer chasing on flat pitch, 60% prefer batting first on green seamer
      this.userBattedFirst = this.pitch === CRICKET_DATA.PITCH_TYPES.green ? false : Math.random() < 0.5;
    }

    if (this.userBattedFirst) {
      this.innings[0] = this.initInningsState(this.userClub, this.oppClub, true);
      this.innings[1] = this.initInningsState(this.oppClub, this.userClub, false);
    } else {
      this.innings[0] = this.initInningsState(this.oppClub, this.userClub, false);
      this.innings[1] = this.initInningsState(this.userClub, this.oppClub, true);
    }

    // Populate scorecards
    this.initScorecards(0);
    this.initScorecards(1);

    const tossTeamName = this.tossWinner === "user" ? this.userClub.name : this.oppClub.name;
    const choice = (this.tossWinner === "user" ? this.userBattedFirst : !this.userBattedFirst) ? "bat" : "bowl";
    this.addCommentary(`🪙 **Toss**: ${tossTeamName} won the toss and elected to **${choice.toUpperCase()}** first on a ${this.pitch.name} pitch.`);
  }

  initScorecards(innIdx) {
    const inn = this.innings[innIdx];
    const batSquad = inn.isUserBatting ? this.userSquad : this.oppSquad;
    const bowlSquad = inn.isUserBatting ? this.oppSquad : this.userSquad;

    inn.battingCard = batSquad.slice(0, 11).map((p, idx) => ({
      player: p,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: "0.0",
      isOut: false,
      howOut: "not out",
      battingOrder: idx + 1
    }));

    // Select 3 to 4 frontline bowlers
    const bowlers = bowlSquad.slice().sort((a, b) => b.bowl - a.bowl).slice(0, 4);
    inn.bowlingCard = bowlers.map(p => ({
      player: p,
      overs: 0,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economy: "0.0"
    }));
  }

  getCurrentInnings() {
    return this.innings[this.currentInnings - 1];
  }

  addCommentary(text, type = "normal") {
    const inn = this.getCurrentInnings();
    const entry = {
      ball: inn ? inn.oversStr : "0.0",
      text,
      type,
      time: Date.now()
    };
    this.commentary.unshift(entry);
    if (this.callbacks.onCommentary) {
      this.callbacks.onCommentary(entry);
    }
  }

  // Check if a Big Chance should be presented to the player
  shouldTriggerBigChance() {
    const inn = this.getCurrentInnings();
    if (!inn) return false;
    
    // Total balls in innings
    const totalBalls = this.maxOvers * 6;
    const currentBall = inn.balls;
    
    // Trigger opportunities:
    // 1. In 2nd over (around ball 8-10)
    // 2. In 4th over (around ball 20-22)
    // 3. In the final over crunch (around ball 27-29)
    if (inn.bigChancesTriggered && inn.bigChancesTriggered >= 2) return false;
    if (!inn.bigChancesTriggered) inn.bigChancesTriggered = 0;

    const isKeyBall = (currentBall === 7 || currentBall === 18 || (currentBall === 26 && this.currentInnings === 2));
    if (isKeyBall) {
      inn.bigChancesTriggered++;
      return true;
    }
    return false;
  }

  // Simulate next ball (or pause for Big Chance)
  simulateBall() {
    if (this.isFinished) return null;
    const inn = this.getCurrentInnings();

    // Check if innings ended
    if (inn.wickets >= 10 || inn.balls >= this.maxOvers * 6) {
      this.endInnings();
      return { event: "innings_end" };
    }

    // Check 2nd innings target reached
    if (this.currentInnings === 2) {
      const target = this.innings[0].totalRuns + 1;
      if (inn.totalRuns >= target) {
        this.finishMatch();
        return { event: "match_end" };
      }
    }

    // Check for Big Chance intervention
    if (this.shouldTriggerBigChance()) {
      return this.generateBigChancePayload();
    }

    return this.executeBallPhysics();
  }

  generateBigChancePayload() {
    const inn = this.getCurrentInnings();
    const striker = inn.battingCard[inn.currentStrikerIdx];
    const bowler = inn.bowlingCard[inn.currentBowlerIdx];

    if (inn.isUserBatting) {
      // User Batting Big Chance
      const delivery = CRICKET_DATA.DELIVERIES[Math.floor(Math.random() * CRICKET_DATA.DELIVERIES.length)];
      this.activeBigChance = {
        type: "batting",
        striker: striker.player,
        bowler: bowler.player,
        delivery,
        shots: CRICKET_DATA.SHOTS
      };
      return {
        event: "big_chance",
        payload: this.activeBigChance
      };
    } else {
      // User Bowling Big Chance
      this.activeBigChance = {
        type: "bowling",
        striker: striker.player,
        bowler: bowler.player,
        deliveries: CRICKET_DATA.DELIVERIES
      };
      return {
        event: "big_chance",
        payload: this.activeBigChance
      };
    }
  }

  // Resolve user-played Batting Big Chance
  resolveBattingBigChance(shotId, timingScore) {
    // timingScore: 0.0 to 1.0 (1.0 = absolute perfect sweet-spot)
    const inn = this.getCurrentInnings();
    const striker = inn.battingCard[inn.currentStrikerIdx];
    const bowler = inn.bowlingCard[inn.currentBowlerIdx];
    const shot = CRICKET_DATA.SHOTS.find(s => s.id === shotId) || CRICKET_DATA.SHOTS[0];
    const delivery = this.activeBigChance.delivery;

    let runs = 0;
    let isWicket = false;
    let desc = "";

    // Synergy between shot and delivery
    const hasSynergy = shot.idealAgainst.includes(delivery.length) || shot.idealAgainst.includes(delivery.id);
    const effectiveTiming = timingScore * (hasSynergy ? 1.2 : 0.95);

    if (effectiveTiming >= 0.85) {
      // Masterclass timing
      if (shot.type === "aerial") {
        runs = 6;
        desc = `🚀 **BOOM! ${shot.name.toUpperCase()}!** ${striker.player.name} connects with thunderous sweet-spot timing! The cherry sails high and handsome into the stands for SIX!`;
      } else {
        runs = 4;
        desc = `🔥 **GLORIOUS ${shot.name.toUpperCase()}!** ${striker.player.name} plays with surgical precision, piercing the field to the rope for FOUR!`;
      }
    } else if (effectiveTiming >= 0.55) {
      // Decent timing
      if (shot.id === "block") {
        runs = Math.random() < 0.4 ? 1 : 0;
        desc = `🛡️ ${striker.player.name} gets right behind the line with a solid defensive block. Rotates strike safely.`;
      } else {
        runs = Math.random() < 0.6 ? 2 : (Math.random() < 0.5 ? 4 : 1);
        desc = `⚡ ${shot.name} played neatly into the deep gap. Hard running yields ${runs} runs.`;
      }
    } else if (effectiveTiming >= 0.28) {
      // Poor mistimed
      if (shot.risk === "high") {
        isWicket = true;
        desc = `❌ **MISTIMED! OUT!** ${striker.player.name} was through the shot too early! Skied high in the air and safely pouch-held by the fielder!`;
      } else {
        runs = 0;
        desc = `💨 Beaten for pace! Inside edge onto the pad, dot ball.`;
      }
    } else {
      // Complete whiff / misread
      isWicket = true;
      desc = `💥 **CLEAN BOWLED!** ${bowler.player.name}'s ${delivery.name} crashes straight into the stumps! Wooden bails flying everywhere!`;
    }

    this.activeBigChance = null;
    return this.applyBallResult(runs, isWicket, desc, "big_chance_result");
  }

  // Resolve user-played Bowling Big Chance
  resolveBowlingBigChance(deliveryId, accuracyScore, pitchZone) {
    // accuracyScore: 0.0 to 1.0
    const inn = this.getCurrentInnings();
    const striker = inn.battingCard[inn.currentStrikerIdx];
    const bowler = inn.bowlingCard[inn.currentBowlerIdx];
    const delivery = CRICKET_DATA.DELIVERIES.find(d => d.id === deliveryId) || CRICKET_DATA.DELIVERIES[0];

    let runs = 0;
    let isWicket = false;
    let desc = "";

    if (accuracyScore >= 0.82) {
      // Pitch-perfect delivery
      isWicket = true;
      if (delivery.id === "yorker") {
        desc = `🎯 **TIMBERRR!** ${bowler.player.name} unleashes an unplayable toe-crusher at ${delivery.speed}! Stumps uprooted! WICKET!`;
      } else if (delivery.id === "outswing") {
        desc = `🧤 **EDGED AND TAKEN!** Late outswing lures ${striker.player.name} into the drive, faint feather through to the keeper!`;
      } else if (delivery.id === "googly") {
        desc = `🌀 **BAMBOOZLED! LBW!** Batsman had zero clue which way it was spinning! Trapped dead in front!`;
      } else {
        desc = `💥 **WICKET!** Brilliant execution of the ${delivery.name}! Batsman deceived completely!`;
      }
    } else if (accuracyScore >= 0.45) {
      // Good line & length
      runs = Math.random() < 0.7 ? 0 : 1;
      desc = `🛡️ Tidy ${delivery.name} on off-stump. Batsman defends watchfully into the covers. (${runs} run)`;
    } else {
      // Loose delivery
      runs = Math.random() < 0.5 ? 4 : 2;
      desc = `⚠️ Slipped down the leg side! ${striker.player.name} swivels and punishes the loose delivery for ${runs} runs.`;
    }

    this.activeBigChance = null;
    return this.applyBallResult(runs, isWicket, desc, "big_chance_result");
  }

  // Standard algorithmic ball calculation
  executeBallPhysics() {
    const inn = this.getCurrentInnings();
    const striker = inn.battingCard[inn.currentStrikerIdx];
    const bowler = inn.bowlingCard[inn.currentBowlerIdx];

    const pitchBonus = this.pitch;
    const isUserBat = inn.isUserBatting;

    // Batting factor
    let batRating = (striker.player.bat * 0.6 + striker.player.timing * 0.4) * (pitchBonus.batBonus || 1.0);
    // Bowling factor
    const isPacer = bowler.player.role.type === "BOWL" && bowler.player.role.id.includes("FAST");
    const bowlMultiplier = isPacer ? (pitchBonus.paceBonus || 1.0) : (pitchBonus.spinBonus || 1.0);
    let bowlRating = (bowler.player.bowl * 0.6 + bowler.player.accuracy * 0.4) * bowlMultiplier;

    // Tactics modulation
    const tactics = isUserBat ? this.userTactics : { batting: "normal", field: "balanced" };
    let aggro = 1.0;
    if (tactics.batting === "aggressive") aggro = 1.35;
    if (tactics.batting === "blitz") aggro = 1.7;
    if (tactics.batting === "cautious") aggro = 0.7;

    const diff = (batRating - bowlRating) / 100; // -0.5 to +0.5
    const roll = Math.random();

    let runs = 0;
    let isWicket = false;
    let desc = "";

    // Wicket probability
    const wicketThreshold = Math.max(0.04, Math.min(0.24, (0.09 - diff * 0.08) * (aggro > 1.2 ? 1.4 : 1.0)));

    if (roll < wicketThreshold) {
      isWicket = true;
      const wTypes = ["Bowled", "Caught at Mid-Wicket", "Caught Behind", "LBW", "Caught at Long-On"];
      const wType = wTypes[Math.floor(Math.random() * wTypes.length)];
      desc = `☝️ **OUT! ${wType.toUpperCase()}!** ${striker.player.name} falls! Excellent bowling by ${bowler.player.name}.`;
    } else {
      // Runs calculation
      const sixProb = Math.max(0.02, 0.08 + diff * 0.08) * (aggro > 1.2 ? 1.8 : 0.8);
      const fourProb = Math.max(0.08, 0.18 + diff * 0.12) * aggro;
      const singleProb = 0.38;
      const doubleProb = 0.14;

      const runRoll = Math.random();
      if (runRoll < sixProb) {
        runs = 6;
        desc = `🔥 **SIX!** ${striker.player.name} launches it high over deep mid-wicket into the crowd!`;
      } else if (runRoll < sixProb + fourProb) {
        runs = 4;
        desc = `⚡ **FOUR!** Cracking shot by ${striker.player.name}! Driven powerfully to the boundary fence.`;
      } else if (runRoll < sixProb + fourProb + doubleProb) {
        runs = 2;
        desc = `🏃 Guided into the vacant gap at deep cover. Good hustle for a couple of runs.`;
      } else if (runRoll < sixProb + fourProb + doubleProb + singleProb) {
        runs = 1;
        desc = `🎯 Pushed into the ring for a sharp single. Strike rotated.`;
      } else {
        runs = 0;
        desc = `⚪ Good, tight line and length by ${bowler.player.name}. Defended back to the bowler. Dot ball.`;
      }
    }

    return this.applyBallResult(runs, isWicket, desc, isWicket ? "wicket" : (runs >= 4 ? "boundary" : "normal"));
  }

  // Update scorecards, overs, strike rotation, and wagon wheel
  applyBallResult(runs, isWicket, desc, eventType = "normal") {
    const inn = this.getCurrentInnings();
    const striker = inn.battingCard[inn.currentStrikerIdx];
    const bowler = inn.bowlingCard[inn.currentBowlerIdx];

    inn.balls++;
    striker.balls++;
    bowler.balls++;

    // Calculate over string
    const completedOvers = Math.floor(inn.balls / 6);
    const ballsInOver = inn.balls % 6;
    inn.oversStr = `${completedOvers}.${ballsInOver}`;

    let ballSymbol = runs.toString();
    if (isWicket) {
      ballSymbol = "W";
      inn.wickets++;
      striker.isOut = true;
      striker.howOut = `c & b ${bowler.player.name}`;
      bowler.wickets++;
      inn.fallOfWickets.push({ score: inn.totalRuns, player: striker.player.name, over: inn.oversStr });

      // Next batsman walks out
      const nextIdx = Math.max(inn.currentStrikerIdx, inn.currentNonStrikerIdx) + 1;
      if (nextIdx < inn.battingCard.length) {
        inn.currentStrikerIdx = nextIdx;
      }
    } else {
      inn.totalRuns += runs;
      striker.runs += runs;
      bowler.runs += runs;
      if (runs === 4) striker.fours++;
      if (runs === 6) striker.sixes++;

      // Record Wagon Wheel point
      if (runs > 0) {
        const angles = { 1: 45, 2: 135, 4: 210, 6: 300 };
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = runs === 6 ? 95 : (runs === 4 ? 85 : 45 + Math.random() * 25);
        this.wagonWheel.push({ angle, distance, runs, batsman: striker.player.name });
      }

      // Rotate strike on odd runs
      if (runs % 2 !== 0) {
        const temp = inn.currentStrikerIdx;
        inn.currentStrikerIdx = inn.currentNonStrikerIdx;
        inn.currentNonStrikerIdx = temp;
      }
    }

    // Update strike rate & economy
    striker.strikeRate = striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : "0.0";
    const bowlerOvers = Math.floor(bowler.balls / 6) + (bowler.balls % 6) / 6;
    bowler.economy = bowlerOvers > 0 ? (bowler.runs / bowlerOvers).toFixed(1) : "0.0";
    bowler.overs = `${Math.floor(bowler.balls / 6)}.${bowler.balls % 6}`;

    inn.currentOverBalls.push(ballSymbol);
    inn.overRuns += runs;

    this.addCommentary(desc, eventType);

    // End of over check
    if (ballsInOver === 0) {
      this.manhattan[this.currentInnings - 1].push(inn.overRuns);
      this.addCommentary(`📋 **End of Over ${completedOvers}**: ${inn.batTeam.name} are ${inn.totalRuns}/${inn.wickets} (${inn.overRuns} runs in the over).`);
      inn.overRuns = 0;
      inn.currentOverBalls = [];

      // Rotate strike between overs
      const temp = inn.currentStrikerIdx;
      inn.currentStrikerIdx = inn.currentNonStrikerIdx;
      inn.currentNonStrikerIdx = temp;

      // Rotate bowler
      inn.currentBowlerIdx = (inn.currentBowlerIdx + 1) % inn.bowlingCard.length;
    }

    // Check innings or match finish
    if (this.currentInnings === 2) {
      const target = this.innings[0].totalRuns + 1;
      if (inn.totalRuns >= target) {
        this.finishMatch();
        return { event: "match_end", runs, isWicket, desc, symbol: ballSymbol };
      }
    }

    if (inn.wickets >= 10 || inn.balls >= this.maxOvers * 6) {
      if (this.currentInnings === 1) {
        this.endInnings();
        return { event: "innings_end", runs, isWicket, desc, symbol: ballSymbol };
      } else {
        this.finishMatch();
        return { event: "match_end", runs, isWicket, desc, symbol: ballSymbol };
      }
    }

    return { event: "ball", runs, isWicket, desc, symbol: ballSymbol };
  }

  endInnings() {
    this.currentInnings = 2;
    const firstInn = this.innings[0];
    const target = firstInn.totalRuns + 1;
    this.addCommentary(`🔔 **Innings Break**: ${firstInn.batTeam.name} scored **${firstInn.totalRuns}/${firstInn.wickets}** in ${firstInn.oversStr} overs.`);
    this.addCommentary(`🎯 Target for ${this.innings[1].batTeam.name} is **${target} runs** from ${this.maxOvers} overs (Required Run Rate: ${(target / this.maxOvers).toFixed(1)}).`);
  }

  finishMatch() {
    this.isFinished = true;
    const inn1 = this.innings[0];
    const inn2 = this.innings[1];

    if (inn2.totalRuns > inn1.totalRuns) {
      this.winner = inn2.batTeam;
      const wicketsRemaining = 10 - inn2.wickets;
      this.resultSummary = `${inn2.batTeam.name} won by ${wicketsRemaining} wicket${wicketsRemaining > 1 ? 's' : ''}!`;
    } else if (inn1.totalRuns > inn2.totalRuns) {
      this.winner = inn1.batTeam;
      const runMargin = inn1.totalRuns - inn2.totalRuns;
      this.resultSummary = `${inn1.batTeam.name} won by ${runMargin} run${runMargin > 1 ? 's' : ''}!`;
    } else {
      this.winner = "tie";
      this.resultSummary = `Match TIED! What a sensational contest on the green!`;
    }

    // Award Player of the Match
    this.awardPOTM();
    this.addCommentary(`🏆 **Full Time**: ${this.resultSummary}`);
  }

  awardPOTM() {
    let bestPlayer = null;
    let highestImpact = -1;

    [...this.innings[0].battingCard, ...this.innings[1].battingCard].forEach(b => {
      const impact = b.runs * 1.5 + b.sixes * 4 + b.fours * 2;
      if (impact > highestImpact) {
        highestImpact = impact;
        bestPlayer = { player: b.player, feat: `${b.runs} runs (${b.balls}b, ${b.fours}x4, ${b.sixes}x6)` };
      }
    });

    [...this.innings[0].bowlingCard, ...this.innings[1].bowlingCard].forEach(b => {
      const impact = b.wickets * 28 - b.runs * 0.5;
      if (impact > highestImpact) {
        highestImpact = impact;
        bestPlayer = { player: b.player, feat: `${b.wickets}/${b.runs} (${b.overs} overs)` };
      }
    });

    this.playerOfTheMatch = bestPlayer || { player: this.userSquad[0], feat: "Crucial captaincy knock" };
  }
}

window.CricketMatchEngine = CricketMatchEngine;
