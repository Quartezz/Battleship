const filpButton = document.querySelector("#flip-button")
const optionContainer = document.querySelector(".option-container")
const gamesBoardContainer = document.querySelector("#gamesboard-container")
const startButton = document.querySelector("#start-button")
const infoDisplay = document.querySelector("#info")
const turnDisplay = document.querySelector("#turn-display")
const shipsInfo = document.querySelector("#shipsInfo")

// Option choosing
let angle = 0
function flip() {
const optionShips = Array.from(optionContainer.children)
    // if (angle === 0) {
    //     angle = 90
    // } else {
    //     angle = 0
    // }
    angle = angle === 0 ? 90 : 0
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
}

filpButton.addEventListener("click", flip)

// Creating Boards
const width = 10

function createBoard(color, user) {
    const gameBoardContainer = document.createElement("div")
    gameBoardContainer.classList.add("game-board")
    gameBoardContainer.style.backgroundColor = color
    gameBoardContainer.id = user

    for (let i = 0; i < width * width; i++) {
        const block = document.createElement("div")
        block.classList.add("block")
        block.id = i
        gameBoardContainer.append(block)
    }

    gamesBoardContainer.append(gameBoardContainer)
}

createBoard('#00bbf0', "player")
createBoard("#00bbf0", "computer")


// Creating Ships

class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length
    }
}

const destroyer = new Ship("destroyer", 2)
const submarine = new Ship("submarine", 3)
const cruiser = new Ship("cruiser", 3)
const battleship = new Ship("battleship", 4)
const carrier = new Ship("carrier", 5)


const ships = [destroyer, submarine, cruiser, battleship, carrier]

let notDropped

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex :
    width * width - ship.length :
    // vertical now
    startIndex <= width * width - width * ship.length ? startIndex : 
    startIndex - ship.length * width + width

    let shipBlocks = []

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    }

    let valid

    if (isHorizontal) {
        shipBlocks.every((_shipBlock, index) => 
        valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1))
        )
    } else {
        shipBlocks.every((_shipBlock, index) => 
        valid = shipBlocks[0].id < 90 + (width * index + 1)
        )
        
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains("taken"))

    return { shipBlocks, valid, notTaken }
}

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomBoolean = Math.random() < 0.5
    let isHorizontal = user === "player" ? angle === 0: randomBoolean
    let randomStartIndex = Math.floor(Math.random() * width * width)

    let startIndex = startId ? startId : randomStartIndex

    const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add("taken")
        })
    } else {
        if(user === "computer") addShipPiece(user, ship, startId)
        if(user === "player") notDropped = true
    }
    
}

ships.forEach(ship => addShipPiece("computer", ship))

// Draggable object for player
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener("dragstart", dragStart))

const allPlayerBlocks = document.querySelectorAll("#player div")
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener("dragover", dragOver)
    playerBlock.addEventListener("drop", dropShip)
})

function dragStart(e) {
    notDropped = false
    draggedShip = e.target
}

function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece("player", ship, startId)
    if (!notDropped) {
        draggedShip.remove()
    }
}

// Add highlight
function highlightArea(startIndex, ship) {
   const allBoardBlocks = document.querySelectorAll("#player div")
   let isHorizontal = angle === 0

   const { shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

   if(valid && notTaken) {
    shipBlocks.forEach(shipBlock => {
        shipBlock.classList.add("hover")
        setTimeout(() => shipBlock.classList.remove("hover"), 500)
    })
   }
}

let gameOver = false
let playerTurn

startButton.addEventListener("click", startGame)

// Start Game

function startGame() {
    if(playerTurn === undefined) {
        if (optionContainer.children.length != 0) {
            infoDisplay.textContent = "Please place all your ships first!"
            turnDisplay.textContent = "Watch the info error!"
        } else {
            shipsInfo.classList.add("active")
            const allBoardBlocks = document.querySelectorAll("#computer div")
            allBoardBlocks.forEach(block => block.addEventListener("click", handleClick))
            playerTurn = true
            turnDisplay.textContent = "Your turn!"
            infoDisplay.textContent = "The game has started!"
        }
    } 
}
let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []
function handleClick(e) {
    if (!gameOver) {
        if (e.target.classList.contains("taken")) {
            e.target.classList.add("boom")
            infoDisplay.textContent = "You hit the computer's ship!"
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== "block")
            classes = classes.filter(className => className !== "boom")
            classes = classes.filter(className => className !== "taken")
            playerHits.push(...classes)
            checkScore("player", playerHits, playerSunkShips)
        }
        if (!e.target.classList.contains("taken")) {
            infoDisplay.textContent = "Nothing hit!"
            e.target.classList.add("empty")
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll("#computer div")
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 1500)
    }
}

// Computers turn

function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = "Computers turn!"
        infoDisplay.textContent = "The computer is thinking"

        setTimeout(() => {
            let randomGo = Math.floor(Math.random() * width * width)
            const allBoardBlocks = document.querySelectorAll("#player div")

            if (allBoardBlocks[randomGo].classList.contains("taken") &&
                allBoardBlocks[randomGo].classList.contains("boom")
            ) {
                computerGo()
                return
            } else if (
                allBoardBlocks[randomGo].classList.contains("taken") &&
                !allBoardBlocks[randomGo].classList.contains("boom")
            ) {
                allBoardBlocks[randomGo].classList.add("boom")
                infoDisplay.textContent = "The computer hit your ship!"
                let classes = Array.from(allBoardBlocks[randomGo].classList)
                classes = classes.filter(className => className !== "block")
                classes = classes.filter(className => className !== "boom")
                classes = classes.filter(className => className !== "taken")
                computerHits.push(...classes)
                checkScore("computer", computerHits, computerSunkShips)
            } else {
                infoDisplay.textContent = "Nothing hit this time."
                allBoardBlocks[randomGo].classList.add("empty")
            }
        }, 1500)

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = "Your Turn!"
            infoDisplay.textContent = "Plese make your turn."
           const allBoardBlocks = document.querySelectorAll("#computer div")
           allBoardBlocks.forEach(block => block.addEventListener("click", handleClick))
        }, 3000)
    }
}

function checkScore(user, userHits, userSunkShips) {
 
    function checkShip(shipName, shipLength) {
        if (
            userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
        ) {
            
            if (user === 'player') {
                infoDisplay.textContent = `You sunk the computer's ${shipName}.`
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            if (user === 'computer') {
                infoDisplay.textContent = `The computer sunk your ${shipName}.`
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
        }
    }

    checkShip("destroyer", 2)
    checkShip("submarine", 3)
    checkShip("cruiser", 3)
    checkShip("battleship", 4)
    checkShip("carrier", 5)

    if(playerSunkShips.length ===5) {
        infoDisplay.textContent = "You won!"
        gameOver = true
    }
    if(computerSunkShips.length ===5) {
        infoDisplay.textContent = "You lost!"
        gameOver = true
    }

    
}
























