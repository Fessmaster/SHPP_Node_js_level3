function summ(a) {
    var x = Object.keys(a).map(function (k) {
        var _a;
        var value = (_a = a[k]) === null || _a === void 0 ? void 0 : _a.cvalue;
        if (value === undefined)
            return 2022;
        if (typeof value === "string" && isNaN(+value))
            return 2022;
        if (typeof value === "string")
            return +value;
        if (typeof value === "number")
            return value;
        return summ(value);
    });
    var sum = 0;
    for (var _i = 0, x_1 = x; _i < x_1.length; _i++) {
        var elem = x_1[_i];
        sum += elem;
    }
    return sum;
}
var a = {
    hello: { cvalue: 1 },
    world: {
        cvalue: {
            yay: { cvalue: "2" },
        },
    },
    hey: undefined,
    undefined: undefined
};
var b = {
    some: {
        cvalue: undefined
    }
};
var c = {
    hello: { cvalue: "abc" },
    world: {
        cvalue: {
            yay: {
                cvalue: {
                    some: {
                        cvalue: "33"
                    }
                }
            },
        },
    },
    hey: undefined,
    undefined: undefined
};
var d = { undefined: undefined };
var result = summ(a);
console.log("Result - ".concat(result));
result = summ(b);
console.log("Result - ".concat(result));
result = summ(c);
console.log("Result - ".concat(result));
result = summ(d);
console.log("Result - ".concat(result));
