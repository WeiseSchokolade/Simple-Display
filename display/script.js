import { showSlideOnElement, updateElementWithSlideData, displayDigitalClockOnElement } from "./slide.js";

const dynamicContent = document.getElementById("dynamicContent");
const extraClock = document.getElementById("extraClock");
let configData;
let compositionData;
let compositionMap;
let slideData;
let slideMap;

let displayedComposition;

let slideDisplayStateMachines = [];

let compositionUpdateInterval = -1;
let compositionConditionContext;

function showError(message) {
    dynamicContent.innerHTML = "";
    dynamicContent.textContent = `
        Ein Fehler ist aufgetreten: ${message}
    `;
}

async function loadDataFile(name) {
    let response = await fetch(`../data/${name}.json`, {cache: 'reload'});
    if (!response.ok) {
        showError("" + name + " konnte nicht geladen werden: " + response.status + " " + response.statusText);
        return undefined;
    }
    try {
        let data = await response.json();
        return data;
    } catch (error) {
        showError("" + name + " konnte nicht verarbeitet werden.");
        return undefined;
    }
}

async function reload() {
    if (!(configData = await loadDataFile("config"))) return false;
    if (!(compositionData = await loadDataFile("compositions"))) return false;
    if (!(slideData = await loadDataFile("slides"))) return false;
    if (compositionData.length == 0) {
        showError("Keine Komposition zum Anzeigen verfügbar.");
        return false;
    }
    compositionMap = {};
    for (let i = 0; i < compositionData.length; i++) {
        let composition = compositionData[i];
        compositionMap[composition.name] = composition;
    }
    slideMap = {};
    for (let i = 0; i < slideData.length; i++) {
        let slide = slideData[i];
        slideMap[slide.name] = slide;
    }
    let chosenCompositionKey = configData["composition"] ? configData.composition : compositionData[0].name;
    if (!displayNextComposition(chosenCompositionKey)) {
        return false;
    }
    if (compositionUpdateInterval == -1) {
        clearInterval(compositionUpdateInterval);
    }
    compositionUpdateInterval = setInterval(() => {
        if (!checkCondition(displayComposition.condition, compositionConditionContext)) {
            displayNextComposition(displayedComposition.next);
        }
        
        for (let i = 0; i < slideDisplayStateMachines.length; i++) {
            let displayMachine = slideDisplayStateMachines[i];
            updateSlides(displayMachine);
            if (!checkCondition(displayMachine.slideReferences[displayMachine.slideIndex].condition,
                displayMachine.conditionContext)) {
                displayMachine.slideIndex += 1;
                if (displayMachine.slideIndex >= displayMachine.slideReferences.length) {
                    displayMachine.slideIndex = 0;
                }
                displayMachine.conditionContext = {};
                let slide = slideMap[displayMachine.slideReferences[displayMachine.slideIndex].name];
                if (!slide) return showSlideError(element, "Couldn't display slide " + displayMachine.slideReferences[displayMachine.slideIndex].name);
                showSlideOnElement(displayMachine.element, slide);
            }
        }

        if (displayComposition.hasClock) {
            displayDigitalClockOnElement(extraClock);
            extraClock.style.display = "flex";
        } else {
            extraClock.style.display = "none";
        }
    }, 100);
}

function checkCondition(condition, context) {
    switch (condition.type) {
        case "duration":
            if (!context.firstCheck) {
                context.firstCheck = Date.now();
            }
            return context.firstCheck + condition.duration * 1000 > Date.now();
        case "none":
        case null:
            return true;
        default:
            showError("Bedingung konnte nicht überprüft werden: " + JSON.stringify(condition));
            return false;
    }
}

// Compositions
function displayNextComposition(key) {
    compositionConditionContext = {};
    const maxLoops = 1000;
    let loops = 0;
    while (loops < maxLoops) {
        let selectedComposition = compositionMap[key];
        if (selectedComposition) {
            if (checkCondition(selectedComposition.condition, compositionConditionContext)) {
                return displayComposition(selectedComposition);
            } else {
                key = selectedComposition.next;
                if (key == null) {
                    showError(`Komposition ${key} soll nicht angezeigt werden, bietet aber keine Alternative.`);
                    return false;
                }
            }
        } else {
            showError(`Ausgewählte Komposition konnte nicht gefunden werden. Name: ${key}`);
            return false;
        }
        loops++;
    }
    if (loops >= maxLoops) {
        showError(`Die Bedingungen der ersten ${maxLoops} Kompositionen konnten nicht erfüllt werden.`);
        return false;
    }
    // This code _should_ be unreachable in practice. 
    return displayComposition(conditionMap[key]);
}

function displayComposition(composition) {
    let compositionFunction = compositionFunctions[composition.type];
    if (!compositionFunction) {
        showError("Unbekannter Kompositionstyp " + composition.type);
        return false;
    }
    displayComposition = composition;
    compositionFunction(dynamicContent, composition);
    return true;
}

const compositionFunctions = {
    filled: (dynamicContent, composition) => {
        dynamicContent.innerHTML = `
            <div class="maximized">
            </div>
        `;
        displaySlides(dynamicContent.firstElementChild, composition.slides[0]);
    },
    split2: (dynamicContent, composition) => {
        dynamicContent.innerHTML = `
            <div class="composition">
                <div class="maximized"></div>
                <div class="maximized"></div>
            </div>
        `;
        displaySlides(dynamicContent.firstElementChild.children[0], composition.slides[0]);
        displaySlides(dynamicContent.firstElementChild.children[1], composition.slides[1]);
    },
    weightedLeft: (dynamicContent, composition) => {
        dynamicContent.innerHTML = `
            <div class="composition">
                <div class="maximized horizontalThird"></div>
                <div class="maximized horizontalTwoThirds"></div>
            </div>
        `;
        displaySlides(dynamicContent.firstElementChild.children[0], composition.slides[0]);
        displaySlides(dynamicContent.firstElementChild.children[1], composition.slides[1]);
    },
    split3: (dynamicContent, composition) => {
        dynamicContent.innerHTML = `
            <div class="composition">
                <div class="maximized"></div>
                <div class="maximized"></div>
                <div class="maximized"></div>
            </div>
        `;
        displaySlides(dynamicContent.firstElementChild.children[0], composition.slides[0]);
        displaySlides(dynamicContent.firstElementChild.children[1], composition.slides[1]);
        displaySlides(dynamicContent.firstElementChild.children[2], composition.slides[2]);
    },
    split3clock: (dynamicContent, composition) => {
        dynamicContent.innerHTML = `
            <div class="composition">
                <div class="maximized"></div>
                <div class="maximized">
                    <div class="verticalThird"></div>
                    <div class="verticalTwoThirds"></div>
                </div>
                <div class="maximized"></div>
            </div>
        `;
        displaySlides(dynamicContent.firstElementChild.children[0], composition.slides[0]);
        displaySlides(dynamicContent.firstElementChild.children[1].children[0], composition.slides[1]);
        displaySlides(dynamicContent.firstElementChild.children[1].children[1], composition.slides[2]);
        displaySlides(dynamicContent.firstElementChild.children[2], composition.slides[3]);
    }
};


// Slides
function displaySlides(element, slides) {
    let displayMachine = {
        element: element,
        slideReferences: slides,
        slideIndex: 0,
        conditionContext: {}
    };
    slideDisplayStateMachines.push(displayMachine);
    let slide = slideMap[slides[displayMachine.slideIndex].name];
    if (!slide) return showSlideError(element, "Couldn't display slide " + slides[displayMachine.slideIndex].name);
    showSlideOnElement(element, slide);
}


function updateSlides(displayMachine) {
    let slide = slideMap[displayMachine.slideReferences[displayMachine.slideIndex].name];
    updateElementWithSlideData(displayMachine.element, slide);
}

reload();