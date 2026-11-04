"use strict";
const gameState = {
  pid: Math.floor(Math.random() * 900000) + 100000,
  trialCnt: -1,
  trialState: "waitInit",
  maxTrials: 10,
  log: [],
  timer: null,
  animTimer: null,
  frameTimer: null,
  gameStart: Date.now(),
};
const field = document.getElementById("field"),
  center = document.getElementById("center"),
  mole = document.getElementById("mole"),
  status = document.getElementById("status"),
  progress = document.getElementById("progress"),
  warning = document.getElementById("warning");
let lastCSV = "",
  moleVisible = false;
const moleCanvas = document.getElementById("moleCanvas");
const moleContext = moleCanvas.getContext("2d", { alpha: true });
const moleSprite = new Image();
moleSprite.src = "mole.png";

function drawMoleFrame(frame) {
  moleContext.clearRect(0, 0, moleCanvas.width, moleCanvas.height);
  if (!moleSprite.complete || !moleSprite.naturalWidth) return;
  const frameWidth = moleSprite.naturalWidth / 5;
  moleContext.drawImage(
    moleSprite,
    frame * frameWidth,
    0,
    frameWidth,
    moleSprite.naturalHeight,
    0,
    0,
    moleCanvas.width,
    moleCanvas.height,
  );
}
moleSprite.addEventListener("load", () => drawMoleFrame(0));

const now = () => Date.now();
function entry() {
  return gameState.log[gameState.log.length - 1];
}

function record() {
  return {
    tid: gameState.trialCnt,
    startTS: -1,
    rndDelayStart: -1,
    rndDelay: -1,
    rndDelayEnd: -1,
    moleStats: "",
    userMoveStart: -1,
    userEnterMole: -1,
    userClickMole: -1,
    hitSuccess: "-",
  };
}

function showStatus(s) {
  status.textContent = s;
  progress.textContent = `Trial ${Math.min(gameState.trialCnt + 1, gameState.maxTrials)} / ${gameState.maxTrials}`;
}

function readyToStartTrial() {
  gameState.trialCnt++;
  warning.hidden = true;
  if (gameState.trialCnt >= gameState.maxTrials) {
    finish();
    return;
  }
  console.info("FN: Trial:", gameState.trialCnt, "Ready to start trial");
  gameState.log.push(record());
  entry().startTS = now();
  gameState.trialState = "waitStartClick";
  center.className = "ready";
  mole.hidden = true;
  moleVisible = false;
  showStatus("Click the green centre circle to start the next trial.");
}
function startTrial() {
  console.info("FN: Trial:", gameState.trialCnt, "Trial started, wait random delay");
  if (gameState.trialState !== "waitStartClick") return;
  gameState.trialState = "waitRandomDelay";
  center.className = "waiting";
  const delay = Math.floor(Math.random() * 2000) + 1000;
  entry().rndDelayStart = now();
  entry().rndDelay = delay;
  showStatus("Wait for the mole…");
  gameState.timer = setTimeout(randomWaitEnded, delay);
}
function randomWaitEnded() {
  console.info("FN: Trial:", gameState.trialCnt, "Wait end, display mole");
  entry().rndDelayEnd = now();
  gameState.trialState = "waitTrialEnd";
  const pos = getMolePosition(),
    size = getMoleSize(),
    timeout = getTimeout();
  if (
    !Number.isFinite(pos.x) ||
    !Number.isFinite(pos.y) ||
    Math.abs(pos.x) > 1 ||
    Math.abs(pos.y) > 0.75 ||
    !Number.isFinite(size) ||
    size < 1 ||
    size > 2
  ) {
    showStatus("Invalid position/size in update.js");
    gameState.trialState = "error";
    return;
  }
  const width = field.clientWidth,
    height = field.clientHeight;
  const diameter = width * 0.05 * size;
  const x = width / 2 + pos.x * width * 0.43,
    y = height / 2 - pos.y * height * 0.43;
  const cx = Math.max(diameter / 2, Math.min(width - diameter / 2, x)),
    cy = Math.max(diameter / 2, Math.min(height - diameter / 2, y));
  mole.style.left = `${cx}px`;
  mole.style.top = `${cy}px`;
  mole.style.width = `${diameter}px`;
  mole.className = "";
  drawMoleFrame(0);
  mole.hidden = false;
  moleVisible = true;
  entry().moleStats = [pos.x.toFixed(3), pos.y.toFixed(3), size, timeout].join(
    ",",
  );
  showStatus("Click the mole!");
  let frame = 0;
  clearInterval(gameState.frameTimer);
  gameState.frameTimer = setInterval(() => {
    frame = Math.min(frame + 1, 4);
    drawMoleFrame(frame);
    if (frame === 4) clearInterval(gameState.frameTimer);
  }, 150);
  gameState.timer = setTimeout(() => endTrial(false), timeout);
}

function endTrial(hit) {
  if (gameState.trialState !== "waitTrialEnd") return;
  clearTimeout(gameState.timer);
  clearInterval(gameState.frameTimer);
  gameState.trialState = "trialEnded";
  entry().hitSuccess = hit ? "Y" : "N";
  if (hit) {
    entry().userClickMole = now();
    console.info("FN: Trial:",gameState.trialCnt,"User hit mole, trial success");
  } else console.info("FN: Trial:", gameState.trialCnt, "User too slow, trial failed");
  mole.classList.add(hit ? "hit" : "missed");
  mole.classList.add("hide");
  showStatus(hit ? "Hit!" : "Too slow!");
  gameState.animTimer = setTimeout(() => {
    mole.hidden = true;
    moleVisible = false;
    readyToStartTrial();
  }, 750);
}
function finish() {
  console.info("FN: Experiment ended. Exporting data...");
  gameState.trialState = "finished";
  center.className = "";
  center.disabled = true;
  mole.hidden = true;
  showStatus("Experiment complete — CSV downloaded.");
  lastCSV =
    "PiD,TrailId,startTS,rndDelayStart,rndDelay,rndDelayEnd,moleXn,moleYn,moleScale,hitTime,userMoveStart,userEnterMole,userClickMole,hitSuccess\n" +
    gameState.log.map((e) => getCSVDataLine(e, gameState.pid)).join("\n");
  exportData(lastCSV, "experimentData.csv");
  document.getElementById("download").hidden = false;
}
center.addEventListener("mouseenter", () => {
  if (gameState.trialState === "waitInit" && now() - gameState.gameStart >= 500)
    readyToStartTrial();
});
center.addEventListener("click", startTrial);
center.addEventListener("mouseleave", () => {
  if (gameState.trialState === "waitTrialEnd") entry().userMoveStart = now();
});
mole.addEventListener("mouseenter", () => {
  if (gameState.trialState === "waitTrialEnd") entry().userEnterMole = now();
});
mole.addEventListener("click", () => endTrial(true));
field.addEventListener("pointermove", () => {
  if (gameState.trialState === "waitRandomDelay") warning.hidden = false;
});
document.getElementById("download").addEventListener("click", () => {
  if (lastCSV) exportData(lastCSV, "experimentData.csv");
});
// The first trial is activated by entering the centre circle, as in the original.
showStatus("Move your cursor onto the centre circle to begin.");
