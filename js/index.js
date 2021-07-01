const inputs = document.querySelectorAll('.radio')
const items = document.querySelectorAll('.slider__item')
let temp = 3;
const firstLanguage = document.querySelector('.language__first')
const secondLanguage = document.querySelector('.language__second')
const flag = document.querySelector('.flag')

const rus = ['о компании','услуги','этапы','портфолио','контакты','ПРОЕКТИРОВАНИЕ И РАЗРАБОТКА ПРОГРАММНОГО','ОБЕСПЕЧЕНИЯ ДЛЯ СТАРТАПОВ И БИЗНЕСА','Разработчики','Проектировщики','Архитекторы','Проектная команда находится в офисе в центре Санкт-Петербурга и ежедневно взаимодействует между собой. Благодаря этому мы в состоянии обеспечивать высокое качество и быстрый результат. За время нашей работы мы накопили опыт и компетенции, которые так нужны для создания и развития качественных программ.','Техническая команда','Один из главных критериев успеха проекта. Мы имеем большой опыт создания стартапов на аутсорсе и опыт работы по автоматизации бизнес-процессов, поэтому можем сказать, что максимально эффективны команды, которые работают в одном помещении, а не раскиданы по удаленным городам.','Живое общение членов команды между собой – это путь к наиболее эффективной работе. Командный дух и сплоченность коллектива – это важный фактор, который приводит команду к успеху.','Наша команда собиралась длительное время, и каждый из команды – это необходимое и важное звено для всего коллектива, поэтому каждый участник чувствует свою значимость и отдает проектам, которые мы реализуем, максимум сил и времени.','Fix price, scrum, time and materia','Можно выбрать вариант сотрудничества подходящий именно вашей компании. Наши процессы прозрачны и отлажены, что позволяет решать задачи оперативно и с максимальной отдачей.','Гарантия на нашу работу до года','Гарантия означает, что после выпуска продукта, в течение всего гарантийного периода, мы исправляем баги и ошибки, возникшие по нашей вине, абсолютно бесплатно.','Услуги','Интеграция','С учётными системами (ERP, CRM, 1C и др.), интернет-магазином, базой данных','Дополненная реальность','Разработка приложений с 3D визуализацией объектов','Платформы','Разработка приложений под iOS и Android','Доступ','Оперативный доступ к услугам и продукции компании','Платежные системы','Интеграция с платежными системам','Дизайн','Идеальное сочетание функционала и дизайнерского проекта','Индивидуальный продукт','Приложение настраивается под ваши бизнес-процессы','Развитие проекта','Помощь в дальнейшем развитии проекта, регистрация в AppStore и GooglePlay','Поэтапная разработка','мобильного приложения','Понимая вашу потребность в скорейшем внедрении, мы ведём разработку поэтапно. Уже через 2-4 месяца Вы получите первый результат и возможность установить систему с базовым функционалом.','Этапы разработки','Проектирование','Создание макетов экранов мобильного приложения, разработка прототипа мобильного приложения','Создание функциональной спецификации на приложение','Создание технического задания','Планирование и оценка стоимости работ','Дизайн приложения','Подбор дизайн-проекта','При необходимости разработка фирменного стиля компании','Разработка','Языки: Objective-C, C#, Java, JavaScript','Операционные системы: iOS, Android','Запуск и техническая поддержка','Регистрация в Apple Store и Google Play','Интеграция с сайтом заказчика','Горячая линия для клиентов','Внесение изменений в кратчайшие сроки','Портфолио','Интересные проекты в нашем исполнении','Контакты','\"ООО РЕЛЕВАНТ СОФТ\"','199106, Санкт-Петербург, 23-линия В.О., д.28','Тел. +7 (812) 900-39-68','support@relevsoft.com']

const eng = ['about company', 'services','stages','portfolio','contacts','DESIGN AND SOFTWARE DEVELOPMENT','SUPPORT FOR STARTUPS AND BUSINESS','Developers','Designers','Architects','The project team is located in office in the center of Saint Petersburg, and its members interact on a daily basis. Due to this, we are able to provide high quality and prompt results. During our work, we have accumulated experience and competence needed so much to create and develope high-quality software.', 'Technical team','One of the main criteria for the project success. We have a lot of experience in establishing outsourced startups and also experience in automating business processes; so we can say that the most effective teams are those which work in the same room, instead of being scattered around remote cities.', 'Live communication between the team members is the way to work most effectively. Team spirit and cohesion is an important factor that leads our team to success.','Our team has been gathering for a long time, and each member is a necessary and important link for the entire team; so each member feels his significance and directs maximum efforts and time to the projects implemented by us.', 'Fix price, scrum, time and materia','You can choose the cooperation option that suits your company. Our processes are transparent and well-established. It allows us to solve problems quickly and with maximum efficiency.', 'We provide up to 1-year warranty for our work',' Warranty means that after the product release, during the entire warranty period, we fix all bugs and errors occurred by our fault, absolutely free of charge.','Services','Integration','With accounting systems (ERP, CRM, 1C, etc.), online store, database','Augmented reality','Development of applications with object 3D visualization','Platforms','Application development for iOS and Android', 'Access','Prompt access to the company\'s services and products','Payment systems','Integration with payment systems', 'Design','Perfect combination of functionality and design','Individual product', 'Application is configured for your business processes', 'Project development','Assistance in further project development, registration in the AppStore and GooglePlay','Step-by-step development','of mobile application','Understanding your need for rapid implementation, we develop it step-by-step. After 2-4 months, you will get the first results and the possibility to install the system with basic functionality.','Development stages','Designing','Developing mobile app screen layouts, developing a mobile app prototype','Creating functional specification for the application', 'Elaborating the terms of reference', 'Planning and evaluating the cost of work', 'Application design','Selection of a conceptual design','If necessary, development of the company\'s corporate identity', 'Development', 'Languages: Objective-C, C#, Java, JavaScript','Operating systems: iOS, Android', 'Launch and technical support', 'Registration in the Apple Store and Google Play','Integration with the customer\'s website', 'Customer Hotline','Making changes within shortest possible period','Portfolio','Interesting projects performed by us','Contacts','\"LLC "RELEVANT SOFT\"','199106, Saint Petersburg, 28 Vasilyevsky Island\'s 23d line','Tel. +7 (812) 900-39-68','support@relevsoft.com']

function updateURL(element) {
    if (history.pushState) {
        var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        var newUrl = baseUrl + element;        
        history.pushState(null, null, newUrl);
    }
    else {
        console.warn('History API не поддерживается');
    }
}

function changeLanguage(item) {
	let i = 0
	item.forEach(element => {
		let langTemp = document.querySelector(`#lang${i}`)		
		langTemp.textContent = item[`${i}`]		
		i++
	})
}

secondLanguage?.addEventListener('click', function() {	
	if (secondLanguage.textContent == 'ENG') {
		if (firstLanguage.textContent != 'ENG') {
			firstLanguage.textContent = 'ENG'
			secondLanguage.textContent = 'RU'
			changeLanguage(eng)	
			updateURL('?eng')
			flag.style.backgroundImage = `url("img/usa.jpg")`
		}
	}	else if (secondLanguage.textContent == 'RU') {
		if (firstLanguage.textContent != 'RU') {
			firstLanguage.textContent = 'RU'
			secondLanguage.textContent = 'ENG'
			changeLanguage(rus)	
			updateURL('?ru')
			flag.style.backgroundImage = `url("img/russian.png")`
		}
	}	
})

function left(element) {
	items.forEach((element)=> {
		if (!element.classList.contains('.display-none')) {
			element.classList.add('display-none')
		}
	})

	items[temp-1].classList.remove('slider__item-center')		
	items[Number(element.value)-1].classList.remove('display-none')	

	if (temp != 1 ) {
		items[temp-2].classList.remove('slider__item-left')	
	}
	if (element.value != 1 ) {		
		items[Number(element.value)-2].classList.remove('display-none')	
		items[Number(element.value)-2].classList.add('slider__item-left')	
	}		

	if ( temp != 5) {
		items[temp].classList.remove('slider__item-right')	
	}
	if ( element.value != 5) {			
			items[Number(element.value)].classList.remove('display-none')	
			items[Number(element.value)].classList.add('slider__item-right')	
	}	

	items[Number(element.value)-1].classList.toggle('slider__item-center')	





	temp = element.value
}


inputs.forEach((element) => {
	element.addEventListener('change', function() {
		if (element.checked == true) {			
			left(element)		 	
		}
	})
})