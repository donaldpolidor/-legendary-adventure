const form = document.querySelector("#updateForm")
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button[type='submit']")
  if (updateBtn) {
    updateBtn.removeAttribute("disabled")
  }
})