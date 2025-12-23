//Напишіть функцію mapObject, яка
//у чомусь схожа на функцію map для масивів.
//
//Ця функція повинна приймати об'єкт джаваскрипту
//і функцію transformer, яку потрібно застосувати до кожного з полів об'єкта,
//...а з результату застосування функції transformer до кожного поля вхідного об'єкта
//зібрати новий об'єкт та повернути його.
//
//Так наприклад, можна буде замепити об'єкт типу
//{ "roma" : 5, "vasya": 2 } оцінок студентів
//на функцію на кшталт (x) => x > 2
//щоб отримати об'єкт
//{"roma": true, "vasya": false} заліків студентів
//
//Зрозуміло для опису сигнатури mapObject треба буде юзать
//1) дженерики з кількома параметрами-типами
//2) таку штуку як Record (globalThis.Record, якщо бути точним ;) )

//Record<string, U>

function mapObject<T, U> (
  obj: Record<string, T>, 
  transformer:(param:T) => U
): Record<string, U> {
  const outputObject: Record<string, U> = {};
  const keys = Object.keys(obj);
  for (const key of keys){
    outputObject[key] = transformer(obj[key])
  }
  return outputObject
}

const obj = { "roma" : 5, "vasya": 2 };

function compare(param: number): boolean{
  return param > 2
}
function convert(param: number): string{
  return param.toString()
}

const firstObj = mapObject(obj, compare)
console.log(firstObj);

const secondObj = mapObject(obj, convert)
console.log(secondObj);


console.log('Original object:');
console.log(obj);
