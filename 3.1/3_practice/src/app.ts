interface BigObject {
  [field: string]: undefined | {
    cvalue: undefined | number | string | BigObject
  }
}

function summ(a: BigObject): number {
  const x = Object.keys(a).map((k) => {     
    const value = a[k]?.cvalue;  
    if (typeof value === "undefined") return 2022;
    if (typeof value === "number") return value;
    if (typeof value === "string") return +value;
    return summ(value) 
  });

  let sum = 0;
  for (let elem of x) {    
      sum += elem;
  }
  return sum;
}

const a = {
  hello: { cvalue: 1 },
  world: {
    cvalue: {
      yay: { cvalue: "2" },
    },
  },
  hey:undefined,
  undefined
};

const b = {
  some: {
    cvalue: undefined
  }
}

const c = {
  hello: { cvalue: 100 },
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
    new: null
  },
  hey:undefined,
  undefined
};

const d = { undefined }

let result = summ(a)
console.log(`Result - ${result}`);
result = summ(b)
console.log(`Result - ${result}`);
result = summ(c)
console.log(`Result - ${result}`);
result = summ(d)
console.log(`Result - ${result}`);