const dynamicContent = document.getElementById("dynamicContent");
const navigationBar = document.getElementById("navigationBar");

let pages = {
    "index": {
        title: "Übersicht",
        dynamicContent: `
            Willkommen bei dieser Übersicht.
        `,
        init: () => {

        }
    },
    "compositions": {
        title: "Kompositionen",
        init: async (element) => {
            loading(element);
            let compositionData = await fetch(`../data/compositions.json`, {cache: 'reload'});
            let compositions = await compositionData.json();
            const root = document.createElement("div");
            root.classList.add("maximized");
            root.classList.add("compositionList");
            for (let i = 0; i < compositions.length; i++) {
                let composition = compositions[i];
                root.innerHTML += `
                    <div class="compositionItem">
                        <div class="compositionTypePreviewRoot"></div>
                        <div>Name: ${composition.name}</div>
                        <div>Typ: ${composition.type}</div>
                    </div>
                `;
                renderCompositionType(root.lastElementChild.firstElementChild, composition.type);
            }
            root.innerHTML += `
                <button class="addComposition">
                    <div class="compositionTypePreviewRoot compositionType flexCentered maximized"><div class="centeredPlus">+</div></div>
                    <div>Neue Komposition hinzufügen</div>
                </button>
            `;
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
                            <div class="flex">
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
                        document.querySelector("#compositionCreationForm").onsubmit(() => {

                        });
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
let currentPage = pages.index;

function loadPage(key) {
    if (currentPage == key) return;
    currentPage.navbarElement.classList.remove("selectedNavbarItem");
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

function renderCompositionType(element, type) {
    switch (type) {
        case "filled":
            element.innerHTML = `
                <div class="compositionType maximized"></div>
            `;
            break;
        case "split2":
            element.innerHTML = `
                <div class="compositionType maximized halfWidth"></div>
                <div class="compositionType maximized halfWidth"></div>
            `;
            break;
        case "weightedLeft":
            element.innerHTML = `
                <div class="compositionType maximized thirdWidth"></div>
                <div class="compositionType maximized twoThirdsWidth"></div>
            `;
            break;
        case "split3":
            element.innerHTML = `
                <div class="compositionType maximized thirdWidth"></div>
                <div class="compositionType maximized thirdWidth"></div>
                <div class="compositionType maximized thirdWidth"></div>
            `;
            break;
        case "split3clock":
            element.innerHTML = `
                <div class="compositionType maximized thirdWidth"></div>
                <div class="flexColumn maximized thirdWidth">
                    <div class="compositionType maximized thirdHeight"></div>
                    <div class="compositionType maximized twoThirdsHeight"></div>
                </div>
                <div class="compositionType maximized thirdWidth"></div>
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

}

reloadNavbar();
loadPage("compositions")