const keyboard = document.getElementById("keyboard");

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
const startingNote = -21;

let oscillators = {};
let oscillatorsPlaying = {};

let scale = [];
for (let i = 0; i < 4; i++) {
    scale = scale.concat(
        majorScale.map(offset => startingNote + offset + i * 12)
    );
}
scale.push(startingNote + 48);

let notesHTML = "";
for (const note of scale) {
    notesHTML +=
        '<div class="note" id="' +
        note +
        '">' +
        pitchToNote[((note % 12) + 12) % 12] +
        "</div>";
}

keyboard.innerHTML = notesHTML;

for (const note of scale) {
    oscillators[note] = newOscillatorFromNote(note);
    oscillatorsPlaying[note] = false;
    const noteHTML = document.getElementById(note);
    noteHTML.addEventListener("mousedown", function (e) {
        onNotePressed(note);
    });
}
document.addEventListener("mouseup", function (e) {
    onMouseReleased();
});

function onNotePressed(note) {
    oscillators[note].start();
    oscillatorsPlaying[note] = true;
}

function onMouseReleased() {
    for (const note of scale) {
        if (oscillatorsPlaying[note]) {
            oscillators[note].stop(audioContext.currentTime + 0.1);
            oscillators[note] = newOscillatorFromNote(note);
            oscillatorsPlaying[note] = false;
        }
    }
}

function newOscillatorFromNote(note) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
        440 * 2 ** (note / 12),
        audioContext.currentTime
    );
    oscillator.connect(audioContext.destination);
    return oscillator;
}
