'use strict';

/*const Person = function(firstName, birthYear) {
    this.firstName = firstName;
    this.birthYear = birthYear;
}
// Sttaic method
// - {only available to Person}
// - {NOT available to instanses}
Person.hey = function() {
    console.log('👋');
    console.log(this);
}
Person.hey();

// 1. New empty {} creted
// 2. function is called , this = {}
// 3. {} is linked to prototype
// 4. function automatically returned {}

const p1 = new Person('Shivraj', 2002);
// console.log(p1 instanceof Person);

// Prototypes
Person.prototype.calcAge = function() {
    console.log(2040 - this.birthYear);
}
Person.prototype.sayHello = function() {
    console.log("Hello, " + this.firstName);
}*/
// p1.calcAge();
// p1.sayHello();
// console.log(p1);
// console.log(p1.__proto__ === Person.prototype);

// Person.prototype.species = 'Homo Sapiens';
// console.log(p1.species);

// console.log(Person.prototype.isPrototypeOf(p1));

// console.log(p1.hasOwnProperty('firstName'));
// // true

// console.log(p1.hasOwnProperty('species'));
// false : because p1 is instance of Person , and not of Person.prototype
// but p1 is instance of Person.prototype
// Person.prototype have as Person constructor function

// console.log(p1.__proto__.__proto__);
// console.dir(Person.prototype.constructor);


// const arr = [1,2,3,4,5];
// console.log(arr.__proto__);




// -----------------------------------------
// ES 6 Classes

// class expression
// const PersonCl = class {}

// class declaration
class PersonCl {
    constructor(firstName, birthYear) {
        this.firstName = firstName;
        this.birthYear = birthYear;
    }

    // Methods will be add to .prototype property
    calAge() {
        console.log(2040 - this.birthYear);
    }

    greet() {
        console.log(`Hello, ${this.firstName}`);
    }

    get age() {
        return 2050 - this.birthYear;
    }

    // set a property that already exists
    set fullName(name) {
        if(name.includes(' ')) this._fullName = name;
        else alert(`${name} is not a full name!`);
    }
    // get fullName() {
    //     return this._fullName;
    // }

    // static method
    static hey() {
        console.log('👋✌');
    }
}

/*
const jessica = new PersonCl('Jessica Davis', 1996);
jessica.greet();
console.log(jessica);


// Getter & Setter
const account = {
    owner: 'SR',
    movments: [100, 250, 80, 570],

    get latest() {
        return this.movments.slice(-1).pop();
    },
    set latest(mov) {
        this.movments.push(mov);
    },
}

console.log(account.latest); //getter method
console.log(account.latest = 50);// setter method
console.log(account.movments);
console.log(jessica.age);*/



// -----------------------------------------
// Inheritance between Classes : constructor functions

/*
const Person = function(firstName, birthYear) {
    this.firstName = firstName;
    this.birthYear = birthYear;
};
Person.prototype.calcAge = function() {
    console.log(2040 - this.birthYear);
};

const Student = function(firstName, birthYear, course) {
    Person.call(this, firstName, birthYear);
    this.course = course;
}
*/
/*
Linking the prototypes
Student.prototype should be the Person.prototype
-> Student.prototype = Person.prototype
- this is tottaly wrong
- Beacuse it's said that Student's prototype property
  & Person's prototype property should be tha same object.
- But that's not what we want
- what we want is Person's prototype object is Student.prototype.
- that's why we need Object.create
*/
/*
Student.prototype = Object.create(Person.prototype);
now Student object can inherite method that are define in Person
like mike.calcAge() {prototpe chain}

Student.prototype.introduce = function() {
    console.log(`My name is ${this.firstName}`);
}

const mike = new Student('Mike', 2020, 'CS');
*/


// -----------------------------------------
// Inheritance between Classes : ES6 Classes
/*
class StudentCl extends PersonCl {
    constructor(firstName, birthYear, course) {
        super(firstName, birthYear);
        this.course = course;
    }

    introduce() {
        console.log(`Hey, I am ${this.firstName}`);
    }

    calcAge() {
        console.log(`I am ${2040-this.birthYear}`);
    }
}

const dev = new StudentCl('Dev', 2000, 'CS');
dev.introduce();
dev.calcAge();
*/



// -----------------------------------------
// Inheritance between Classes : Object.create
/*
const PersonProto = {
    calcAge() {
        console.log(2040 - this.birthYear);
    },

    init(firstName, birthYear) {
        this.firstName = firstName;
        this.birthYear = birthYear;
    }
}

const StudentProto = Object.create(PersonProto);
StudentProto.init = function(firstName, birthYear, course) {
    PersonProto.init.call(this, firstName, birthYear);
    this.course = course;
}
StudentProto.introduce = function() {
    console.log(`I am ${this.firstName}`);
}

const steave = Object.create(StudentProto);
steave.init('Steave', 1990, 'CS');
steave.calcAge();
steave.introduce();
*/




class Account {
    // Public Feilds
    locale = navigator.language;

    // Private Feilds
    #movements = [];
    #pin;

    constructor(owner, currency, pin) {
        this.owner = owner;
        this.currency = currency;
        this.#pin = pin;
    }

    deposit(val) {
        this.#movements.push(val)
        return this
    }

    withdraw(val) {
        this.deposit(-val)
        return this
    }

    approveLoan(val) {
        return true
    }

    requestLoan(val) {
        if(this.approveLoan) {
            this.deposit(val);
            return this
        }
    }

    getMovements() {
        this.#movements;
    }
}

const shiv = new Account('Shiv', 'INR', 1008);
shiv.deposit(1000);
shiv.withdraw(200);
console.log(shiv);

// Chaining
shiv.deposit(500).deposit(20).withdraw(250).requestLoan(20000).withdraw(10000);
console.log(shiv.getMovements());