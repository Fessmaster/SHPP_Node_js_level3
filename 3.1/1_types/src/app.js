var firstButton = "Yes";
var secondButton = { type: "Buy" };
function buttonClick(button) {
    if (button.onConfirm) {
        button.onConfirm("Yes");
    }
    else {
        console.log("Виконано дію");
    }
}
// .... НІ, не треба писати всі ці діалоги форми кнопки,
// ми описуємо зараз суто типи.
