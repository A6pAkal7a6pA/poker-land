let button = document.querySelector('.button');
let buttonRed = document.querySelector('.buttonRed');
let buttonImp = document.querySelector('.buttonImp');
let index = 1;
let album = document.querySelector('.photos');
// class Animal {
//   // static type = 'AnimaL' Только для класса Animal
//   constructor(options) {
//   this.name = options.name,
//   this.age = options.age,
//   this.hasTail = options.hasTail
//   }  
//   voice() {
//     console.log(`I am ${this.name}`)
//   }
// }
// const animal = new Animal({
//   name: 'Animal',
//   age: 5,
//   hasTail: true
// })

// class Cat extends Animal {
//   constructor(options) {
//     super(options),
//     this.color = options.color
//   }
//   voice() {
//     super.voice()
//     console.log(`I am ${this.name}`)
//   }
//   get ageInfo() { 
//     return this.age * 7
//   }
//   set ageInfo(newAge) {
//     this.age = newAge
//   }
// }

// const cat = new Cat({
//   name: 'Barsik',
//   age: 3,
//   hasTail: true,
//   color: 'Black'
// })

class Component {
  constructor(selector) {
    this.$el = document.querySelector(selector)
  }
  hide() {
    this.$el.style.display = 'none'
  }
   show() {
    this.$el.style.display = 'block'
  }
}
class Box extends Component {
  constructor(options) {
    super(options.selector)
    this.$el.style.width = this.$el.style.height = options.size + 'px'
    this.$el.style.background = options.color
  }
}

const box1 = new Box({
  selector: '#box1',
  size: 100,
  color: 'red'
})

class Circle extends Box {
  constructor(options) {
    super(options)
    this.$el.style.borderRadius = '50%'
  }
   get impSize() {
    return this.size
  }
  set impSize(imp) {
    this.$el.style.width = this.$el.style.height = imp + 'px'
  }
 
}
const circle = new Circle ({
  selector: '#box4',
  size: 100,
  color: 'yellow'
})






buttonImp.addEventListener('click', function (evt) {
  evt.preventDefault();  
  circle.impSize =  25
});





buttonRed.addEventListener('click', function (evt) {
  evt.preventDefault();  
  box1.show()
});


button.addEventListener('click', function (evt) {
  evt.preventDefault();
  
  let elem = createElem(index);  
    album.appendChild(elem);
    index++;
    if(index >15) {
    	index = 1;
    }
});


function createElem(index) {
	let element = document.createElement('div');
	let url = "url('img/" + index + ".jpg')" 
  element.style.background = url;
  element.classList.add('photo');
  deleteElement(element);
 return element;
}

function deleteElement(elem) {
	elem.addEventListener('click', function (evt) {
		elem.remove();
	});
}

for (let i = 0; i < album.children.length; i++) {
	deleteElement(album.children[i]);
}

	
	
