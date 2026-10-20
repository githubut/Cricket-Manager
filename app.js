// Willow & Leather: Cricket Club Manager
// Main Application Controller & State Engine

class CricketApp {
  constructor() {
    this.currentTab = "home";
    this.saveKey = "willow_leather_save_v1";
    this.state = this.loadState() || this.createInitialState();
    
    this.activeMatch = null;
    this.matchInterval = null;
    this.simSpeed = 1200; // ms per ball
    this.isSimulating = false;
    this.timingLoop = null;
    this.timingPos = 0;
    this.timingDirection = 1;
    this.selectedShot = null;
    this.selectedDelivery = null;
    this.bowlingPitchZone = { x: 50, y: 70 };

    this.initDOM();
    this.bindEvents();
    this.render();
  }

  createInitialState() {
    const tier = 4; // Village Sunday League
    const division = CRICKET_DATA.DIVISIONS.find(d => d.id === tier);
    const squad = generateStarterSquad(tier);

    // Initial League Table
    const leagueTable = [
      { id: "user", name: "Willowbrook CC", played: 0, won: 0, lost: 0, tied: 0, nrr: "+0.000", pts: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 },
      ...division.clubs.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color,
        short: c.short,
        played: 0, won: 0, lost: 0, tied: 0, nrr: "+0.000", pts: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0
      }))
    ];

    return {
      clubName: "Willowbrook CC",
      groundName: "The Village Green",
      groundLevel: 1,
      divisionTier: tier,
      coins: 1800,
      season: 1,
      week: 1,
      maxWeeks: 10,
      squad,
      lineup: squad.slice(0, 11).map(p => p.id),
      tactics: {
        batting: "normal",
        field: "balanced",
        homePitch: "flat"
      },
      facilities: {
        nets: 1,
        physio: 1,
        curator: 1,
        academy: 1
      },
      leagueTable,
      transferMarket: [
        generatePlayer({ tier: 4 }),
        generatePlayer({ tier: 4 }),
        generatePlayer({ tier: 3 }),
        generatePlayer({ tier: 4 })
      ],
      news: [
        { text: "Welcome to Willowbrook CC! Take your club from the village green to Lord's!", icon: "🏏" },
        { text: "Groundsman reports pitch rolled and ready for Sunday's opening clash.", icon: "🌱" }
      ]
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Save state failed", e);
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.saveKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Load state failed", e);
    }
    return null;
  }

  initDOM() {
    // Check saved theme
    if (localStorage.getItem("wl_theme") === "dark") {
      document.documentElement.dataset.theme = "dark";
      const icon = document.getElementById("themeIcon");
      if (icon) icon.textContent = "☀️";
    }
  }

  bindEvents() {
    // Bottom Tab Clicks
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
        window.cricketAudio.playClick();
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isDark = document.documentElement.dataset.theme === "dark";
        if (isDark) {
          delete document.documentElement.dataset.theme;
          localStorage.setItem("wl_theme", "light");
          document.getElementById("themeIcon").textContent = "🌙";
        } else {
          document.documentElement.dataset.theme = "dark";
          localStorage.setItem("wl_theme", "dark");
          document.getElementById("themeIcon").textContent = "☀️";
        }
        window.cricketAudio.playClick();
      });
    }

    // Audio Mute Toggle
    const muteBtn = document.getElementById("muteToggle");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        const muted = window.cricketAudio.toggleMute();
        muteBtn.textContent = muted ? "🔇" : "🔊";
      });
      muteBtn.textContent = window.cricketAudio.muted ? "🔇" : "🔊";
    }

    // Modal background click closing
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.style.display = "none";
        }
      });
    });

    // Keyboard Spacebar for Big Chance Hit
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        const hitBtn = document.getElementById("bigChanceActionBtn");
        if (hitBtn && hitBtn.offsetParent !== null) {
          e.preventDefault();
          hitBtn.click();
        }
      }
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === tabName);
    });

    document.querySelectorAll(".screen-content").forEach(s => {
      s.style.display = s.id === `tab-${tabName}` ? "flex" : "none";
    });

    this.render();
  }

  render() {
    this.renderTopBar();
    if (this.currentTab === "home") this.renderHome();
    else if (this.currentTab === "squad") this.renderSquad();
    else if (this.currentTab === "match") this.renderMatch();
    else if (this.currentTab === "league") this.renderLeague();
    else if (this.currentTab === "campus") this.renderCampus();
  }

  renderTopBar() {
    const clubTitle = document.getElementById("topClubName");
    const divPill = document.getElementById("topDivName");
    const coinPill = document.getElementById("topCoins");

    if (clubTitle) clubTitle.textContent = this.state.clubName;
    if (divPill) {
      const div = CRICKET_DATA.DIVISIONS.find(d => d.id === this.state.divisionTier);
      divPill.textContent = `${div.short} • W${this.state.week}`;
    }
    if (coinPill) coinPill.textContent = `£${this.state.coins.toLocaleString()}`;
  }

  // ================= HOME / PAVILION SCREEN =================
  renderHome() {
    const groundTier = CRICKET_DATA.GROUND_LEVELS[this.state.groundLevel - 1];
    const heroBanner = document.getElementById("groundHeroBanner");
    const heroTitle = document.getElementById("groundHeroTitle");
    const heroSubtitle = document.getElementById("groundHeroSub");

    if (heroBanner) heroBanner.style.backgroundImage = `url('${groundTier.image}')`;
    if (heroTitle) heroTitle.textContent = this.state.groundName;
    if (heroSubtitle) heroSubtitle.textContent = `${groundTier.name} (Cap: ${groundTier.capacity.toLocaleString()}) • £${groundTier.ticketPrice}/ticket`;

    // Next Opponent
    const nextOpp = this.getNextOpponent();
    const nextOppName = document.getElementById("nextOppName");
    const nextOppCrest = document.getElementById("nextOppCrest");
    const userCrest = document.getElementById("userCrest");
    const nextMatchPitch = document.getElementById("nextMatchPitch");

    if (nextOppName) nextOppName.textContent = nextOpp.name;
    if (nextOppCrest) {
      nextOppCrest.textContent = nextOpp.short || "OPP";
      nextOppCrest.style.backgroundColor = nextOpp.color || "#333";
      nextOppCrest.style.color = nextOpp.accent || "#fff";
    }
    if (userCrest) {
      userCrest.textContent = this.state.clubName.substring(0, 3).toUpperCase();
      userCrest.style.backgroundColor = "var(--go)";
      userCrest.style.color = "#fff";
    }

    const pitchType = CRICKET_DATA.PITCH_TYPES[this.state.tactics.homePitch] || CRICKET_DATA.PITCH_TYPES.flat;
    if (nextMatchPitch) nextMatchPitch.textContent = `${pitchType.icon} ${pitchType.name}`;

    // Play Match Button
    const playBtn = document.getElementById("btnPlayFixture");
    if (playBtn) {
      playBtn.onclick = () => {
        this.startMatchdayFlow();
      };
    }

    // Tiles Stats
    const userStanding = this.state.leagueTable.find(t => t.id === "user") || { pts: 0 };
    const userRank = this.state.leagueTable.slice().sort((a,b) => b.pts - a.pts).findIndex(t => t.id === "user") + 1;
    
    const tilePos = document.getElementById("tileLeaguePos");
    const tilePts = document.getElementById("tileLeaguePts");
    const tileSquad = document.getElementById("tileSquadSize");

    if (tilePos) tilePos.textContent = `${userRank || 1}th`;
    if (tilePts) tilePts.textContent = `${userStanding.pts} pts`;
    if (tileSquad) tileSquad.textContent = `${this.state.squad.length} men`;

    // News Items
    const newsList = document.getElementById("homeNewsList");
    if (newsList) {
      newsList.innerHTML = this.state.news.slice(0, 3).map(n => `
        <div class="news-item">
          <span>${n.icon}</span>
          <p>${n.text}</p>
        </div>
      `).join("");
    }
  }

  getNextOpponent() {
    const div = CRICKET_DATA.DIVISIONS.find(d => d.id === this.state.divisionTier);
    const oppIdx = (this.state.week - 1) % div.clubs.length;
    return div.clubs[oppIdx];
  }

  // ================= SQUAD & LINEUP SCREEN =================
  renderSquad() {
    const listEl = document.getElementById("squadPlayerList");
    if (!listEl) return;

    listEl.innerHTML = "";
    
    // Sort squad: starting XI first, then bench
    const startingXI = this.state.squad.filter(p => this.state.lineup.includes(p.id));
    const bench = this.state.squad.filter(p => !this.state.lineup.includes(p.id));

    // Ordered according to lineup array
    const orderedXI = this.state.lineup.map(id => startingXI.find(p => p.id === id)).filter(Boolean);

    // Render Starting XI
    const xiHeader = document.createElement("h3");
    xiHeader.textContent = `Starting XI (Matchday Lineup)`;
    xiHeader.style.margin = "8px 0 4px";
    listEl.appendChild(xiHeader);

    orderedXI.forEach((p, idx) => {
      listEl.appendChild(this.createPlayerRow(p, idx + 1, true));
    });

    // Render Bench
    if (bench.length > 0) {
      const benchHeader = document.createElement("h3");
      benchHeader.textContent = `Reserves & Bench (${bench.length})`;
      benchHeader.style.margin = "16px 0 4px";
      listEl.appendChild(benchHeader);

      bench.forEach(p => {
        listEl.appendChild(this.createPlayerRow(p, "-", false));
      });
    }

    // Tactics selectors
    const batTac = document.getElementById("tacticBatting");
    const fieldTac = document.getElementById("tacticField");
    if (batTac) {
      batTac.value = this.state.tactics.batting;
      batTac.onchange = () => {
        this.state.tactics.batting = batTac.value;
        this.saveState();
      };
    }
    if (fieldTac) {
      fieldTac.value = this.state.tactics.field;
      fieldTac.onchange = () => {
        this.state.tactics.field = fieldTac.value;
        this.saveState();
      };
    }
  }

  createPlayerRow(player, orderNum, isStarting) {
    const row = document.createElement("div");
    row.className = "player-row";

    let badgeClass = "badge-bat";
    if (player.role.type === "BOWL") badgeClass = "badge-bowl";
    if (player.role.type === "ALL") badgeClass = "badge-all";
    if (player.role.type === "WK") badgeClass = "badge-wk";

    row.innerHTML = `
      <div class="player-order">${orderNum}</div>
      <div class="player-avatar" style="background-color: ${player.avatarColor};">${player.initials}</div>
      <div class="player-info">
        <div class="player-info-name">
          ${player.name}
          <span class="badge-tag ${badgeClass}">${player.role.type}</span>
          ${orderNum === 1 ? '⭐' : ''}
        </div>
        <div class="player-info-sub">
          <span>${player.role.label}</span>
          <span>•</span>
          <span>⚡ ${player.stamina}%</span>
          <span>•</span>
          <span>£${player.wage}/wk</span>
        </div>
      </div>
      <div class="player-rating">${player.overall}</div>
    `;

    row.onclick = () => {
      this.showPlayerCardModal(player);
    };

    return row;
  }

  showPlayerCardModal(player) {
    const modal = document.getElementById("playerModal");
    const content = document.getElementById("playerModalBody");
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: center;">
        <div class="player-avatar" style="background-color: ${player.avatarColor}; width: 64px; height: 64px; font-size: 24px;">
          ${player.initials}
        </div>
        <div>
          <h2>${player.name}</h2>
          <p style="color: var(--soft);">${player.role.label} • Age ${player.age}</p>
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <span class="badge-tag badge-bat">OVR ${player.overall}</span>
            <span class="badge-tag badge-all">${player.trait}</span>
          </div>
        </div>
      </div>

      <div class="tiles-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 12px;">
        <div class="tile">
          <span>Batting</span>
          <b>${player.bat}</b>
          <small>Timing: ${player.timing}</small>
        </div>
        <div class="tile">
          <span>Bowling</span>
          <b>${player.bowl}</b>
          <small>Acc: ${player.accuracy}</small>
        </div>
        <div class="tile">
          <span>Power</span>
          <b>${player.power}</b>
          <small>Speed: ${player.speed}</small>
        </div>
      </div>

      <div class="card flat" style="margin-top: 10px;">
        <h4 style="margin-bottom: 6px;">Season Career Numbers</h4>
        <p style="font-size: 13px; color: var(--soft);">
          Runs: <b>${player.stats.runs}</b> | High Score: <b>${player.stats.highScore}</b> | 50s: <b>${player.stats.fifties}</b><br>
          Wickets: <b>${player.stats.wickets}</b> | Best Bowl: <b>${player.stats.bestBowling}</b> | Catches: <b>${player.stats.catches}</b>
        </p>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button class="btn-go" id="btnSetAsCaptain" style="font-size: 15px; min-height: 44px;">
          ⭐ Make Captain
        </button>
        <button class="btn-secondary" id="btnReleasePlayer" style="color: var(--down);">
          Release
        </button>
      </div>
    `;

    document.getElementById("btnSetAsCaptain").onclick = () => {
      // Move player to top of lineup
      const filtered = this.state.lineup.filter(id => id !== player.id);
      this.state.lineup = [player.id, ...filtered];
      this.saveState();
      modal.style.display = "none";
      this.renderSquad();
      window.cricketAudio.playClick();
    };

    modal.style.display = "flex";
  }

  // ================= MATCHDAY ENGINE & FLOW =================
  startMatchdayFlow() {
    this.switchTab("match");
    const opp = this.getNextOpponent();
    const oppSquad = Array.from({ length: 11 }, () => generatePlayer({ tier: this.state.divisionTier }));
    const homePitch = CRICKET_DATA.PITCH_TYPES[this.state.tactics.homePitch] || CRICKET_DATA.PITCH_TYPES.flat;

    const userStartingSquad = this.state.lineup.map(id => this.state.squad.find(p => p.id === id)).filter(Boolean);

    this.activeMatch = new CricketMatchEngine({
      userClub: { name: this.state.clubName, color: "var(--go)" },
      oppClub: opp,
      pitch: homePitch,
      maxOvers: 5,
      isHome: true,
      userSquad: userStartingSquad,
      oppSquad: oppSquad,
      userTactics: this.state.tactics
    });

    // Show Toss Modal
    this.showTossModal();
  }

  showTossModal() {
    const modal = document.getElementById("tossModal");
    if (!modal) {
      this.activeMatch.setupMatch(true);
      this.startLiveSimulation();
      return;
    }

    modal.style.display = "flex";
    document.getElementById("btnTossBat").onclick = () => {
      modal.style.display = "none";
      this.activeMatch.setupMatch(true);
      window.cricketAudio.playClick();
      this.startLiveSimulation();
    };
    document.getElementById("btnTossBowl").onclick = () => {
      modal.style.display = "none";
      this.activeMatch.setupMatch(false);
      window.cricketAudio.playClick();
      this.startLiveSimulation();
    };
  }

  startLiveSimulation() {
    this.isSimulating = true;
    this.renderMatchBoard();
    this.clearCommentaryDOM();

    // Hook commentary to audio and ticker
    this.activeMatch.callbacks.onCommentary = (entry) => {
      this.appendCommentaryDOM(entry);
    };

    this.scheduleNextBall();
  }

  scheduleNextBall() {
    if (!this.isSimulating || !this.activeMatch || this.activeMatch.isFinished) return;

    this.matchInterval = setTimeout(() => {
      const result = this.activeMatch.simulateBall();
      
      if (!result) return;

      if (result.event === "big_chance") {
        // Pause simulation for interactive Big Chance
        this.openBigChanceArena(result.payload);
        return;
      }

      this.handleBallAudio(result);
      this.renderMatchBoard();

      if (result.event === "match_end") {
        this.isSimulating = false;
        this.onMatchComplete();
      } else {
        this.scheduleNextBall();
      }
    }, this.simSpeed);
  }

  handleBallAudio(result) {
    if (!result) return;
    if (result.isWicket) {
      window.cricketAudio.playStumpsClatter();
    } else if (result.runs === 6) {
      window.cricketAudio.playBatCrack(true);
      window.cricketAudio.playBoundary();
    } else if (result.runs === 4) {
      window.cricketAudio.playBatCrack(false);
      window.cricketAudio.playBoundary();
    } else if (result.runs > 0) {
      window.cricketAudio.playBatCrack(false);
    }
  }

  renderMatch() {
    if (!this.activeMatch) {
      const board = document.getElementById("matchdayBoard");
      if (board) {
        board.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <p style="font-size: 18px; font-weight: 800; margin-bottom: 10px;">No Match In Progress</p>
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 20px;">Head over to the Pavilion to play your next league fixture!</p>
            <button class="btn-go" onclick="window.cricketApp.switchTab('home')" style="max-width: 200px; margin: 0 auto;">To Pavilion</button>
          </div>
        `;
      }
      return;
    }
    this.renderMatchBoard();
    this.drawWagonWheel();
  }

  renderMatchBoard() {
    const inn = this.activeMatch.getCurrentInnings();
    if (!inn) return;

    // Team and scoreline
    const scoreRuns = document.getElementById("liveRunsWickets");
    const scoreOvers = document.getElementById("liveOvers");
    const batTeamName = document.getElementById("liveBatTeam");
    const targetLabel = document.getElementById("liveTargetLabel");

    if (scoreRuns) scoreRuns.textContent = `${inn.totalRuns}/${inn.wickets}`;
    if (scoreOvers) scoreOvers.textContent = `(${inn.oversStr}/${this.activeMatch.maxOvers} ov)`;
    if (batTeamName) batTeamName.textContent = inn.batTeam.name;

    if (targetLabel) {
      if (this.activeMatch.currentInnings === 2) {
        const target = this.activeMatch.innings[0].totalRuns + 1;
        const needed = target - inn.totalRuns;
        const ballsLeft = (this.activeMatch.maxOvers * 6) - inn.balls;
        targetLabel.textContent = needed <= 0 ? "Target Reached!" : `Need ${needed} from ${ballsLeft}b`;
      } else {
        const runRate = inn.balls > 0 ? ((inn.totalRuns / inn.balls) * 6).toFixed(1) : "0.0";
        targetLabel.textContent = `Current RR: ${runRate}`;
      }
    }

    // Active Batters
    const striker = inn.battingCard[inn.currentStrikerIdx];
    const nonStriker = inn.battingCard[inn.currentNonStrikerIdx];
    const bowler = inn.bowlingCard[inn.currentBowlerIdx];

    const strikerEl = document.getElementById("liveStriker");
    const nonStrikerEl = document.getElementById("liveNonStriker");
    const bowlerEl = document.getElementById("liveBowler");

    if (strikerEl && striker) {
      strikerEl.innerHTML = `<b>${striker.player.name} *</b><span>${striker.runs} (${striker.balls}b, ${striker.fours}x4, ${striker.sixes}x6)</span>`;
    }
    if (nonStrikerEl && nonStriker) {
      nonStrikerEl.innerHTML = `<b>${nonStriker.player.name}</b><span>${nonStriker.runs} (${nonStriker.balls}b)</span>`;
    }
    if (bowlerEl && bowler) {
      bowlerEl.innerHTML = `<b>${bowler.player.name}</b><span>${bowler.wickets}/${bowler.runs} (${bowler.overs} ov)</span>`;
    }

    // Over Balls bubbles
    const track = document.getElementById("overBallsTrack");
    if (track) {
      track.innerHTML = inn.currentOverBalls.map(sym => {
        let cls = "";
        if (sym === "4") cls = "four";
        if (sym === "6") cls = "six";
        if (sym === "W") cls = "wicket";
        return `<div class="ball-bubble ${cls} pop">${sym}</div>`;
      }).join("");
    }

    this.drawWagonWheel();
  }

  drawWagonWheel() {
    const canvas = document.getElementById("wagonCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Oval boundary lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cx - 10, cy - 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner 30-yard circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, (cx - 10) * 0.55, (cy - 10) * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pitch crease in center
    ctx.fillStyle = "#e3d8c3";
    ctx.fillRect(cx - 4, cy - 12, 8, 24);

    // Radiating shot lines
    this.activeMatch.wagonWheel.forEach(shot => {
      const maxR = (cx - 10) * (shot.distance / 100);
      const ex = cx + Math.cos(shot.angle) * maxR;
      const ey = cy + Math.sin(shot.angle) * maxR;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);

      if (shot.runs === 6) ctx.strokeStyle = "#ffc93c";
      else if (shot.runs === 4) ctx.strokeStyle = "#5fc26c";
      else ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";

      ctx.lineWidth = shot.runs >= 4 ? 2.5 : 1.2;
      ctx.stroke();

      // Dot at landing spot
      ctx.beginPath();
      ctx.arc(ex, ey, shot.runs === 6 ? 4 : (shot.runs === 4 ? 3 : 2), 0, Math.PI * 2);
      ctx.fillStyle = shot.runs >= 4 ? "#fff" : "rgba(255, 255, 255, 0.7)";
      ctx.fill();
    });
  }

  clearCommentaryDOM() {
    const list = document.getElementById("commList");
    if (list) list.innerHTML = "";
  }

  appendCommentaryDOM(entry) {
    const list = document.getElementById("commList");
    if (!list) return;

    const div = document.createElement("div");
    div.className = `comm-entry ${entry.type}`;
    div.innerHTML = `
      <div class="comm-ball">${entry.ball}</div>
      <div>${entry.text}</div>
    `;

    list.insertBefore(div, list.firstChild);
  }

  // ================= BIG CHANCE INTERACTIVE MINI-GAME =================
  openBigChanceArena(payload) {
    const modal = document.getElementById("bigChanceModal");
    const arenaBody = document.getElementById("bigChanceBody");
    if (!modal || !arenaBody) return;

    window.cricketAudio.playHowzat();

    if (payload.type === "batting") {
      this.selectedShot = payload.shots[0].id;
      arenaBody.innerHTML = `
        <div class="big-chance-arena">
          <div class="chance-title-bar">
            <span class="chance-badge">🚨 BIG CHANCE • BATTING</span>
            <span style="font-size: 13px; font-weight: 700;">${payload.striker.name} to strike</span>
          </div>
          <p style="font-size: 14px;">
            <b>${payload.bowler.name}</b> runs up with a dangerous <b>${payload.delivery.name}</b> (${payload.delivery.speed})!
          </p>

          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--sun);">
            1. Select Your Shot
          </div>
          <div class="choices-grid" id="shotChoices">
            ${payload.shots.map((s, idx) => `
              <div class="choice-card ${idx === 0 ? 'selected' : ''}" data-id="${s.id}">
                <b>${s.name}</b>
                <small>${s.desc}</small>
              </div>
            `).join("")}
          </div>

          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--sun); margin-top: 4px;">
            2. Time The Sweet Spot & Hit!
          </div>
          <div class="timing-meter-wrap">
            <div class="timing-track" id="timingTrack">
              <div class="timing-zone red"></div>
              <div class="timing-zone yellow"></div>
              <div class="timing-zone green"></div>
              <div class="timing-zone yellow"></div>
              <div class="timing-zone red"></div>
              <div class="timing-indicator" id="timingIndicator"></div>
            </div>
          </div>

          <button class="btn-go" id="bigChanceActionBtn" style="margin-top: 4px;">
            🏏 HIT SHOT! (or Press Space)
          </button>
        </div>
      `;

      // Shot select click
      arenaBody.querySelectorAll(".choice-card").forEach(card => {
        card.onclick = () => {
          arenaBody.querySelectorAll(".choice-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          this.selectedShot = card.dataset.id;
          window.cricketAudio.playClick();
        };
      });

      this.startTimingBarOscillation();

      document.getElementById("bigChanceActionBtn").onclick = () => {
        this.executeBattingBigChance();
      };

    } else {
      // Bowling Big Chance
      this.selectedDelivery = payload.deliveries[0].id;
      arenaBody.innerHTML = `
        <div class="big-chance-arena">
          <div class="chance-title-bar">
            <span class="chance-badge">🚨 BIG CHANCE • BOWLING</span>
            <span style="font-size: 13px; font-weight: 700;">${payload.bowler.name} bowling</span>
          </div>
          <p style="font-size: 14px;">
            ${payload.striker.name} is looking dangerous at the crease! Need an unplayable delivery for the breakthrough!
          </p>

          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--sun);">
            1. Select Delivery Weapon
          </div>
          <div class="choices-grid" id="deliveryChoices">
            ${payload.deliveries.map((d, idx) => `
              <div class="choice-card ${idx === 0 ? 'selected' : ''}" data-id="${d.id}">
                <b>${d.name}</b>
                <small>${d.speed} • ${d.desc}</small>
              </div>
            `).join("")}
          </div>

          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--sun); margin-top: 4px;">
            2. Perfect The Release Accuracy!
          </div>
          <div class="timing-meter-wrap">
            <div class="timing-track" id="timingTrack">
              <div class="timing-zone red"></div>
              <div class="timing-zone yellow"></div>
              <div class="timing-zone green"></div>
              <div class="timing-zone yellow"></div>
              <div class="timing-zone red"></div>
              <div class="timing-indicator" id="timingIndicator"></div>
            </div>
          </div>

          <button class="btn-go" id="bigChanceActionBtn" style="margin-top: 4px;">
            🎯 UNLEASH BALL!
          </button>
        </div>
      `;

      arenaBody.querySelectorAll(".choice-card").forEach(card => {
        card.onclick = () => {
          arenaBody.querySelectorAll(".choice-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          this.selectedDelivery = card.dataset.id;
          window.cricketAudio.playClick();
        };
      });

      this.startTimingBarOscillation();

      document.getElementById("bigChanceActionBtn").onclick = () => {
        this.executeBowlingBigChance();
      };
    }

    modal.style.display = "flex";
  }

  startTimingBarOscillation() {
    if (this.timingLoop) clearInterval(this.timingLoop);
    this.timingPos = 0;
    this.timingDirection = 1;
    const speed = 2.4; // sweep speed

    this.timingLoop = setInterval(() => {
      this.timingPos += speed * this.timingDirection;
      if (this.timingPos >= 100) {
        this.timingPos = 100;
        this.timingDirection = -1;
      } else if (this.timingPos <= 0) {
        this.timingPos = 0;
        this.timingDirection = 1;
      }
      const indicator = document.getElementById("timingIndicator");
      if (indicator) indicator.style.left = `${this.timingPos}%`;
    }, 16);
  }

  stopTimingBar() {
    if (this.timingLoop) {
      clearInterval(this.timingLoop);
      this.timingLoop = null;
    }
    // Calculate distance from center sweet spot (center is 50%)
    const distFromSweetSpot = Math.abs(50 - this.timingPos);
    // 0 = sweet spot, 50 = maximum miss
    const accuracy = Math.max(0, 1 - (distFromSweetSpot / 50));
    return accuracy;
  }

  executeBattingBigChance() {
    const accuracy = this.stopTimingBar();
    const result = this.activeMatch.resolveBattingBigChance(this.selectedShot, accuracy);

    this.handleBallAudio(result);
    this.closeBigChanceModal();
  }

  executeBowlingBigChance() {
    const accuracy = this.stopTimingBar();
    const result = this.activeMatch.resolveBowlingBigChance(this.selectedDelivery, accuracy, this.bowlingPitchZone);

    this.handleBallAudio(result);
    this.closeBigChanceModal();
  }

  closeBigChanceModal() {
    const modal = document.getElementById("bigChanceModal");
    if (modal) modal.style.display = "none";

    this.renderMatchBoard();

    if (this.activeMatch.isFinished) {
      this.isSimulating = false;
      this.onMatchComplete();
    } else {
      this.scheduleNextBall();
    }
  }

  // ================= POST-MATCH CELEBRATION & LEDGER =================
  onMatchComplete() {
    const groundTier = CRICKET_DATA.GROUND_LEVELS[this.state.groundLevel - 1];
    const ticketRevenue = Math.round(groundTier.capacity * groundTier.ticketPrice * 0.85);
    const winBonus = this.activeMatch.winner === this.activeMatch.userClub ? 450 : 150;
    const totalEarnings = ticketRevenue + winBonus;

    this.state.coins += totalEarnings;
    window.cricketAudio.playCrowdCheer(true);
    window.cricketAudio.playCoin();

    // Update League Points
    const userRow = this.state.leagueTable.find(t => t.id === "user");
    const oppRow = this.state.leagueTable.find(t => t.id === this.activeMatch.oppClub.id);

    userRow.played++;
    if (oppRow) oppRow.played++;

    const isUserWin = this.activeMatch.winner === this.activeMatch.userClub;
    if (isUserWin) {
      userRow.won++;
      userRow.pts += 2;
      if (oppRow) oppRow.lost++;
    } else if (this.activeMatch.winner === "tie") {
      userRow.tied++;
      userRow.pts += 1;
      if (oppRow) { oppRow.tied++; oppRow.pts += 1; }
    } else {
      userRow.lost++;
      if (oppRow) { oppRow.won++; oppRow.pts += 2; }
    }

    // Simulate other clubs in league for this week
    this.simulateOtherLeagueMatches();

    this.state.news.unshift({
      text: `${this.activeMatch.resultSummary} Gate receipts collected £${ticketRevenue.toLocaleString()}.`,
      icon: isUserWin ? "🏆" : "🏏"
    });

    this.state.week++;
    this.saveState();

    // Show Celebration Modal
    this.showCelebrationModal(totalEarnings, isUserWin);
  }

  simulateOtherLeagueMatches() {
    const clubs = this.state.leagueTable.filter(c => c.id !== "user" && c.id !== this.activeMatch.oppClub.id);
    for (let i = 0; i < clubs.length; i += 2) {
      if (i + 1 < clubs.length) {
        const c1 = clubs[i];
        const c2 = clubs[i+1];
        c1.played++;
        c2.played++;
        if (Math.random() < 0.5) {
          c1.won++;
          c1.pts += 2;
          c2.lost++;
        } else {
          c2.won++;
          c2.pts += 2;
          c1.lost++;
        }
      }
    }
  }

  showCelebrationModal(earnings, isUserWin) {
    const modal = document.getElementById("celebrationModal");
    const body = document.getElementById("celebrationBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <span style="font-size: 52px;">${isUserWin ? '🏆' : '🏏'}</span>
        <h2>${isUserWin ? 'Sensational Victory!' : 'Hard Fought Match'}</h2>
        <p style="color: var(--soft); font-size: 16px;">${this.activeMatch.resultSummary}</p>
        
        <div class="card flat" style="width: 100%; margin-top: 8px; text-align: left;">
          <h4 style="margin-bottom: 6px;">Player of the Match</h4>
          <p style="font-size: 15px; font-weight: 800; color: var(--pitch);">⭐ ${this.activeMatch.playerOfTheMatch.player.name}</p>
          <small style="color: var(--soft);">${this.activeMatch.playerOfTheMatch.feat}</small>
        </div>

        <div class="card flat" style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 700;">Match Revenue Earned</span>
          <span class="pill-coin">+£${earnings.toLocaleString()} <span class="coin-icon"></span></span>
        </div>

        <button class="btn-go" style="width: 100%; margin-top: 8px;" id="btnCloseCelebration">
          Continue to Pavilion
        </button>
      </div>
    `;

    document.getElementById("btnCloseCelebration").onclick = () => {
      modal.style.display = "none";
      this.switchTab("home");
    };

    modal.style.display = "flex";
  }

  // ================= LEAGUE TABLE SCREEN =================
  renderLeague() {
    const wrap = document.getElementById("leagueTableContent");
    if (!wrap) return;

    // Sort by points descending
    const sorted = this.state.leagueTable.slice().sort((a, b) => b.pts - a.pts);

    wrap.innerHTML = `
      <div class="league-table-wrap">
        <table class="league-tbl">
          <thead>
            <tr>
              <th style="text-align: center; width: 32px;">Pos</th>
              <th>Club</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map((team, idx) => {
              const isUser = team.id === "user";
              return `
                <tr class="${isUser ? 'user-row' : ''}">
                  <td style="text-align: center; font-weight: 800;">${idx + 1}</td>
                  <td class="club-name">${team.name} ${isUser ? '⭐' : ''}</td>
                  <td>${team.played}</td>
                  <td>${team.won}</td>
                  <td>${team.lost}</td>
                  <td class="pts">${team.pts}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div class="tiles-grid" style="grid-template-columns: 1fr 1fr; margin-top: 14px;">
        <div class="tile">
          <span>Leading Run Scorer 🧢</span>
          <b>${this.state.squad[0].name}</b>
          <small>${this.state.squad[0].stats.runs} Runs (SR 142.5)</small>
        </div>
        <div class="tile">
          <span>Leading Wicket Taker 🟣</span>
          <b>${this.state.squad[7].name}</b>
          <small>${this.state.squad[7].stats.wickets} Wickets (Econ 6.2)</small>
        </div>
      </div>
    `;
  }

  // ================= CAMPUS & FACILITIES SCREEN =================
  renderCampus() {
    const groundTier = CRICKET_DATA.GROUND_LEVELS[this.state.groundLevel - 1];
    const nextGroundTier = CRICKET_DATA.GROUND_LEVELS[this.state.groundLevel] || null;

    const groundCard = document.getElementById("campusGroundCard");
    if (groundCard) {
      groundCard.innerHTML = `
        <div style="display: flex; gap: 14px; align-items: center;">
          <img src="${groundTier.image}" style="width: 80px; height: 80px; border-radius: 14px; object-fit: cover;">
          <div style="flex: 1;">
            <h3>${groundTier.name} (Level ${this.state.groundLevel})</h3>
            <p style="font-size: 13px; color: var(--soft);">${groundTier.perk}</p>
            <p style="font-size: 13px; font-weight: 700; margin-top: 2px;">Capacity: ${groundTier.capacity.toLocaleString()} spectators</p>
          </div>
        </div>
        ${nextGroundTier ? `
          <button class="btn-go" id="btnUpgradeGround" style="margin-top: 10px; font-size: 15px; min-height: 44px;">
            Upgrade to ${nextGroundTier.name} (£${nextGroundTier.upgradeCost.toLocaleString()})
          </button>
        ` : `<div class="badge-tag badge-bowl" style="margin-top: 8px; text-align: center;">Maximum Stadium Reached!</div>`}
      `;

      if (nextGroundTier) {
        document.getElementById("btnUpgradeGround").onclick = () => {
          if (this.state.coins >= nextGroundTier.upgradeCost) {
            this.state.coins -= nextGroundTier.upgradeCost;
            this.state.groundLevel++;
            this.state.groundName = nextGroundTier.name;
            window.cricketAudio.playCoin();
            this.saveState();
            this.render();
          } else {
            alert("Insufficient club treasury balance!");
          }
        };
      }
    }

    // Facility Upgrades
    const facWrap = document.getElementById("facilitiesList");
    if (facWrap) {
      facWrap.innerHTML = CRICKET_DATA.FACILITIES.map(fac => {
        const curLvl = this.state.facilities[fac.id] || 1;
        const cost = fac.baseCost * curLvl;
        return `
          <div class="facility-card">
            <div class="facility-icon">🏛️</div>
            <div class="facility-details">
              <h4>${fac.name} (Lvl ${curLvl}/${fac.maxLevel})</h4>
              <p>${fac.perk}</p>
            </div>
            ${curLvl < fac.maxLevel ? `
              <button class="btn-secondary" onclick="window.cricketApp.upgradeFacility('${fac.id}', ${cost})">
                +1 (£${cost})
              </button>
            ` : `<span class="badge-tag badge-bowl">MAX</span>`}
          </div>
        `;
      }).join("");
    }

    // Transfer Market
    const marketWrap = document.getElementById("transferMarketList");
    if (marketWrap) {
      marketWrap.innerHTML = this.state.transferMarket.map((p, idx) => `
        <div class="market-row">
          <div class="player-avatar" style="background-color: ${p.avatarColor};">${p.initials}</div>
          <div class="player-info">
            <div class="player-info-name">${p.name} <span class="badge-tag badge-bat">${p.role.type}</span></div>
            <div class="player-info-sub">OVR ${p.overall} • Age ${p.age} • ${p.trait}</div>
          </div>
          <div style="font-family: var(--num); font-size: 16px; font-weight: 800;">£${p.value}</div>
          <button class="btn-go" onclick="window.cricketApp.signPlayer(${idx})" style="min-height: 36px; padding: 0 12px; font-size: 13px;">
            Sign
          </button>
        </div>
      `).join("");
    }
  }

  upgradeFacility(facId, cost) {
    if (this.state.coins >= cost) {
      this.state.coins -= cost;
      this.state.facilities[facId] = (this.state.facilities[facId] || 1) + 1;
      window.cricketAudio.playCoin();
      this.saveState();
      this.render();
    } else {
      alert("Insufficient club treasury balance!");
    }
  }

  signPlayer(index) {
    const player = this.state.transferMarket[index];
    if (!player) return;

    if (this.state.coins >= player.value) {
      this.state.coins -= player.value;
      this.state.squad.push(player);
      this.state.transferMarket.splice(index, 1);
      // Generate new candidate
      this.state.transferMarket.push(generatePlayer({ tier: this.state.divisionTier }));
      window.cricketAudio.playCoin();
      this.saveState();
      this.render();
      alert(`Signed ${player.name} to Willowbrook CC!`);
    } else {
      alert("Insufficient club treasury balance to sign player!");
    }
  }
}

// Global Startup
window.addEventListener("DOMContentLoaded", () => {
  window.cricketApp = new CricketApp();
});
