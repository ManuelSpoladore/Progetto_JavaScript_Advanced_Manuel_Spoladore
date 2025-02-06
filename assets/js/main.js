import axios from "axios";
import _ from "lodash";

const submitBtn = document.getElementById("submit-btn");

let inputValue = "";

async function getBooks() {
  try {
    const response = await axios.get(
      `https://openlibrary.org/subjects/` + `${inputValue}` + `.json`
    );
    return response.data.works;

  } catch (error) {
    console.error("Errore durante la richiesta", error);
    throw error;
  }
}

async function getBookDetails(bookKey) {
  try {
    const response = await axios.get(`https://openlibrary.org${bookKey}.json`);
    return response.data.description || "Nessuna descrizione disponibile.";
  } catch (error) {
    console.error("Errore durante il recupero della descrizione:", error);
    return "Errore nel recupero della descrizione.";
  }
}

function createBooks(books) {
  const booksContainer = document.getElementById("books-container");
  booksContainer.innerHTML = "";

  if (_.isEmpty(books)) {
    const noBooksMessage = document.createElement("div");
    noBooksMessage.classList.add("no-books-container");
    noBooksMessage.textContent = "Purtroppo questa categoria non esiste";
    noBooksMessage.setAttribute("role", "alert");
    booksContainer.appendChild(noBooksMessage);
    return;
  }

  books.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("single-book");
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");
    div.setAttribute(
      "aria-label",
      `Dettagli di ${item.title} di ${
        item.authors?.[0]?.name || "Autore sconosciuto"
      }`
    );

    const title = document.createElement("h3");
    title.classList.add("title-book");
    title.textContent = item.title;

    const img = document.createElement("img");
    img.setAttribute("loading", "lazy");
    img.setAttribute("alt", item.title || "Copertina non disponibile");
    img.classList.add("cover-book");
    if (item.cover_id) {
      img.src =
        `https://covers.openlibrary.org/b/id/` + `${item.cover_id}` + `-M.jpg`;
    } else {
      img.src = "https://via.placeholder.com/150x200?text=Nessuna+Immagine";
    }

    const author = document.createElement("h5");
    author.classList.add("author");
    author.textContent = _.get(item, "authors[0].name", "Autore sconosciuto");

    div.addEventListener("click", async () => {
      if (document.querySelector(".description-overlay")) {
        return;
      }

      const descriptionOverlay = document.createElement("div");
      descriptionOverlay.classList.add("description-overlay");
      descriptionOverlay.setAttribute("role", "dialog");
      descriptionOverlay.setAttribute("aria-labelledby", "dialog-title");
      descriptionOverlay.setAttribute("aria-describedby", "dialog-description");

      const descriptionContainer = document.createElement("div");
      descriptionContainer.classList.add("description-container");

      const description = document.createElement("p");
      description.classList.add("single-title");

      const singleDetails = document.createElement("h5");
      singleDetails.textContent = `${item.title} - ${
        item.authors?.[0]?.name || "Autore sconosciuto"
      }`;
      singleDetails.classList.add("description");

      const bookDescription = await getBookDetails(item.key);
      description.innerHTML = `<strong>Descrizione:</strong><br>${bookDescription}`;

      const singleCover = document.createElement("img");
      if (item.cover_id) {
        singleCover.src =
          `https://covers.openlibrary.org/b/id/` +
          `${item.cover_id}` +
          `-M.jpg`;
      } else {
        singleCover.src =
          "https://via.placeholder.com/150x200?text=Nessuna+Immagine";
      }
      descriptionOverlay.appendChild(descriptionContainer);
      descriptionContainer.appendChild(singleDetails);
      descriptionContainer.appendChild(singleCover);
      descriptionContainer.appendChild(description);

      document.body.appendChild(descriptionOverlay);

      descriptionOverlay.addEventListener("click", (e) => {
        if (e.target === descriptionOverlay) {
          descriptionOverlay.remove();
          document.body.style.overflow = "";
        }
      });
    });
    booksContainer.appendChild(div);
    div.appendChild(title);
    div.appendChild(img);
    div.appendChild(author);
  });
  setupCanvas();
}

const fetchBooksDebounced = _.debounce(async () => {
  await getBooks();
}, 500);

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fetchBooksDebounced();
});

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const categoryBox = document.getElementById("category-box");
    inputValue = _.kebabCase(categoryBox.value);
    const books = await getBooks();
    createBooks(books);
  } catch (error) {
    console.error("Errore nella creazione dei libri:", error);
  }
});
