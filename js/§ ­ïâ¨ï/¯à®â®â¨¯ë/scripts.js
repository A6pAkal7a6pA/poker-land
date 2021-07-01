let photos = document.querySelector('.photos');
let photos = document.querySelector('.photos');
let button = document.querySelector('.button');
let buttonRed = document.querySelector('.buttonRed');
let photoAll = document.querySelectorAll('.photo');

const person = new Object({
  name: 'Roman',
  birth: 1986,
  path: 'document.querySelector(\".photo\")',
  age: function(birth) {
    let value1 = new Date();
    return value1.getFullYear() - this.birth;
  },
  pathF: function() {
    let temp = document.querySelector(".photo");
    return temp;
  }
})

Object.prototype.circle = function (data) {
  return data.radius = '50%';}

// buttonRed.forEach((element) =>{
//   element.addEventListener("click", function(event) {
//   event.preventDefault();
//   document.querySelector('.photo').style.background = 'red';
// });
// })


buttonRed.addEventListener(('click'), function (event) {
  event.preventDefault;
  document.querySelectorAll('.photo').forEach((element) =>{
    figure.background(element, 'red');
  });
})

button.addEventListener("click", function (event) {
  event.preventDefault();
  let newElement = makeElement('div', 'photo');
  photos.appendChild(newElement);
});

let makeElement = function(teg, className, text) {
  var element = document.createElement(teg);
  element.classList.add(className);
  if (text) {
   element.textContent = text; 
  }  
  return element;
};
document.querySelector('.buttonImp').addEventListener(('click'), function(event){
event.preventDefault();
  document.querySelectorAll('.photo').forEach((element)=>{
    element.style.borderRadius = '50%';
  });
})

const figure = {
  name: 'figure',
  path: function() {
    let path = document.querySelector(".photo");
    return path;
  },
  background: function(model, color) {
    return model.style.background = color;
  }
} 
photoAll.forEach((element)=>{
  element.addEventListener(('click'), function(){
    element.style.transform = 'rotate(90deg)';
  })
})
