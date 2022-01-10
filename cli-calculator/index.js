"use strict";
exports.__esModule = true;
var readline_sync_1 = require("readline-sync");
function main() {
    var firstString = (0, readline_sync_1.question)('Enter the first number: \n');
    var operator = (0, readline_sync_1.question)('Enter the operator: \n');
    var secondString = (0, readline_sync_1.question)('Enter the second number: \n');
    var validInput = isNumber(firstString) && isOperator(operator) && isNumber(secondString);
    if (validInput) {
        var firstNum = parseInt(firstString);
        var secondNum = parseInt(secondString);
        var result = calculate(firstNum, operator, secondNum);
        console.log(result);
    }
    else {
        console.log('\nInvalid input\n');
        main();
    }
}
;
function calculate(firstNum, operator, secondNum) {
    switch (operator) {
        case "+":
            return firstNum + secondNum;
        case "-":
            return firstNum - secondNum;
        case "*":
            return firstNum * secondNum;
        case "/":
            return firstNum / secondNum;
    }
}
;
function isOperator(operator) {
    switch (operator) {
        case '+':
        case '-':
        case '*':
        case '/':
            return true;
        default:
            return false;
    }
}
function isNumber(str) {
    var maybeNum = parseInt(str);
    var isNum = !isNaN(maybeNum);
    return isNum;
}
main();
