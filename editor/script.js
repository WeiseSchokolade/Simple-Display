const dynamicContent = document.getElementById("dynamicContent");

const pages = {
    "index": {
        title: "Übersicht",
        dynamicContent: `
        `,
        init: () => {

        }
    }
};

function loadPage(key) {
    const page = pages[key];
    document.title = page.title;
    dynamicContent.innerHTML = page.dynamicContent ? page.dynamicContent : "";
    if (page.init) page.init(dynamicContent);
}

loadPage("index");