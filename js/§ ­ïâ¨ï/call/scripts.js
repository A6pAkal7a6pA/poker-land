let modif = document.querySelector('.btn');
let modif2 = document.querySelector('.btn2');
let modif3 = document.querySelector('.btn3');

const data = {
	points: 0,
	modified: false,
	switch: 'off'
}
const p = new Promise(function(resolve, reject) {
		setTimeout(()=> {
			data.modified = true
			resolve(data)
		}, 2000)
	})



modif.addEventListener(('click'), function(event) {
	event.preventDefault;

const p = new Promise(function(resolve, reject) {
		setTimeout(()=> {
			data.modified = true
			resolve(data)
		}, 2000)
	})
	p.then(clientData=>{
		console.log(clientData)
	})
})

modif2.addEventListener(('click'), function(event) {
	event.preventDefault;

const p = new Promise(function(resolve, reject) {
		setTimeout(()=> {
			data.modified = true
			resolve(data)
		}, 2000)
	})
	p.then(clientData=>{
		console.log(clientData)
	})
})


modif3.addEventListener(('click'), function(event) {
	event.preventDefault;

const p = new Promise(function(resolve, reject) {
		setTimeout(()=> {
			data.modified = true
			data.switch = 'on'
			resolve(data)
			console.log('data...')
		}, 2000)
	})
	p.then(clientData=>{
		setTimeout(()=> {
			console.log('data modified...')
		}, 2000)
	}).then(clientData =>{
	setTimeout(()=> {
		console.log('data switched...')
	}, 3000)
	})
})

