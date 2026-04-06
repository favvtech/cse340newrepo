const form = document.querySelector("#updateForm")

if (form) {
  form.addEventListener("change", function () {
    const updateBtn = document.querySelector("button")
    if (updateBtn) {
      updateBtn.removeAttribute("disabled")
    }
  })
}
