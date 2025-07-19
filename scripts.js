const keyboard = document.getElementById("keyboard");
const keySelect = document.getElementById("key");
const majorMinorSelect = document.getElementById("major-minor");
const soundTypeSelect = document.getElementById("sound-type");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const Components = {
    None: "none",
    RightShifter: "right-shifter",
    LeftShifter: "left-shifter",
};
const componentImages = {
    [Components.None]: "assets/blank.svg",
    [Components.RightShifter]: "assets/right-shifter.svg",
    [Components.LeftShifter]: "assets/left-shifter.svg",
};

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

let currentSelectedComponent = "";
let placedComponents = Array(29).fill(Components.None);

let scale = [];
let oscillators = {};
let oscillatorsPlaying = {};

function generateScale() {
    scale = [];
    for (let i = 0; i < 4; i++) {
        scale = scale.concat(scaleOffsets.map(offset => startingNote + offset + i * 12));
    }
    scale.push(startingNote + 48);

    let notesHTML = "";
    for (const note of scale) {
        notesHTML += `<div class="note" id="${note}">
                          <img src="assets/blank.svg" draggable="false" />
                          ${pitchToNote[((note % 12) + 12) % 12]}
                      </div>`;
    }

    keyboard.innerHTML = notesHTML;

    for (const [i, note] of scale.entries()) {
        oscillators[note] = newOscillatorFromNote(note);
        oscillatorsPlaying[note] = false;
        const noteElem = document.getElementById(note);
        const img = noteElem.querySelector("img");
        img.src = componentImages[placedComponents[i]];

        noteElem.addEventListener("mousedown", function () {
            playNote(note);
            if (currentSelectedComponent) {
                const img = noteElem.querySelector("img");
                placedComponents[i] = currentSelectedComponent;
                img.src = componentImages[currentSelectedComponent];
                img.style.opacity = "1";
            }
        });

        noteElem.addEventListener("mouseenter", function () {
            if (currentSelectedComponent) {
                const img = noteElem.querySelector("img");
                if (currentSelectedComponent === Components.None) {
                    img.src = componentImages[placedComponents[i]];
                    img.style.opacity = "0.3";
                } else {
                    img.src = componentImages[currentSelectedComponent];
                    img.style.opacity = "0.5";
                }
            }
        });

        noteElem.addEventListener("mouseleave", function () {
            if (currentSelectedComponent) {
                const img = noteElem.querySelector("img");
                img.src = componentImages[placedComponents[i]];
                img.style.opacity = "1";
            }
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
    oscillator.frequency.setValueAtTime(440 * 2 ** (note / 12), audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    return oscillator;
}

document.addEventListener("mouseup", function () {
    stopAllNotes(0.1);
});

keySelect.addEventListener("change", function () {
    startingNote = Number(keySelect.value);
    generateScale();
});

majorMinorSelect.addEventListener("change", function () {
    if (majorMinorSelect.value === "major") {
        scaleOffsets = majorScale;
    } else {
        scaleOffsets = minorScale;
    }
    generateScale();
});

soundTypeSelect.addEventListener("change", function () {
    soundType = soundTypeSelect.value;
    generateScale();
});

document.querySelectorAll("#component-panel li").forEach(li => {
    li.addEventListener("click", function () {
        document.querySelector("#component-panel li.selected").classList.remove("selected");
        this.classList.add("selected");
        currentSelectedComponent = this.dataset.component;
    });
});

generateScale();
