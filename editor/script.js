const dynamicContent = document.getElementById("dynamicContent");

let articleMap = {};

async function showList() {
    dynamicContent.innerHTML = "<div>Liste lädt...</div>";
    let response = await fetch("../data.json", {
        cache: "reload"
    });
    if (!response.ok) {
        dynamicContent.innerHTML = `
        <div>Ein Fehler ist beim Anzeigen der Liste aufgetreten</div>
        <div>${response.status} ${response.error}</div>
        `;
        return;
    }
    let articles = await response.json();
    dynamicContent.innerHTML = `
        <div class="title">
            Artikel
        </div>
        <div id="articleList">

        </div>
        <div>
            <button id="createArticleButton">
                Neuen Artikel hinzufügen
            </button>
        </div>
    `;
    const articleList = document.getElementById("articleList");
    for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        articleMap[article.id] = article;
        if (article.type == "PDF") {
            articleList.innerHTML += `
                <div class="articleItem">
                    <div>
                        PDF Datei: <a href="../folder/${article.pdf_location}">${article.pdf_location}</a>
                    </div>
                    <div class="articleItemMeta">
                        <div>Anzeigedauer: ${article.duration}s</div>
                        <button onclick="deleteArticle('${article.id}')">
                            Löschen
                        </button>
                    </div>
                </div>
            `;
        } else {
            articleList.innerHTML += `
                <div class="articleItem">
                    <div class="articleItemContent">
                        <div>
                            <div class="articleItemHeader">${article.header}</div>
                            <div class="articleItemDescription">${article.description}</div>
                        </div>
                        ${article.type == "IMAGE" ? `
                            <a class="listImagePreviewContainer" href="../folder/${article.image_location}">
                                <img class="listImagePreview" src="../folder/${article.image_location}">
                            </a>
                        ` : ""}
                    </div>
                    <div class="articleItemMeta">
                        <div>Anzeigedauer: ${article.duration}s</div>
                        <button onclick="deleteArticle('${article.id}')">
                            Löschen
                        </button>
                    </div>
                </div>
            `;
        }
    }
    document.getElementById("createArticleButton").onclick = showCreateArticle;
}

function showCreateArticle() {
    dynamicContent.innerHTML = `
        <div>Artikel erstellen</div>
        <select id="createArticleTypeDiv">
            <option value="PLAIN">Text</option>
            <option value="IMAGE">Text mit Bild</option>
            <option value="PDF">PDF</option>
        </select>
        <div>
            <div id="createDynamicDiv">

            </div>
            <label style="display: block; width: 240px;" for="duration">Anzeigedauer (<span id="durationSpan"></span>)</label>
            <input id="durationInput" name="duration" type="range" min="5" step="5" max="60">
        </div>
        <div class="confirmButtons">
            <button onclick="confirmedArticleCreation()">
                Erstellen
            </button>
            <button onclick="showList()">
                Abbrechen
            </button>
        </div>
    `;
    const createArticleTypeDiv = document.getElementById("createArticleTypeDiv");
    createArticleTypeDiv.onchange = (event) => {
        showCreateArticleValue(event.target.value);
    }
    showCreateArticleValue(document.getElementById("createArticleTypeDiv").value);
    const durationInput = document.getElementById("durationInput");
    const updateDurationInput = window.onmousemove = durationInput.oninput = () => {
        let duration = durationInput.value;
        document.getElementById("durationSpan").textContent = `${duration} Sekunde${duration == 1 ? "" : "n"}`;
    };
    updateDurationInput();
}

async function confirmedArticleCreation() {
    const form = new FormData();
    const articleTypeSelect = document.getElementById("createArticleTypeDiv");
    if (articleTypeSelect.value == "PDF") {
        form.append("userpdf", document.getElementById("creationPDFInput").files[0]);
    } else if (articleTypeSelect.value == "PLAIN") {
        form.append("header", document.getElementById("creationHeaderInput").value);
        form.append("description", document.getElementById("creationDescriptionInput").value);    
    } else if (articleTypeSelect.value == "IMAGE") {
        form.append("header", document.getElementById("creationHeaderInput").value);
        form.append("description", document.getElementById("creationDescriptionInput").value);
        form.append("userimage", document.getElementById("creationImageInput").files[0]);
    }
    form.append("duration", document.getElementById("durationInput").value);    
    const response = await fetch("../create.php", {
        method: "POST",
        body: form
    });
    if (response.ok) {
        console.log("Succesfully created article");
    } else {
        alert("Ein Fehler ist aufgetreten:\n" + JSON.stringify(response));
    }
    window.onmousemove = null;
    showList();
}

function showCreateArticleValue(type) {
    const createDynamicDiv = document.getElementById("createDynamicDiv");
    switch (type) {
        case "PLAIN":
            createDynamicDiv.innerHTML = `
                <div>
                    <label for="creationHeaderInput">Überschrift:</label>
                    <input id="creationHeaderInput" name="creationHeaderInput" type="text"/>
                </div>
                <div>
                    <label for="creationDescriptionInput">Text:</label>
                    <textarea id="creationDescriptionInput" name="creationDescriptionInput"></textarea>
                </div>
            `
            break;
        case "IMAGE":
            createDynamicDiv.innerHTML = `
                <div>
                    <label for="creationHeaderInput">Überschrift:</label>
                    <input id="creationHeaderInput" name="creationHeaderInput" type="text"/>
                </div>
                <div>
                    <label for="creationDescriptionInput">Text:</label>
                    <textarea id="creationDescriptionInput" name="creationDescriptionInput"></textarea>
                </div>
                <div>
                    <label for="userImage">Bild:</label>
                    <input id="creationImageInput" name="userImage" type="file"/>
                </div>
                <img id="userImagePreview" src="">
            `
            const userImageInput = document.getElementById("creationImageInput");
            userImageInput.oninput = () => {
                if (!userImageInput.files) return;
                document.getElementById("userImagePreview").src = URL.createObjectURL(userImageInput.files[0]);
            };
            break;
        case "PDF":
            createDynamicDiv.innerHTML = `
                <label for="userPdf">PDF:</label>
                <input id="creationPDFInput" name="userPdf" type="file"/>
            `
            break;
    }
}

function deleteArticle(id) {
    if (!id) return;
    let article = articleMap[id];
    dynamicContent.innerHTML = `
        <div>Artikel löschen</div>
        <div class="confirmContainer">
            <div class="title">Wollen Sie diesen Artikel wirklich löschen?</div>
            <div class="confirmButtons">
                <button onclick="confirmedArticleDeletion('${article.id}')">Ja</button>
                <button onclick="showList()">Nein</button>
            </div>
        </div>
        <div class="articlePreview">
            <div class="articlePreviewHeader">${article.header}</div>
            <div class="articlePreviewDescription">${article.description}</div>
        </div>
    `
}

async function confirmedArticleDeletion(id) {
    if (!id) return;
    let response = await fetch(`../delete.php?id=${id}`);
    if (response.ok) {
        console.log("Successfully deleted article", id);
    } else {
        alert("Artikel " + id + " konnte nicht gelöscht werden: \n" + JSON.stringify(response));
    }
    showList();
}

showList();
