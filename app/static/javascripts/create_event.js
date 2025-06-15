// JS per la capacità massima dell'evento

function toggle() {
	let hasCapacityCheckbox = document.getElementById("hasCapacityCheckbox");
	let capacity = document.getElementById("capacity");

	if (hasCapacityCheckbox.checked === true) {
		//console.log("Checkbox is checked...");
		capacity.disabled = false;
	} else {
		//console.log("Checkbox is not checked...");
		capacity.value = "";
		capacity.disabled = true;
	}
}

// JS per le categorie dell'evento

const container = document.querySelector(".categories-info .categories-container");
const hiddenInput = document.querySelector(".categories-info input");
let categories = [];

function renderCategories() {
	container.innerHTML = "";

  categories.forEach((category, idx) => {
    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.textContent = category;

    const removeBtn = document.createElement("span");
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "✖";
    removeBtn.onclick = () => {
      categories.splice(idx, 1);
      renderCategories();
    };

    tag.appendChild(removeBtn);

    container.appendChild(tag);
  });

  // Bottone "+" per aggiungere una nuova categoria.
  const addInput = document.createElement("div");
  addInput.classList.add("tag", "add-tag");
  addInput.textContent = "+";
  addInput.onclick = () => {
    const input = document.createElement("input");
    input.classList.add("category-input");
    input.type = "text";
    input.placeholder = "New category";

    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim() !== "") {
        categories.push(input.value.trim());
        renderCategories();
      }
      else if (e.key === "Escape") {
        renderCategories();
      }
    };

    // Sostituisce il "+" con il campo input.
    addInput.replaceWith(input);
    input.focus();
  };

  container.appendChild(addInput);

  // Aggiorna il campo input nascosto.
  hiddenInput.value = JSON.stringify(categories);
}

renderCategories();