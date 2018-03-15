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




// generates an array where indices correspond to midi notes
var everyNote = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B,'.repeat(20).split(',').map( function(x,i) {
    return x + '' + Math.floor(i/12);
});

//returns the midi pitch value for the given note.
//returns -1 if not found
function toMidi(note) {
    return everyNote.indexOf(note);
}

var presetMelodies = {
    'Twinkle' : {
        notes: [
            {pitch: 60, quantizedStartStep: 0, quantizedEndStep: 2},
            {pitch: 60, quantizedStartStep: 2, quantizedEndStep: 4},
            {pitch: 67, quantizedStartStep: 4, quantizedEndStep: 6},
            {pitch: 67, quantizedStartStep: 6, quantizedEndStep: 8},
            {pitch: 69, quantizedStartStep: 8, quantizedEndStep: 10},
            {pitch: 69, quantizedStartStep: 10, quantizedEndStep: 12},
            {pitch: 67, quantizedStartStep: 12, quantizedEndStep: 16},
            {pitch: 65, quantizedStartStep: 16, quantizedEndStep: 18},
            {pitch: 65, quantizedStartStep: 18, quantizedEndStep: 20},
            {pitch: 64, quantizedStartStep: 20, quantizedEndStep: 22},
            {pitch: 64, quantizedStartStep: 22, quantizedEndStep: 24},
            {pitch: 62, quantizedStartStep: 24, quantizedEndStep: 26},
            {pitch: 62, quantizedStartStep: 26, quantizedEndStep: 28},
            {pitch: 60, quantizedStartStep: 28, quantizedEndStep: 32}
        ],
        color : [113, 20, 221]
    },
    'Sparse' : {
        notes:[
            {pitch: 64, quantizedStartStep: 0, quantizedEndStep: 1},
            {pitch: 62, quantizedStartStep: 1, quantizedEndStep: 2},
            {pitch: 64, quantizedStartStep: 2, quantizedEndStep: 3},
            {pitch: 65, quantizedStartStep: 3, quantizedEndStep: 4},
            {pitch: 67, quantizedStartStep: 4, quantizedEndStep: 8},
            {pitch: 60, quantizedStartStep: 16, quantizedEndStep: 17},
            {pitch: 59, quantizedStartStep: 17, quantizedEndStep: 18},
            {pitch: 60, quantizedStartStep: 18, quantizedEndStep: 19},
            {pitch: 62, quantizedStartStep: 19, quantizedEndStep: 20},
            {pitch: 64, quantizedStartStep: 20, quantizedEndStep: 24}
        ],
        color : [245, 109, 49]
    },
     'Arpeggiated' : {
        notes : [
            {pitch: 48, quantizedStartStep: 0, quantizedEndStep: 2},
            {pitch: 52, quantizedStartStep: 2, quantizedEndStep: 4},
            {pitch: 55, quantizedStartStep: 4, quantizedEndStep: 6},
            {pitch: 60, quantizedStartStep: 6, quantizedEndStep: 8},
            {pitch: 64, quantizedStartStep: 8, quantizedEndStep: 10},
            {pitch: 67, quantizedStartStep: 10, quantizedEndStep: 12},
            {pitch: 64, quantizedStartStep: 12, quantizedEndStep: 14},
            {pitch: 60, quantizedStartStep: 14, quantizedEndStep: 16},
            {pitch: 57, quantizedStartStep: 16, quantizedEndStep: 18},
            {pitch: 60, quantizedStartStep: 18, quantizedEndStep: 20},
            {pitch: 64, quantizedStartStep: 20, quantizedEndStep: 22},
            {pitch: 69, quantizedStartStep: 22, quantizedEndStep: 24},
            {pitch: 72, quantizedStartStep: 24, quantizedEndStep: 26},
            {pitch: 76, quantizedStartStep: 26, quantizedEndStep: 28},
            {pitch: 72, quantizedStartStep: 28, quantizedEndStep: 30},
            {pitch: 69, quantizedStartStep: 30, quantizedEndStep: 32}
		],

        color : [221, 219, 20]
    },
    // 'Dense' : {
    //     notes:[
    //         {pitch: 72, quantizedStartStep: 0, quantizedEndStep: 1},
    //         {pitch: 75, quantizedStartStep: 1, quantizedEndStep: 2},
    //         {pitch: 80, quantizedStartStep: 2, quantizedEndStep: 3},
    //         {pitch: 75, quantizedStartStep: 3, quantizedEndStep: 4},
    //         {pitch: 84, quantizedStartStep: 4, quantizedEndStep: 5},
    //         {pitch: 80, quantizedStartStep: 5, quantizedEndStep: 6},
    //         {pitch: 75, quantizedStartStep: 6, quantizedEndStep: 7},
    //         {pitch: 72, quantizedStartStep: 7, quantizedEndStep: 8},
    //         {pitch: 74, quantizedStartStep: 8, quantizedEndStep: 9},
    //         {pitch: 77, quantizedStartStep: 9, quantizedEndStep: 10},
    //         {pitch: 82, quantizedStartStep: 10, quantizedEndStep: 11},
    //         {pitch: 77, quantizedStartStep: 11, quantizedEndStep: 12},
    //         {pitch: 86, quantizedStartStep: 12, quantizedEndStep: 13},
    //         {pitch: 82, quantizedStartStep: 13, quantizedEndStep: 14},
    //         {pitch: 77, quantizedStartStep: 14, quantizedEndStep: 15},
    //         {pitch: 74, quantizedStartStep: 15, quantizedEndStep: 16},
    //         {pitch: 75, quantizedStartStep: 16, quantizedEndStep: 17},
    //         {pitch: 79, quantizedStartStep: 17, quantizedEndStep: 18},
    //         {pitch: 84, quantizedStartStep: 18, quantizedEndStep: 19},
    //         {pitch: 79, quantizedStartStep: 19, quantizedEndStep: 20},
    //         {pitch: 87, quantizedStartStep: 20, quantizedEndStep: 21},
    //         {pitch: 84, quantizedStartStep: 21, quantizedEndStep: 22},
    //         {pitch: 79, quantizedStartStep: 22, quantizedEndStep: 23},
    //         {pitch: 75, quantizedStartStep: 23, quantizedEndStep: 24},
    //         {pitch: 75, quantizedStartStep: 24, quantizedEndStep: 25},
    //         {pitch: 79, quantizedStartStep: 25, quantizedEndStep: 26},
    //         {pitch: 84, quantizedStartStep: 26, quantizedEndStep: 27},
    //         {pitch: 84, quantizedStartStep: 27, quantizedEndStep: 28},
    //         {pitch: 87, quantizedStartStep: 28, quantizedEndStep: 29},
    //         {pitch: 91, quantizedStartStep: 29, quantizedEndStep: 30},
    //         {pitch: 84, quantizedStartStep: 30, quantizedEndStep: 31},
    //         {pitch: 91, quantizedStartStep: 31, quantizedEndStep: 32}
    //     ],
    //     color : [242, 61, 91]
    // },
    'Bounce' : {
        notes:[
            {pitch: 64, quantizedStartStep: 0, quantizedEndStep: 2},
            {pitch: 60, quantizedStartStep: 2, quantizedEndStep: 4},
            {pitch: 64, quantizedStartStep: 4, quantizedEndStep: 6},
            {pitch: 60, quantizedStartStep: 6, quantizedEndStep: 8},
            {pitch: 65, quantizedStartStep: 8, quantizedEndStep: 10},
            {pitch: 60, quantizedStartStep: 10, quantizedEndStep: 12},
            {pitch: 65, quantizedStartStep: 12, quantizedEndStep: 14},
            {pitch: 60, quantizedStartStep: 14, quantizedEndStep: 16},
            {pitch: 67, quantizedStartStep: 16, quantizedEndStep: 18},
            {pitch: 60, quantizedStartStep: 18, quantizedEndStep: 20},
            {pitch: 67, quantizedStartStep: 20, quantizedEndStep: 22},
            {pitch: 60, quantizedStartStep: 22, quantizedEndStep: 24},
            {pitch: 62, quantizedStartStep: 24, quantizedEndStep: 26},
            {pitch: 59, quantizedStartStep: 26, quantizedEndStep: 28},
            {pitch: 62, quantizedStartStep: 28, quantizedEndStep: 30},
            {pitch: 59, quantizedStartStep: 30, quantizedEndStep: 32}
        ],
        color : [221, 44, 87]
    },
    /*
    'Melody 1' : {
        notes: [
            {pitch: toMidi('A3'), quantizedStartStep: 0, quantizedEndStep: 4},
            {pitch: toMidi('D4'), quantizedStartStep: 4, quantizedEndStep: 6},
            {pitch: toMidi('E4'), quantizedStartStep: 6, quantizedEndStep: 8},
            {pitch: toMidi('F4'), quantizedStartStep: 8, quantizedEndStep: 10},
            {pitch: toMidi('D4'), quantizedStartStep: 10, quantizedEndStep: 12},
            {pitch: toMidi('E4'), quantizedStartStep: 12, quantizedEndStep: 16},
            {pitch: toMidi('C4'), quantizedStartStep: 16, quantizedEndStep: 20},
            {pitch: toMidi('D4'), quantizedStartStep: 20, quantizedEndStep: 26},
            {pitch: toMidi('A3'), quantizedStartStep: 26, quantizedEndStep: 28},
            {pitch: toMidi('A3'), quantizedStartStep: 28, quantizedEndStep: 32}
        ],
        color : [242, 61, 91]
    },
    'Melody 2' : {
        notes: [
            {pitch: 50, quantizedStartStep: 0, quantizedEndStep: 1},
            {pitch: 53, quantizedStartStep: 1, quantizedEndStep: 2},
            {pitch: 58, quantizedStartStep: 2, quantizedEndStep: 3},
            {pitch: 58, quantizedStartStep: 3, quantizedEndStep: 4},
            {pitch: 58, quantizedStartStep: 4, quantizedEndStep: 5},
            {pitch: 53, quantizedStartStep: 5, quantizedEndStep: 6},
            {pitch: 53, quantizedStartStep: 6, quantizedEndStep: 7},
            {pitch: 53, quantizedStartStep: 7, quantizedEndStep: 8},
            {pitch: 52, quantizedStartStep: 8, quantizedEndStep: 9},
            {pitch: 55, quantizedStartStep: 9, quantizedEndStep: 10},
            {pitch: 60, quantizedStartStep: 10, quantizedEndStep: 11},
            {pitch: 60, quantizedStartStep: 11, quantizedEndStep: 12},
            {pitch: 60, quantizedStartStep: 12, quantizedEndStep: 13},
            {pitch: 60, quantizedStartStep: 13, quantizedEndStep: 14},
            {pitch: 60, quantizedStartStep: 14, quantizedEndStep: 15},
            {pitch: 52, quantizedStartStep: 15, quantizedEndStep: 16},
            {pitch: 57, quantizedStartStep: 16, quantizedEndStep: 17},
            {pitch: 57, quantizedStartStep: 17, quantizedEndStep: 18},
            {pitch: 57, quantizedStartStep: 18, quantizedEndStep: 19},
            {pitch: 65, quantizedStartStep: 19, quantizedEndStep: 20},
            {pitch: 65, quantizedStartStep: 20, quantizedEndStep: 21},
            {pitch: 65, quantizedStartStep: 21, quantizedEndStep: 22},
            {pitch: 57, quantizedStartStep: 22, quantizedEndStep: 23},
            {pitch: 57, quantizedStartStep: 23, quantizedEndStep: 24},
            {pitch: 57, quantizedStartStep: 24, quantizedEndStep: 25},
            {pitch: 57, quantizedStartStep: 25, quantizedEndStep: 26},
            {pitch: 62, quantizedStartStep: 26, quantizedEndStep: 27},
            {pitch: 62, quantizedStartStep: 27, quantizedEndStep: 28},
            {pitch: 65, quantizedStartStep: 28, quantizedEndStep: 29},
            {pitch: 65, quantizedStartStep: 29, quantizedEndStep: 30},
            {pitch: 69, quantizedStartStep: 30, quantizedEndStep: 31},
            {pitch: 69, quantizedStartStep: 31, quantizedEndStep: 32}
        ],
        color : [108, 57, 234]
    },
    */
};

