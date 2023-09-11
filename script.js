import createState from './state.js';
import {
  moveArrayItem,
  getRandomTodosFromBaconipsum,
  createLogger,
} from './utils.js';
import fallbackTodos from './fallbackTodos.js';

const [todos, setTodos] = createState({
  initialState: { list: fallbackTodos, filter: 'all', theme: 'light' },
  validate: function ({ list }) {
    return Array.isArray(list);
  },
  render: renderTodosList,
});

const [filter, setFilter] = createState({
  initialState: { value: 'all' },
  validate: function ({ value }) {
    return ['all', 'active', 'completed'].includes(value);
  },
  render: renderTodosList,
});

const [theme, setTheme] = createState({
  initialState: { value: 'light' },
  validate: function ({ value }) {
    return ['light', 'dark'].includes(value);
  },
  render: renderNewTheme,
});

const todosLogger = createLogger('TODOS');
const filterLogger = createLogger('FILTER');

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
  renderTodosList();
  return;
  getRandomTodosFromBaconipsum({})
    .then(todos => setTodos(todos))
    .catch(console.error)
    .finally(() => renderTodosList());
});

enableDragging();

themeBtn.addEventListener('click', () => {
  setTheme(theme.value === 'light' ? { value: 'dark' } : { value: 'light' });
});

function renderNewTheme(theme) {
  const isThemeLight = theme.value === 'light';

  themeBtn.innerHTML = `<img src="${
    isThemeLight ? 'images/icon-moon.svg' : 'images/icon-sun.svg'
  }" alt="theme" />`;

  body.classList.remove(isThemeLight ? 'dark' : 'light');
  body.classList.add(theme.value);
}

form.addEventListener('submit', e => {
  e.preventDefault();

  if (todoInput.value)
    setTodos({
      list: [
        { id: todos.list.length + 1, title: todoInput.value, checked: false },
        ...todos.list,
      ],
    });
});

function renderTodosList() {
  todosList.innerHTML = '';
  todos.list
    .filter(({ checked }) =>
      filter.value === 'active'
        ? !checked
        : filter.value === 'completed'
        ? checked
        : true,
    )
    .forEach(todo => {
      const li = document.createElement('li');
      li.draggable = true;
      li.id = todo.id;
      li.classList.add(dragClassName);
      todosList.appendChild(li);

      const checkedBtn = document.createElement('button');
      checkedBtn.innerHTML = todo.checked
        ? '<img src="images/icon-check.svg" alt="delete"/>'
        : '';
      checkedBtn.addEventListener('click', () => {
        todo.checked = !todo.checked;
        setTodos(todos.todos);
        renderTodosList();
      });
      li.appendChild(checkedBtn);

      const title = document.createElement('p');
      title.textContent = todo.title;
      li.appendChild(title);

      const delBtn = document.createElement('button');
      delBtn.innerHTML = '<img src="images/icon-cross.svg" alt="delete"/>';
      delBtn.addEventListener('click', () => {
        todos.todos = todos.todos.filter(element => element !== todo);
        setTodos(todos.todos);
        renderTodosList();
      });
      li.appendChild(delBtn);
    });

  const itemsActive = todos.list.filter(({ checked }) => !checked).length;
  todosLeft.textContent = `${itemsActive} item${
    itemsActive % 10 !== 1 || itemsActive % 11 === 0 ? 's' : ''
  } left`;

  filterLogger(filter);
  todosLogger(todos);
}

clearBtn.addEventListener('click', () => {
  setTodos({ list: todos.list.filter(({ checked }) => !checked) });

  renderTodosList();
});

allBtn.addEventListener('click', () => setFilter({ value: 'all' }));
activeBtn.addEventListener('click', () => setFilter({ value: 'active' }));
completedBtn.addEventListener('click', () => setFilter({ value: 'completed' }));

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
      const idxFrom = todos.list.findIndex(({ id }) => id == from);
      const idxTo = todos.list.findIndex(({ id }) => id == to);
      setTodos({ list: moveArrayItem(todos.list, idxFrom, idxTo) });
    }
  });
}
