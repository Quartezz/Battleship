const filpButton = document.querySelector("#flip-button")
const optionContainer = document.querySelector("option-container")

function flip() {
const optionShips = Array.from(optionContainer.children)
    optionShips.forEach(optionShips => optionShips.style.transform = "rotate")
}

filpButton.addEventListener("click", flip)
