export function showSlideOnElement(element, slideData) {
    switch (slideData.type) {
        case "article":
            element.innerHTML = `
                <div>
                    <div class="articleHeader"></div>
                    <div class="articleDescription"></div>
                </div>
            `;
            element.children[0].children[0].textContent = slideData.data.header;
            element.children[0].children[1].textContent = slideData.data.text;
            break;
        case "html":
            element.innerHTML = `
                <iframe class="maximized simplifiedIframe"></iframe>
            `;
            element.firstElementChild.setAttribute("src", slideData.data.url);
            break;
        case "image":
            element.innerHTML = `
                <img class="maximized"></img>
            `;
            element.firstElementChild.setAttribute("src", slideData.data.url);
            break;
        case "digitalClock":
            displayDigitalClockOnElement(element);
            break;
        default:
            showSlideError(element, "Unbekannter Folientyp: " + slideData.type);
            break;
    }
}

export function updateElementWithSlideData(element, slideData) {
    switch (slideData.type) {
        case "digitalClock":
            displayDigitalClockOnElement(element);
            break;
    }
}

export function showErrorOnSlide(element, message) {
    element.textContent = `Ein Fehler ist aufgetreten: ${message}`
}

const dateFormat = new Intl.DateTimeFormat(
    "de-DE",
    {
        dateStyle: "full"
    }
);
const timeFormat = new Intl.DateTimeFormat(
    "de-DE",
    {
        timeStyle: "medium"
    }
);

export function displayDigitalClockOnElement(element) {
    let time = Date.now();
    element.innerHTML = `
        <div class="digitalClock">
            <div class="date">${dateFormat.format(time)}</div>
            <div class="time">${timeFormat.format(time)}</div>
            <div>© https://weiseschokola.de</div>
        </div>
    `;
}
