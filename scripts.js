const keyboard = document.getElementById("keyboard");
const keySelect = document.getElementById("key");
const majorMinorSelect = document.getElementById("major-minor");
const soundTypeSelect = document.getElementById("sound-type");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const pitchToNote = {
    0: "A",
    1: "A#",
    2: "B",
    3: "C",
    4: "C#",
    5: "D",
    6: "D#",
    7: "E",
    8: "F",
    9: "F#",
    10: "G",
    11: "G#",
};
const majorScale = [0, 2, 4, 5, 7, 9, 11];
const minorScale = [0, 2, 3, 5, 7, 8, 10];

let startingNote = -21;
let scaleOffsets = majorScale;
let soundType = "sawtooth";

let scale = [];
let oscillators = {};
let oscillatorsPlaying = {};

function generateScale() {
    scale = [];
    for (let i = 0; i < 4; i++) {
        scale = scale.concat(
            scaleOffsets.map(offset => startingNote + offset + i * 12)
        );
    }
    scale.push(startingNote + 48);

    let notesHTML = "";
    for (const note of scale) {
        notesHTML +=
            '<div class="note" id="' +
            note +
            '"><img src="assets/blank.svg" draggable="false" />' +
            pitchToNote[((note % 12) + 12) % 12] +
            "</div>";
    }

    keyboard.innerHTML = notesHTML;

    for (const note of scale) {
        oscillators[note] = newOscillatorFromNote(note);
        oscillatorsPlaying[note] = false;
        const noteHTML = document.getElementById(note);
        noteHTML.addEventListener("mousedown", function (e) {
            playNote(note);
        });
    }
}

function playNote(note) {
    oscillators[note].start();
    oscillatorsPlaying[note] = true;
}

function stopAllNotes(delay = 0) {
    for (const note of scale) {
        if (oscillatorsPlaying[note]) {
            oscillators[note].stop(audioContext.currentTime + delay);
            oscillators[note] = newOscillatorFromNote(note);
            oscillatorsPlaying[note] = false;
        }
    }
}

function newOscillatorFromNote(note) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = soundType;
    oscillator.frequency.setValueAtTime(
        440 * 2 ** (note / 12),
        audioContext.currentTime
    );
    oscillator.connect(audioContext.destination);
    return oscillator;
}

document.addEventListener("mouseup", function (e) {
    stopAllNotes(0.1);
});

keySelect.addEventListener("change", function (e) {
    startingNote = Number(keySelect.value);
    generateScale();
})

majorMinorSelect.addEventListener("change", function (e) {
    if (majorMinorSelect.value === "major") {
        scaleOffsets = majorScale;
    } else {
        scaleOffsets = minorScale;
    }
    generateScale();
});

soundTypeSelect.addEventListener("change", function (e) {
    soundType = soundTypeSelect.value;
    generateScale();
});

generateScale();
