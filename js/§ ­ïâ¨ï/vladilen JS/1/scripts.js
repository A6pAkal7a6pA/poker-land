const name = 'Roman'
const age = 34
const output = `${name} Age is ${age}`
console.log(output)
// functions declaration

function greet(name) {
  console.log('hello ' + name)
}

//function

const greet2 = function greet2(name) {
  console.log('privet ' + name)
}

greet('roma')

//стрелочные функции

const arrow = (name) => {

}

let sumAll = (...all) => {
  let result = 0
  for (let i of all) {
    result += i
  }
  console.log(result)
}

function createMember(name) {
  return function(lastName) {
    console.log(name + lastName)
  }
}
let name3 = createMember('Roman')
console.log(name3('Kostyrin'))
let cars = ['Mazda', 'Ford', 'BMW']

console.log(cars[0])

cars.push('Porsche')
console.log(cars)

let stroka = 'Privet, kak dela'
let reverse = stroka.split('').reverse().join('')

console.log(cars.indexOf('BMW'))

let uppCaseCar = cars.map(car => {
  return car.toUpperCase()
})

let numbers = [1, 2, 3, 4, 5]
let double = numbers.map(number => number **2 )

let pow2 = num => num ** 2
let numb = 5
let sqrt = double.map(Math.sqrt)

let newsqrt = sqrt.filter(num =>  num != 1)

let people = [
{name: 'Roma', budget: 1200},
{name: 'Lena', budget: 1500},
{name: 'Dana', budget: 1800}
]

let budgets = people.filter(person => person.budget > 1400).reduce((acc, person) => {
  acc += person.budget
  return acc
}, 0)