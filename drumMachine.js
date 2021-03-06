var audio = new AudioContext();

var data = {
  step:0,

  tracks: [createTrack("gold", note(audio, 880)),
           createTrack("gold", note(audio, 659)),
           createTrack("gold", note(audio, 587)),
           createTrack("gold", note(audio, 523)),
           createTrack("gold", note(audio, 440)),
           createTrack("dodgerblue", kick(audio))]
};

//update

setInterval(function(){
  data.step = (data.step +1) % data.tracks[0].steps.length;

  data.tracks
  .filter(function(track){ return track.steps[data.step]; })
  .forEach(function(track){ track.playSound(); });
}, 100);

//draw

var screen = document.getElementById("screen").getContext("2d");

(function draw() {
  screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
  drawTracks(screen, data);
  drawButton(screen, data.step, data.tracks.length, "deeppink");

  requestAnimationFrame(draw);
})();

//handle events

(function setupButtonClicking(){
  addEventListener("click", function(e){
    var p = { x: e.offsetX, y: e.offsetY };

    data.tracks.forEach(function(track, row){

      track.steps.forEach(function(on, column){
        if (isPointInButton(p, column, row)) {
          track.steps[column] = !on;
        }
      });
    });
  });
})();

function note(audio, frequency){
  return function(){
    var duration = 1;

    var sineWave = createSineWave(audio, duration);

    sineWave.frequency.value = frequency;

    chain([
      sineWave,
      createAmplifier(audio,0.2,duration),
      audio.destination]);
  };
};

function kick(audio){
  return function(){
    var duration = 2;
    var sineWave = createSineWave(audio, duration);

    rampDown(audio, sineWave.frequency, 160, duration);

    chain([
      sineWave,
      createAmplifier(audio,0.4,duration),
      audio.destination]);
  };
};

function createSineWave(audio, duration){
  var oscillator = audio.createOscillator();

  oscillator.type = "sine";
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);

  return oscillator;
};

function rampDown(audio, value, startValue, duration) {
  value.setValueAtTime(startValue, audio.currentTime);
  value.exponentialRampToValueAtTime(0.01, audio.currentTime + duration);
};

function createAmplifier(audio, startValue, duration){
  var amplifier = audio.createGain();
  rampDown(audio, amplifier.gain, startValue, duration);
  return amplifier
};

function chain(soundNodes){
  for (var i = 0; i < soundNodes.length - 1; i++){
    soundNodes[i].connect(soundNodes[i + 1]);
  }
};

function createTrack(color,playSound){
  var steps = [];
  for (var i = 0; i < 16; i++){
    steps.push(false);
  }
  return {steps:steps, color:color, playSound:playSound};
};

var BUTTON_SIZE = 26;

function buttonPosition(column, row){
  return {
    x: BUTTON_SIZE / 2 + column * BUTTON_SIZE * 1.5,
    y: BUTTON_SIZE / 2 + row * BUTTON_SIZE * 1.5
  };
};

function drawButton (screen, column, row, color){
  var position = buttonPosition(column, row);
  screen.fillStyle = color;
  screen.fillRect(position.x, position.y, BUTTON_SIZE, BUTTON_SIZE);
};

function drawTracks(screen, data){
  data.tracks.forEach(function(track, row){
    track.steps.forEach(function(on, column){
      drawButton(screen,
                 column,
                 row,
                 on ? track.color : "lightgray");
    });
  });
};

function isPointInButton(p, column, row) {
  var b = buttonPosition(column, row);
  return !(p.x < b.x ||
           p.y < b.y ||
           p.x > b.x + BUTTON_SIZE ||
           p.y > b.y + BUTTON_SIZE);
};
