const fallbackTodos = [
  { id: 5, title: 'Go sleep', checked: false },
  { id: 4, title: 'Take a major dump', checked: false },
  { id: 3, title: 'Do nothing', checked: false },
  { id: 2, title: 'Walk the dog', checked: true },
  { id: 1, title: 'Wake up', checked: true },
];
const state = { todos: fallbackTodos, filter: 'all', theme: 'light' };

function setTodos(newTodos) {
  if (Array.isArray(newTodos)) {
    state.todos = newTodos;
    renderList();
  }
}

function setFilter(newFilter) {
  if (['all', 'active', 'completed'].includes(newFilter)) {
    state.filter = newFilter;
    renderList();
  }
}

function setTheme(newTheme) {
  if (['light', 'dark'].includes(newTheme)) {
    state.theme = newTheme;
    renderNewTheme();
  }
}

const dragClassName = 'draggable';

const body = document.querySelector('body');
const themeBtn = document.querySelector('#theme');
const form = document.querySelector('#form');
const todoInput = document.querySelector('#todo-input');
const todosList = document.querySelector('#todos');
const todosLeft = document.querySelector('#todos-left');
const clearBtn = document.querySelector('#clear');
const allBtn = document.querySelector('#all');
const activeBtn = document.querySelector('#active');
const completedBtn = document.querySelector('#completed');

window.addEventListener('load', () => {
  getRandomTodosFromBaconipsum({})
    .then(todos => setTodos(todos))
    .catch(console.error)
    .finally(() => renderList());
});

enableDragging();

themeBtn.addEventListener('click', () => {
  setTheme(state.theme === 'light' ? 'dark' : 'light');
});

function renderNewTheme() {
  const isThemeLight = state.theme === 'light';

  themeBtn.innerHTML = `<img src="${
    isThemeLight ? 'images/icon-moon.svg' : 'images/icon-sun.svg'
  }" alt="theme" />`;

  body.classList.remove(isThemeLight ? 'dark' : 'light');
  body.classList.add(state.theme);
}

function renderList() {
  todosList.innerHTML = '';
  state.todos
    .filter(({ checked }) =>
      state.filter === 'active'
        ? !checked
        : state.filter === 'completed'
        ? checked
        : true,
    )
    .forEach(todo => {
      const li = document.createElement('li');
      li.draggable = true;
      li.id = todo.id;
      li.classList.add(dragClassName);
      todosList.appendChild(li);

      const checkedInput = document.createElement('input');
      checkedInput.type = 'checkbox';
      checkedInput.checked = todo.checked;
      checkedInput.addEventListener('change', () => {
        todo.checked = checkedInput.checked;
        setTodos(state.todos);
        renderList();
      });
      li.appendChild(checkedInput);

      const title = document.createElement('p');
      title.textContent = todo.title;
      li.appendChild(title);

      const delBtn = document.createElement('button');
      const deleteIcon = document.createElement('img');
      deleteIcon.src = 'images/icon-cross.svg';
      delBtn.appendChild(deleteIcon);
      delBtn.addEventListener('click', () => {
        state.todos = state.todos.filter(element => element !== todo);
        setTodos(state.todos);
        renderList();
      });
      li.appendChild(delBtn);
    });

  const itemsActive = state.todos.filter(({ checked }) => !checked).length;
  todosLeft.textContent = `${itemsActive} item${
    itemsActive % 10 !== 1 || itemsActive % 11 === 0 ? 's' : ''
  } left`;
}

form.addEventListener('submit', e => {
  e.preventDefault();

  if (todoInput.value)
    setTodos([
      { id: state.todos.length + 1, title: todoInput.value, checked: false },
      ...state.todos,
    ]);
});

clearBtn.addEventListener('click', () => {
  setTodos(state.todos.filter(({ checked }) => !checked));

  renderList();
});

allBtn.addEventListener('click', () => setFilter('all'));
activeBtn.addEventListener('click', () => setFilter('active'));
completedBtn.addEventListener('click', () => setFilter('completed'));

function enableDragging() {
  let from;
  let to;

  function getDraggableParent(target) {
    if (target?.className?.includes(dragClassName)) return target;
    if (target?.parentNode?.className?.includes(dragClassName))
      return target.parentNode;
    if (target?.parentNode?.parentNode?.className?.includes(dragClassName))
      return target.parentNode.parentNode;
    return null;
  }

  document.addEventListener('dragstart', ({ target }) => {
    from = getDraggableParent(target)?.id;
    to = undefined;
  });

  document.addEventListener('dragover', e => {
    e.preventDefault();
  });

  document.addEventListener('drop', ({ target }) => {
    to = getDraggableParent(target)?.id;
    if (from && to && from !== to) {
      const idxFrom = state.todos.findIndex(({ id }) => id == from);
      const idxTo = state.todos.findIndex(({ id }) => id == to);
      setTodos(moveArrayItem(state.todos, idxFrom, idxTo));
    }
  });
}

/**
 * Moves an element within an array from one position to another.
 *
 * @param {Array} arr - The array in which the element should be moved.
 * @param {number} from - The current index of the element to move.
 * @param {number} to - The index to which the element should be moved.
 * @returns {Array} A new array with the element moved to the specified position.
 */
function moveArrayItem(arr, from, to) {
  const newArr = [...arr];
  const [itemToMove] = newArr.splice(from, 1);
  newArr.splice(to, 0, itemToMove);

  return newArr;
}

/**
 * Fetches random to-do items from the Bacon Ipsum API and returns them as an array of objects.
 *
 * @param {Object} options - The options for generating random to-do items.
 * @param {number} [options.from=4] - The minimum number of sentences to fetch.
 * @param {number} [options.to=7] - The maximum number of sentences to fetch.
 * @param {number} [options.checkedRate=0.3] - The probability of a to-do item being checked (true).
 * @returns {Promise<Array>} A promise that resolves with an array of random to-do items.
 */
function getRandomTodosFromBaconipsum({ from = 4, to = 7, checkedRate = 0.3 }) {
  return Promise.resolve(fallbackTodos);
  const todos = [];
  const sentences = Math.floor(Math.random() * (to - from + 1) + from);
  return fetch(
    `https://baconipsum.com/api/?type=ameat-and-filler&sentences=${sentences}`,
  )
    .then(res => res.json())
    .then(([txt]) => {
      txt.split('.').forEach(title => {
        const checked = Math.random() < checkedRate;
        const id = todos.length + 1;
        if (title) todos.push({ id, title, checked });
      });
      return todos;
    });
}

function createLogger() {
  const pre = document.createElement('pre');
  pre.style = 'margin-top:5rem;margin-left: 1rem;';
  body.appendChild(pre);

  return function (item) {
    pre.textContent =
      typeof item === 'object'
        ? JSON.stringify(item, null, 2)
        : `logger: ${item ? item : 'nothing'}`;
  };
}
