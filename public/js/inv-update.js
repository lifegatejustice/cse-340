

const form = document.querySelector("#editInventoryForm");
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button");
  updateBtn.removeAttribute("disabled");
});