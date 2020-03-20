import * as Tools from './tools.js';

const ul = document.querySelector('.list');
const formfield = document.querySelector('.input__formfield');
const form = document.querySelector('.input__line');
const counter = document.querySelector('.counter p')
const filterShowAll = document.querySelector('#showAll');
const filterShowToDos = document.querySelector('#showToDos');
const filterShowDone = document.querySelector('#showDone');

let toDoList = [];

if (localStorage.getItem('list')){
    toDoList = JSON.parse(localStorage.getItem('list'));
} else {
    Tools.get('http://localhost:3002/todos', function (response) {
          toDoList = response;  //some Bug here. HELP!
    });
};


function renderList(filteredList){
    ul.innerHTML = "";
    filteredList.forEach((element) => {
        let newLi = document.createElement('li');
        newLi.innerHTML = `<div class="list__checkbox">
                              <input type="checkbox" class="list__checkmark" id="todo-${element.id}">
                              <label class="list__label" for="todo-${element.id}"></label>
                           </div>
                           <p class="list__item-name">${element.todoText}</p>
                           <div class="list__delete">
                              <img src="img/cross.svg" alt="delete-button">
                           </div>`;
        newLi.classList.add('list__item');
        newLi.id = element.id;
        ul.appendChild(newLi);
        if (element.done === true){
            newLi.classList.add('list__item--done');
            document.querySelector(`#todo-${element.id}`).checked = true;
        };
    })
    //counter
    let toDoListOpen = toDoList.filter(element => {
        return element.done === false;
    });
    counter.innerText = `${(toDoListOpen.length)} items left`;
};

function renderListFilter(){
    //create new list depending on filter
    if (filterShowToDos.classList.contains('filters__button--active')){
        let toDoListOpen = toDoList.filter(element => {
            return element.done === false;
        });
        renderList(toDoListOpen)
    } else if (filterShowDone.classList.contains('filters__button--active')){
        let toDoListDone = toDoList.filter(element => {
            return element.done === true;
        });
        renderList(toDoListDone);
    } else {
    renderList(toDoList);
    };
};

function saveList(){
    localStorage.setItem('list', JSON.stringify(toDoList));
    Tools.post('http://localhost:3002/todos', toDoList, function (response) {
    });
};

//x-Button mit module delegate
ul.addEventListener('click',Tools.delegate('.list__delete img', (event) => {
    let getID = parseInt(event.target.parentNode.parentNode.id);  // img  >  div list delete  >  li
    let getIndex = toDoList.findIndex(element => {
        return element.id === getID;
    });
    toDoList.splice(getIndex, 1);
    saveList();
    renderListFilter();
}));

//Style toggeln
ul.addEventListener('click', Tools.delegate('.list__checkbox input', (event) => {
    let getID = parseInt(event.target.parentNode.parentNode.id);  //input  >  div list checkbox  >  li
    let getIndex = toDoList.findIndex(element => {
        return element.id === getID;
    });
    toDoList[getIndex].done = !toDoList[getIndex].done;
    saveList();
    renderListFilter();
}));

//text eingeben und neues li erstellen
form.addEventListener('submit', (event) => {
    //standard stoppen
    event.preventDefault(); 
    //push to list
    toDoList.push({'todoText': formfield.value, 'done': false, 'id': Date.now()});
    //formularfeld leeren
    formfield.value = "";
    //speichern
    saveList();
    //create new list depending on filter
    renderListFilter();
});

//filterbuttons
filterShowAll.addEventListener('click', () => {
    filterShowAll.classList.add('filters__button--active');
    filterShowToDos.classList.remove('filters__button--active');
    filterShowDone.classList.remove('filters__button--active');
    renderList(toDoList);
})

filterShowToDos.addEventListener('click', () => {
    filterShowAll.classList.remove('filters__button--active');
    filterShowToDos.classList.add('filters__button--active');
    filterShowDone.classList.remove('filters__button--active');
    let toDoListOpen = toDoList.filter(element => {
        return element.done === false;
    });
    renderList(toDoListOpen);
})

filterShowDone.addEventListener('click', () => {
    filterShowAll.classList.remove('filters__button--active');
    filterShowToDos.classList.remove('filters__button--active');
    filterShowDone.classList.add('filters__button--active');
    let toDoListDone = toDoList.filter(element => {
        return element.done === true;
    });
    renderList(toDoListDone);
})


//Liste aufbauen lassen bei reload
renderList(toDoList);
