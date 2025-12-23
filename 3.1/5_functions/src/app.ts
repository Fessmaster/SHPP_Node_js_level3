function fn<T>(
obj: Partial<T>, 
comp:(param: Partial<T>) => T
){}


function fn2<T extends {id: string}>(
	obj: Omit<T, "id"> & {id?:string},
	comp:(param: Omit<T, "id"> & {id?:string}) => T
){}


// Останнє завдання:
// Напишіть сигнатуру функції, що приймає
// - якийсь клас
// - кількість
// ...а повертає масив екземплярів цього класу

class Rectangle {
    w!: number;
    h!: number;
}
class Circle {
    radius!: number;
}

function toStamp<T>(  
  SOMECLASS: new (...args: any[]) => T,
  count: number): T[]  {
    let a = []
    for (let i = 0; i < count; i++)
      a.push(new SOMECLASS());
    return a;
}

let a: Rectangle[] = toStamp(Rectangle, 10);
let b: Circle[] = toStamp(Circle, 20)

