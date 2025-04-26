import { showPreviewOnElement } from "../display/slide.js";

const dynamicContent = document.getElementById("dynamicContent");
const navigationBar = document.getElementById("navigationBar");

let token = "My Token";

let compositions;
let compositionMap;
let slides;
let slideMap;

async function reloadData() {
    let compositionData = await fetch(`../data/compositions.json`, {cache: 'reload'});
    compositions = await compositionData.json();
    compositionMap = {};
    compositions.forEach(e => compositionMap[e.id] = e);
    let slideData = await fetch(`../data/slides.json`, {cache: 'reload'});
    slides = await slideData.json();
    slideMap = {};
    slides.forEach(e => slideMap[e.id] = e);
}

let pages = {
    "index": {
        title: "Übersicht",
        dynamicContent: `
            Willkommen bei dieser Übersicht.
        `,
        init: async (element) => {
            loading(element);
            await reloadData();
            showEditCompositionPage(compositions[0]);
        }
    },
    "compositions": {
        title: "Kompositionen",
        init: async (element) => {
            const root = document.createElement("div");
            root.classList.add("maximized");
            root.classList.add("compositionList");
            root.classList.add("scrollable");
            for (let i = 0; i < compositions.length; i++) {
                let composition = compositions[i];
                root.insertAdjacentHTML("beforeend", `
                    <button class="compositionItem primaryTintedBackground">
                        <div class="compositionTypePreviewRoot"></div>
                        <div>Name: ${composition.name}</div>
                        <div>Typ: ${composition.type}</div>
                    </button>
                `);
                root.lastElementChild.onclick = () => {
                    showEditCompositionPage(composition);
                }
                renderCompositionType(root.lastElementChild.firstElementChild, composition.type);
            }
            root.insertAdjacentHTML("beforeend", `
                <button class="addComposition compositionItem">
                    <div class="compositionTypePreviewRoot compositionType flexCentered maximized"><div class="centeredPlus">+</div></div>
                    <div>Neue Komposition hinzufügen</div>
                </button>
            `);
            root.lastElementChild.onclick = () => {
                addTemporaryPage({
                    title: "Komposition hinzufügen",
                    dynamicContent: `
                        <div class="flexColumn">
                            <form id="compositionCreationForm">
                            <div class="flex">
                                <label for="compositionNameInput">Namen: </label>
                                <input required id="compositionNameInput" name="compositionNameInput" type="text" />
                            </div>
                            <div class="flex">
                                <label for="compositionExtraClockCheck">Extra Uhr: </label>
                                <input id="compositionExtraClockCheck" type="checkbox"></input>
                            </div>
                            <div class="flex flexColumn">
                                <div>Typen: </div>
                                <div id="typeButtonContainer" class="flex">
                                    <button>Ausgefüllt</button>
                                    <button>Zweigeteilt</button>
                                    <button>Rechts gewichtet</button>
                                    <button>Dreigeteilt</button>
                                    <button>Dreigeteilt mit Uhr</button>
                                </div>
                            </div>
                            <div class="flex">
                                <input id="createCompositionButton" type="submit" value="Erstellen" />
                            </div>
                            </form>
                        </div>
                    `,
                    init: (element) => {
                        let typeButtons = document.querySelector("#typeButtonContainer").children;
                        const types = ["filled", "split2", "weightedLeft", "split3", "split3clock"]
                        let selectedType = 0;
                        for (let i = 0; i < typeButtons.length; i++) {
                            const typeButton = typeButtons[i];
                            const index = i;
                            if (index == selectedType) typeButton.setAttribute("disabled", "disabled");
                            typeButton.onclick = () => {
                                typeButtons[selectedType].removeAttribute("disabled");
                                typeButton.setAttribute("disabled", "disabled");
                                selectedType = i;
                            }
                            renderCompositionType(typeButton, types[i]);
                        }
                        document.querySelector("#compositionCreationForm").onsubmit = async (e) => {
                            e.preventDefault();
                            let url = new URL("./create_composition.php", window.location.href);
                            url.searchParams.append("name", document.querySelector("#compositionNameInput").value);
                            url.searchParams.append("extraClock", document.querySelector("#compositionExtraClockCheck").checked);
                            url.searchParams.append("type", types[selectedType]);
                            let response = await fetch(url, {
                                method: "POST",
                                headers: {
                                    Authorization: token
                                }
                            });
                            if (response.ok) {
                                showEditCompositionPage(await response.json());
                            } else {
                                switch (response.status) {
                                    case 401:
                                        alert("Fehlende Authentifizierung");
                                        break;
                                    case 400:
                                        alert("Schlechte Angaben");
                                        break;
                                    default:
                                        alert("Ein Fehler ist aufgetreten: " + response.status + " " + response.statusText);
                                        break;
                                }
                                return;
                            }
                        };
                    }
                });
            }
            element.innerHTML = "";
            element.appendChild(root);
        }
    },
    "slides": {
        title: "Folien",
        init: async (element) => {
            loading(element);
            let slideData = await fetch(`../data/slides.json`, {cache: 'reload'});
            let slides = await slideData.json();
            const root = document.createElement("div");
            root.classList.add("maximized");
            root.classList.add("compositionList");
            for (let i = 0; i < slides.length; i++) {
                let slide = slides[i];
                root.innerHTML += `
                    <div class="compositionItem">
                        <div class="compositionTypePreviewRoot"></div>
                        <div>Name: ${slide.name}</div>
                        <div>Typ: ${slide.type}</div>
                    </div>
                `;
                renderSlideType(root.lastElementChild.firstElementChild, slide.type);
            }
            root.innerHTML += `
                <button class="addComposition">
                    <div class="compositionTypePreviewRoot compositionType flexCentered maximized"><div class="centeredPlus">+</div></div>
                    <div>Neue Folie hinzufügen</div>
                </button>
            `;
            element.innerHTML = "";
            element.appendChild(root);
        }
    },
};
let currentPage = null;

function loadPage(key, force=false) {
    if (currentPage == key && !force) return;
    if (currentPage != null) currentPage.navbarElement.classList.remove("selectedNavbarItem");
    currentPage = pages[key];
    document.title = currentPage.title;
    dynamicContent.innerHTML = currentPage.dynamicContent ? currentPage.dynamicContent : "";
    if (currentPage.init) currentPage.init(dynamicContent);

    for (let pageKey in pages) {
        if (pages.hasOwnProperty(pageKey)) {
            let page = pages[pageKey];
            if (page == currentPage) {
                currentPage.navbarElement.classList.add("selectedNavbarItem");
            }
            if (page.isTemporary && pageKey != key) {
                navigationBar.removeChild(pages[pageKey].navbarElement);
                delete pages[pageKey];
                continue;
            }
        }
    }
}

function reloadNavbar() {
    navigationBar.innerHTML = "";
    
    for (let pageKey in pages) {
        if (pages.hasOwnProperty(pageKey)) {
            let page = pages[pageKey];
            if (page.isTemporary) {
                delete pages[pageKey];
                continue;
            }
            const button = document.createElement("button");
            button.classList.add("navbarItem");
            button.textContent = page.title;
            button.onclick = () => {
                loadPage(pageKey);
            }
            navigationBar.appendChild(button);
            page.navbarElement = button;
        }
    }
}

function addPageToNavbar(page) {
    const button = document.createElement("button");
    button.classList.add("navbarItem");
    button.textContent = page.title;
    button.onclick = () => {
        loadPage(pageKey);
    }
    navigationBar.appendChild(button);
    return button;
}

function addTemporaryPage(page) {
    pages[page.title] = page;
    page.isTemporary = true;
    page.navbarElement = addPageToNavbar(page);
    loadPage(page.title);
}

function loading(element) {
    element.innerHTML = `
        <div class="maximized flexCentered">
            <div class="loadingIndicator"></div>
        </div>
    `;
}

function renderCompositionType(element, type, selectionClass="") {
    switch (type) {
        case "filled":
            element.innerHTML = `
                <div class="compositionType maximized ${selectionClass}"></div>
            `;
            break;
        case "split2":
            element.innerHTML = `
                <div class="compositionType maximized halfWidth ${selectionClass}"></div>
                <div class="compositionType maximized halfWidth ${selectionClass}"></div>
            `;
            break;
        case "weightedLeft":
            element.innerHTML = `
                <div class="compositionType maximized thirdWidth ${selectionClass}"></div>
                <div class="compositionType maximized twoThirdsWidth ${selectionClass}"></div>
            `;
            break;
        case "split3":
            element.innerHTML = `
                <div class="compositionType maximized thirdWidth ${selectionClass}"></div>
                <div class="compositionType maximized thirdWidth ${selectionClass}"></div>
                <div class="compositionType maximized thirdWidth ${selectionClass}"></div>
            `;
            break;
        case "split3clock":
            element.innerHTML = `
                <div class="compositionType maximized thirdWidth ${selectionClass}"></div>
                <div class="flexColumn maximized thirdWidth">
                    <div class="compositionType maximized thirdHeight ${selectionClass}"></div>
                    <div class="compositionType maximized twoThirdsHeight ${selectionClass}"></div>
                </div>
                <div class="compositionType maximized thirdWidth ${selectionClass}"></div>
            `;
            break;
    }
}

function renderSlideType(element, type) {
    switch (type) {
        case "html":
            element.innerHTML = `
                <div class="compositionType maximized flexCentered">HTML</div>
            `;
            break;
        case "digitalClock":
            element.innerHTML = `
                <div class="compositionType maximized flexColumn flexCentered">
                    <span>Stunden:Minuten</span>
                    <span>Datum</span>
                </div>
            `;
            break;
        case "image":
            element.innerHTML = `
                <div class="compositionType maximized flexCentered">Bild</div>
            `;
            break;
        case "article":
            element.innerHTML = `
                <div class="compositionType maximized flexColumn">
                    <b>Überschrift</b>
                    <p>Inhalt</p>
                </div>
            `;
            break;
    }
}

function showEditCompositionPage(composition) {
    addTemporaryPage({
        title: "Komposition bearbeiten",
        dynamicContent: `
        <div class="flexColumn maximized ">
            <div class="flex maximized">
                <div class="maximized flexColumn">
                    <div class="maximized thirdHeight">
                        <div class="flexColumn">
                            <span>Id: ${composition.id}</span>
                            <span>Name: ${composition.name}</span>
                            <span>Typ: ${composition.type}</span>
                        </div>
                    </div>
                    <div class="maximized flexCentered compositionPreviewContainer">
                        <div id="compositionTypePreviewRoot" class="compositionTypePreviewRoot compositionPreview">
                        </div>
                    </div>
                </div>
                <div class="maximized halfWidth flexColumn" id="compositionSlideList">
                    <div class="maximized flexCentered">
                        Wähle einen Bereich aus, um zu Beginnen
                    </div>
                </div>
            </div>
        </div>
        `,
        init: () => {
            renderCompositionType(document.querySelector("#compositionTypePreviewRoot"), composition.type, "compositionEditPreviewClickable flexCentered");
            let elements = document.getElementsByClassName("compositionEditPreviewClickable");
            const compositionSlideList = document.getElementById("compositionSlideList");
            let selectedElement = null;
            function select(element, index) {
                if (selectedElement != null) {
                    selectedElement.classList.replace("compositionEditPreviewClicked", "compositionEditPreviewClickable");
                    selectedElement.textContent = "Bearbeiten";
                }
                selectedElement = element;
                selectedElement.classList.replace("compositionEditPreviewClickable", "compositionEditPreviewClicked");
                selectedElement.textContent = "Ausgewählt";
                let classes = new Set();
                function addElementClasses(element) {
                    element.classList.forEach(e => classes.add(e));
                    if (!element.parentElement.classList.contains("compositionPreview")) {
                        addElementClasses(element.parentElement);
                    }
                }
                addElementClasses(selectedElement);
                let formatClasses = Array.from(classes).filter(e => !(
                    e == "compositionEditPreviewClickable" ||
                    e == "compositionEditPreviewClicked" ||
                    e == "compositionType" ||
                    e == "flexCentered" ||
                    e == "flexColumn" ||
                    e == "flex" ||
                    e == "maximized" ));
                renderCompositionEditSlideList(compositionSlideList, composition.slides[index], formatClasses);
            }
            Array.from(elements).forEach((element, index) => {
                element.onclick = () => {
                    if (element != selectedElement) select(element, index);
                }
                element.textContent = "Bearbeiten";
            });
        }
    });
}

function renderCompositionEditSlideList(listElement, slides, formatClasses) {
    listElement.innerHTML = "";
    for (const slideReference of slides) {
        let slideData = slideMap[slideReference.id];
        listElement.insertAdjacentHTML("beforeend", `
            <div class="slideReferenceListItem">
                <div></div>
                <div class="slideReferencePreview flexCentered">
                    <div class="compositionType maximized ${formatClasses.join(" ")}"></div>
                </div>
                <div>
                    Condition
                </div>
                <div>
                    <button>Up</button>
                    <button>Down</button>
                </div>
            </div>
            `);
        const element = listElement.lastElementChild;
        element.children[0].textContent = "Name: " + slideData.name;
        showPreviewOnElement(element.children[1].children[0], slideData);
    }
}

reloadNavbar();
loadPage("index")