// Baby Uno in JavaScript
// Converted from C++
// Authors: Shruthi Venkatesh, Yasha Zbarsky

// ----------------------
// Card Structure
// ----------------------
class Card {
    constructor(color, numberSpecial) {
        this.color = color;
        this.numberSpecial = numberSpecial;
    }
}

// ----------------------
// Utility Functions
// ----------------------
function wait(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function showSingleCard(card) {
    console.log(`[${card.color} ${card.numberSpecial}]`);
}

function showMultipleCards(cards) {
    cards.forEach(c => showSingleCard(c));
}

// ----------------------
// Deck Creation
// ----------------------
function createDeck() {
    const deck = [];
    let colors = ["red", "green", "blue", "yellow"];

    // 80 colored cards
    for (let i = 0; i < 80; i++) {
        let color = colors[Math.floor(i / 20)];
        let num = (i % 10).toString();
        deck.push(new Card(color, num));
    }

    // 4 wild
    for (let i = 0; i < 4; i++) deck.push(new Card("wild", ""));

    // 4 draw four
    for (let i = 0; i < 4; i++) deck.push(new Card("wild", "draw four"));

    return deck;
}

// ----------------------
// Shuffle
// ----------------------
function shuffle(deck) {
    for (let i = 0; i < 50; i++) {
        let a = Math.floor(Math.random() * deck.length);
        let b = Math.floor(Math.random() * deck.length);
        [deck[a], deck[b]] = [deck[b], deck[a]];
    }
}

// ----------------------
// Move discard → deck
// ----------------------
function moveDiscardToDeck(deck, discard) {
    const top = discard.pop();
    deck.push(...discard);
    discard.length = 0;
    discard.push(top);
    shuffle(deck);
}

// ----------------------
// Deal cards
// ----------------------
function deal(deck, hand, discard, count) {
    for (let i = 0; i < count; i++) {
        if (deck.length === 0) moveDiscardToDeck(deck, discard);
        hand.push(deck.pop());
    }
}

// ----------------------
// Setup Game
// ----------------------
function setupGame() {
    let deck = createDeck();
    shuffle(deck);

    let discard = [];
    let p1 = [];
    let p2 = [];

    deal(deck, p1, discard, 7);
    deal(deck, p2, discard, 7);

    discard.push(deck.pop());

    return { deck, discard, p1, p2 };
}

// ----------------------
// Check if move is valid
// ----------------------
function checkMove(played, top) {
    return (
        played.color === top.color ||
        played.numberSpecial === top.numberSpecial ||
        played.color === "wild" ||
        played.numberSpecial === "draw four"
    );
}

// ----------------------
// Player Turn
// ----------------------
async function playerTurn(hand, discard, deck, turn, playerName) {
    console.log(`\n${playerName}'s turn`);
    console.log("Your hand:");
    showMultipleCards(hand);

    console.log("\nTop card:");
    showSingleCard(discard[discard.length - 1]);

    const prompt = require("prompt-sync")();

    while (true) {
        console.log("\n1) Play a card");
        console.log("2) Draw a card");
        let choice = prompt("> ");

        if (choice === "1") {
            let index = parseInt(prompt("Which card number? ")) - 1;

            if (index < 0 || index >= hand.length) {
                console.log("Invalid card.");
                continue;
            }

            if (!checkMove(hand[index], discard[discard.length - 1])) {
                console.log("Invalid move.");
                continue;
            }

            discard.push(hand[index]);
            hand.splice(index, 1);
            break;
        }

        if (choice === "2") {
            deal(deck, hand, discard, 1);
            break;
        }

        console.log("Invalid choice.");
    }

    return turn + 1;
}

// ----------------------
// Finish Actions
// ----------------------
function finishActions(discard, deck, hand, turn) {
    const last = discard[discard.length - 1];

    if (last.numberSpecial === "draw two") {
        deal(deck, hand, discard, 2);
    } else if (last.numberSpecial === "draw four") {
        deal(deck, hand, discard, 4);
    } else if (last.numberSpecial === "skip") {
        turn++;
    }

    return turn;
}

// ----------------------
// Main Game Loop
// ----------------------
async function main() {
    const prompt = require("prompt-sync")();

    let { deck, discard, p1, p2 } = setupGame();
    let turn = 1;

    while (p1.length > 0 && p2.length > 0) {
        console.clear();

        if (turn % 2 !== 0) {
            turn = await playerTurn(p1, discard, deck, turn, "Player 1");
            turn = finishActions(discard, deck, p2, turn);
        } else {
            turn = await playerTurn(p2, discard, deck, turn, "Player 2");
            turn = finishActions(discard, deck, p1, turn);
        }
    }

    console.log("\n\n" + (p1.length === 0 ? "PLAYER ONE WINS!" : "PLAYER TWO WINS!"));
}

main();
