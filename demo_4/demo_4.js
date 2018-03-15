// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//we can't support edge or IE :( or Samsung S6
var isSupported = !(/(edge|trident|SM-G920|SM-G925)/i.test(navigator.userAgent));

 if(!isSupported) {
     document.querySelector('.device-supported').style.display = 'none';
     document.querySelector('.device-not-supported').style.display = 'block';
 }


///////////////////////////////
//Splash Page
var displayingSplash = true;
function onPlay() {
    var splash = document.querySelector('.splash');
    splash.style.opacity = 0.0;
    setTimeout(function() { //duration of fade
        splash.style.display = 'none';
        displayingSplash = false;
    }, 500);
}

//Play with this to get back a larger or smaller blend of melodies
var numInterpolations = 2; //numInterpolations containing 32 notes

var MELODY1 = presetMelodies['Melody 1'];
var MELODY2 = presetMelodies['Melody 2'];


function getGeneratedMelodyColor(selectorIndex){
    var colorOptions = ([
        [
            [51, 137, 0],
            [46, 196, 91],
            [41, 255, 181]
        ],
        [
            [48, 17, 234],
            [24, 78, 211],
            [8, 139, 188]
        ]
    ])[selectorIndex];
    return colorOptions[floor(random(0, colorOptions.length))];
}



// go to https://goo.gl/magenta/musicvae-checkpoints to see more checkpoint urls
// var melodiesModelCheckPoint = 'https://storage.googleapis.com/download.magenta.tensorflow.org/models/music_vae/dljs/mel_small';
var melodiesModelCheckPoint = './data/mel_small';

// musicvae is trained on sequences of notes that are 2 bars, so 32 note per sequences.
// Input needs to be the the same format
var NUM_STEPS = 32; // DO NOT CHANGE.
var interpolatedNoteSequences;
var numTiles;


//Uses promises to chain together asynchronous operations.
//Check out https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises for info on promises

var musicVAE = new musicvae.MusicVAE(melodiesModelCheckPoint);
if(isSupported){
    musicVAE.initialize()
        .then(function(musicVAE) {
            //blends between the given two melodies and returns numInterpolations note sequences
            interpolateMelodies();

            //enable splash play button
            var splashPlayButton = document.querySelector('.splash-play-button');
            splashPlayButton.innerHTML = "PLAY";
            splashPlayButton.disabled = false;
        });
}

///////////////////////////////
//Drop Down Presets Setup
var melodySelectors = document.querySelectorAll('.drop-down');
var options = Object.keys(presetMelodies)
    .concat(['Generated'])
    .map(function(presetName) {
        return '<option>' + presetName + '</option>';
    }).join('');

melodySelectors.forEach(function(selector, index){
    selector.innerHTML = options;
    selector.addEventListener('input', onSelectorInput);
});

melodySelectors[1].children[1].selected = 'selected';

function onSelectorInput(event){
    updateSelector(event.target, true);
}

function updateSelector(selector, shouldInterpolate){
    var preset = presetMelodies[selector.value];
    var selectedColor;
    if(selector === melodySelectors[0]) {
        MELODY1 = preset || musicVAE.sample(1)[0];
        selectedColor = preset ? preset.color : getGeneratedMelodyColor(0);
        sequences.colorA = color(selectedColor);
    } else {
        MELODY2 = preset || musicVAE.sample(1)[0];
        selectedColor = preset ? preset.color : getGeneratedMelodyColor(1);
        sequences.colorB = color(selectedColor);
    }
    selector.style.backgroundColor = 'rgb(' + selectedColor.join(',') + ')';
    if(shouldInterpolate){
        interpolateMelodies();
    }

}

function interpolateMelodies(){
    interpolatedNoteSequences = musicVAE.interpolate([MELODY1, MELODY2], numInterpolations);
    //it is possible that the original melodies will shift slightly depending on the model
    //lets preserve the original melodies
    interpolatedNoteSequences[0] = MELODY1;
    interpolatedNoteSequences[interpolatedNoteSequences.length-1] = MELODY2;
}


///////////////////////////////
//TONE.js setup for audio play back
// var samplesPath = './data/piano/';
var samplesPath = "https://storage.googleapis.com/melody-mixer/piano/"
var samples = {};
var NUM_NOTES = 88;
var MIDI_START_NOTE = 21;
for (var i = MIDI_START_NOTE; i < NUM_NOTES + MIDI_START_NOTE; i++) {
    samples[i] = samplesPath + i + '.mp3';
}

var players = new Tone.Players(samples, function onPlayersLoaded(){
    console.log("Tone.js players loaded");
    // Tone.startMobile();
}).toMaster();


function playNote(midiNote, numNoteHolds){
    var duration = Tone.Transport.toSeconds('8n') * (numNoteHolds || 1);
    var player = players.get(midiNote);
    player.fadeOut = 0.05;
    player.fadeIn = 0.01;
    // console.log(`Playing ${midiNote}`);
    player.start(Tone.now(), 0, duration);
}

//used to play back audio on ios
StartAudioContext(Tone.context, '.play-pause-button').then(function(){
    console.log('audio context started');
});

var sequenceIndex = -1;
var stepIndex = -1;

///////////////////////////////
//p5.js setup
var SCRUB_BAR_HEIGHT = 20;
var SCRUB_BAR_GAP = 20;
var mouseDownPosition = null;
var MAX_TILE_SIZE = 100;

var sequences = {
    tileSize: MAX_TILE_SIZE,
    width: 100 * 2,
    targetWidth: 100 * 2,
    colorA: null,
    colorB: null
};

function setup() {
    melodySelectors.forEach(function(selector){
        updateSelector(selector, false);
    });
    windowResized();
    noStroke();
}

var percent = 0.0;
function draw() {
    //playback logic
    var totalPlayTime = (Tone.Transport.bpm.value * NUM_STEPS * numInterpolations) / 1000;
    percent = Tone.Transport.seconds / totalPlayTime % 1;
    if(Tone.Transport.state === 'started') {
        var currSequenceIndex = Math.floor(percent * numInterpolations);
        var currStepIndex = Math.floor((percent * numInterpolations - currSequenceIndex) * NUM_STEPS);
        if(currStepIndex != stepIndex) {
            var notes = interpolatedNoteSequences[currSequenceIndex].notes.filter(function(note) { return note.quantizedStartStep === currStepIndex});
            notes.forEach(function(note) {
                var noteDuration = note.quantizedEndStep - note.quantizedStartStep;
                playNote(note.pitch, noteDuration);
            });
        }
        sequenceIndex = currSequenceIndex;
        stepIndex = currStepIndex;
    }

    translate(0, height/2 - sequences.tileSize/2 - SCRUB_BAR_HEIGHT);
    //Drawing Tiles + notes
    noStroke();
    background(50);
    fill(53, 53, 53);
    rect(0, 0, width, SCRUB_BAR_HEIGHT);
    fill(249, 10);
    rect(0, SCRUB_BAR_GAP + SCRUB_BAR_HEIGHT, width, sequences.tileSize);

    //move our origin (0,0) to the main tile area to simplify coordinates
    push();
    translate(0, SCRUB_BAR_GAP + SCRUB_BAR_HEIGHT);
    stroke(255);
    strokeWeight(2);

    tweenSequences();
    drawSequences();

    pop();
    //origin is now back to top-left corner
    if(mousePressedInScrubBar()) {
        var seekTime = 0.0;
        if(mouseX > tileLeft(0) && mouseX < tileRight(numInterpolations-1)){
            seekTime = (mouseX - tileLeft(0)) / calcCurrentSequenceWidth() * totalPlayTime;
        } else if(mouseX > tileRight(numInterpolations - 1)) {
            seekTime = totalPlayTime - 0.00001 ; //make sure it sticks to the end
        }
        Tone.Transport.seconds = seekTime;
    }
    drawPlayhead(new p5.Vector(tileLeft(0) + percent * calcCurrentSequenceWidth() , SCRUB_BAR_HEIGHT), SCRUB_BAR_GAP);
}

function windowResized(){
    var numTiles = sequences.targetWidth / sequences.tileSize;
    var nextSize = min(MAX_TILE_SIZE, windowWidth / max(8, floor(numTiles)));
    sequences.targetWidth = numTiles * nextSize;
    sequences.tileSize = nextSize;
    var totalHeight = sequences.tileSize + SCRUB_BAR_GAP + SCRUB_BAR_HEIGHT;
    createCanvas(windowWidth, totalHeight);
}


function mousePressed(){
    if(displayingSplash){
        return;
    }
    mouseDownPosition = new p5.Vector(mouseX, mouseY);
}

function setSelectorToLast(selector, i){
    selector.value = selector.options[selector.length -1].value;
    updateSelector(selector, true);
}

function keyPressed() {
    if(keyCode === 32) { //space bar pressed
        togglePlayback();
    } else if(keyCode == 13) { //ENTER key pressed
        var samples = musicVAE.sample(2);
        MELODY1 = samples[0];
        MELODY2 = samples[1];
        melodySelectors.forEach(setSelectorToLast);
    }
}

function togglePlayback(){
    if(!interpolatedNoteSequences || !players) {
        return;
    }
    if(Tone.Transport.state === 'started') {
        Tone.Transport.pause();
    } else {
        Tone.Transport.start();
    }
}

function mouseReleased(){
    sequences.width = calcCurrentSequenceWidth();
    var numTiles = round(sequences.width / sequences.tileSize);
    sequences.targetWidth = numTiles * sequences.tileSize;
    mouseDownPosition = null;
    numInterpolations = numTiles;

    interpolateMelodies();
}

/**
* render the triangle and line of where we are currently playing
* @param {p5.Vector} pos
* @param {Number} triangleHeight
*/
function drawPlayhead(pos, triangleHeight){
    var width = 20;
    var hWidth = width / 2;

    fill(255);
    triangle(
        pos.x - hWidth, pos.y,
        pos.x, pos.y + triangleHeight,
        pos.x + hWidth, pos.y
    );
    stroke(255);
    strokeWeight(2);
    line(
        pos.x, pos.y + 2,
        pos.x, sequences.tileSize + pos.y + triangleHeight
    );
}


function drawSequences(){
    var left = tileLeft(0);
    var right = tileRight(0);

    //how many tiles completely fit in this size
    var numTiles = calcCurrentSequenceWidth() / sequences.tileSize;
    var completedTiles = Math.floor(numTiles);
    var partSize = (numTiles - completedTiles) * sequences.tileSize;

    noStroke();
    for(var i=0; i<completedTiles; i++){
        var ceilTiles = partSize > 0 ? completedTiles : completedTiles - 1;
        var color;
        var x = left + sequences.tileSize * i;
        if(i < completedTiles - 1){
            color = lerpColor(sequences.colorA, sequences.colorB, i / ceilTiles);
            fill(color);
            rect(x, 0, sequences.tileSize, sequences.tileSize);
        } else {
            if(partSize > 0){
                color = lerpColor(sequences.colorA, sequences.colorB, i / ceilTiles);
                fill(color);
                rect(x, sequences.tileSize / 2 - partSize/2, partSize, partSize);
            }
            x += partSize;
            var t = partSize > 0 ? i + 1 : i;
            color = lerpColor(sequences.colorA, sequences.colorB, t / ceilTiles);
            fill(color);
            rect(x, 0, sequences.tileSize, sequences.tileSize);
        }
        // fill(255);
        // text(i, x + 20, 20);
    }

    if(interpolatedNoteSequences){
        if(mousePressedInSequenceTiles() || sequences.width !== sequences.targetWidth){
            drawNotes(interpolatedNoteSequences[0].notes, tileLeft(0), sequences.tileSize);
            drawNotes(interpolatedNoteSequences[interpolatedNoteSequences.length-1].notes, tileLeft(completedTiles-1) + partSize, sequences.tileSize);
        } else {
            for(var i=0; i<interpolatedNoteSequences.length; i++){
                if(interpolatedNoteSequences.length > i) {
                    drawNotes(interpolatedNoteSequences[i].notes, tileLeft(i), sequences.tileSize);
                }
            }
        }
    }
}

function drawNotes(notes, x, size) {
    push();
    translate(x, 0);
    fill(255);
    var cellWidth = size / NUM_STEPS;
    var cellHeight = size / NUM_NOTES;
    notes.forEach(function(note) {
        var emptyNoteSpacer = 1;
        rect(emptyNoteSpacer + cellWidth * note.quantizedStartStep, size - cellHeight * (note.pitch-MIDI_START_NOTE),
            cellWidth * (note.quantizedEndStep - note.quantizedStartStep) - emptyNoteSpacer, cellHeight);
    });
    pop();
}

//tween the sequence width towards its destination size
function tweenSequences(){
    if(sequences.targetWidth !== sequences.width){
        sequences.width += (sequences.targetWidth - sequences.width) * 0.1;
        if( abs(sequences.width - sequences.targetWidth) < 0.05){
            sequences.width = sequences.targetWidth;
        }
    }
}

//the left-side of the sequences rect
function tileLeft(index){
    return width / 2 - (calcCurrentSequenceWidth()/2) + (sequences.tileSize * index);
}
//the right-side of the sequences rect
function tileRight(index){
    return tileLeft(index) + sequences.tileSize;
}

function mousePressedInSequenceTiles() {
    return mouseDownPosition && mouseDownPosition.y < height / 2 + SCRUB_BAR_HEIGHT  + sequences.tileSize /2 &&
        mouseDownPosition.y > height / 2 - sequences.tileSize /2 + SCRUB_BAR_HEIGHT;
}

function mousePressedInScrubBar() {
    return mouseDownPosition && mouseDownPosition.y < height / 2 + SCRUB_BAR_HEIGHT  - sequences.tileSize /2 &&
        mouseDownPosition.y > height / 2 - sequences.tileSize /2;
}

//calculate how long the sequences width should currently be
function calcCurrentSequenceWidth(){
    if(!mousePressedInSequenceTiles()){
        return sequences.width;
    }
    var isMovingTowardsCenter = abs(mouseX - width/2) < abs(mouseDownPosition.x - width/2);
    //-1 if on left on center, 1 if on right
    var a = mouseX < width/2 ? -1 : 1;
    var b = mouseDownPosition.x < width / 2 ? -1 : 1;
    var didCrossCenter = a * b < 0;
    var currWidth;
    if(didCrossCenter){
        currWidth = abs(mouseX - width/2) * 2;
    } else if(isMovingTowardsCenter){
        currWidth = sequences.width - abs(mouseX-mouseDownPosition.x) * 2;
    } else {
        currWidth = sequences.width + abs(mouseX - mouseDownPosition.x) * 2;
    }
    return Math.min(Math.max(currWidth, sequences.tileSize * 2),  width - (width % sequences.tileSize)) ;
}

function randomColor() {
    var r = random(0, 360);
    colorMode(HSB);
    var c = color(r, 80, 100);
    colorMode(RGB);
    return c;
}

function randomComplimentaryColors() {
    var r = random(0, 360);

    colorMode(HSB);
    var c = color(r, 80, 100);
    var c2 = color(abs(180-r), 80, 100);
    colorMode(RGB);
    return [c, c2];
}

var playPauseButton = document.querySelector('.play-pause-button');
playPauseButton.addEventListener('click', togglePlayback);

Tone.Transport
    .on('start', function(){ playPauseButton.classList.add('active'); })
    .on('pause', function(){ playPauseButton.classList.remove('active'); });

