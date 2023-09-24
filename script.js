import createState from "./state.js";
import {
  moveArrayItem,
  getRandomTodosFromBaconipsum,
  createLogger,
} from "./utils.js";
import fallbackTodos from "./fallbackTodos.js";

const [todos, setTodos] = createState({
  initialState: { list: [], filter: "all" },
  validate: function (todos) {
    const { list, filter } = todos;
    const isListValid = !list || Array.isArray(list);
    const isFilterValid =
      !filter || ["all", "active", "completed"].includes(filter);
    return isListValid && isFilterValid;
  },
  render: renderTodos,
});

const [theme, setTheme] = createState({
  initialState: { value: "light" },
  validate: function ({ value }) {
    return ["light", "dark"].includes(value);
  },
  render: renderNewTheme,
});

const dragClassName = "draggable";

const body = document.querySelector("body");
const themeBtn = document.querySelector("#theme");
const form = document.querySelector("#form");
const todoInputTitle = document.querySelector("#todo-input-title");
const todoInputChecked = document.querySelector("#todo-input-checked");
const todosList = document.querySelector("#todos");
const todosLeft = document.querySelector("#todos-left");
const clearBtn = document.querySelector("#clear");
const allBtn = document.querySelector("#all");
const activeBtn = document.querySelector("#active");
const completedBtn = document.querySelector("#completed");

window.addEventListener("load", () => {
  getRandomTodosFromBaconipsum({})
    .then(todos => setTodos({ list: todos?.length ? todos : fallbackTodos }))
    .catch(error => {
      console.error(error);
      setTodos({ list: fallbackTodos });
    });
});

enableDragging();

themeBtn.addEventListener("click", () => {
  setTheme(theme.value === "light" ? { value: "dark" } : { value: "light" });
});

function renderNewTheme(theme) {
  const isThemeLight = theme.value === "light";

  themeBtn.innerHTML = `<img src="${
    isThemeLight ? "images/icon-moon.svg" : "images/icon-sun.svg"
  }" alt="theme" />`;

  body.classList.remove(isThemeLight ? "dark" : "light");
  body.classList.add(theme.value);
}

form.addEventListener("submit", e => {
  e.preventDefault();

  if (todoInputTitle.value)
    setTodos({
      list: [
        {
          id: todos.list.length + 1,
          title: todoInputTitle.value,
          checked: todoInputChecked.checked,
        },
        ...todos.list,
      ],
    });
  todoInputChecked.checked = false;
  todoInputTitle.value = "";
});

function renderTodos(todos) {
  todosList.innerHTML = "";
  todos.list
    .filter(({ checked }) =>
      todos.filter === "active"
        ? !checked
        : todos.filter === "completed"
        ? checked
        : true,
    )
    .forEach((todo, idx) => {
      const li = document.createElement("li");
      li.draggable = true;
      li.id = todo.id;
      li.classList.add(dragClassName);
      todosList.appendChild(li);

      const checkedInput = document.createElement("input");
      checkedInput.type = "checkbox";
      checkedInput.checked = todo.checked;
      checkedInput.id = "todo-" + (idx + 1);
      checkedInput.addEventListener("change", () => {
        todo.checked = checkedInput.checked;
        setTodos({ list: [...todos.list] });
      });
      li.appendChild(checkedInput);
      const label = document.createElement("label");
      label.setAttribute("for", checkedInput.id);
      li.appendChild(label);

      const title = document.createElement("p");
      title.textContent = todo.title;
      li.appendChild(title);

      const delBtn = document.createElement("button");
      delBtn.innerHTML = '<img src="images/icon-cross.svg" alt="delete"/>';
      delBtn.addEventListener("click", () =>
        setTodos({ list: todos.list.filter(element => element !== todo) }),
      );
      li.appendChild(delBtn);
    });

  const itemsActive = todos.list.filter(({ checked }) => !checked).length;
  todosLeft.textContent = `${itemsActive} item${
    itemsActive % 10 !== 1 || itemsActive % 11 === 0 ? "s" : ""
  } left`;
}

clearBtn.addEventListener("click", () => {
  setTodos({ list: todos.list.filter(({ checked }) => !checked) });

  renderTodosList();
});

allBtn.addEventListener("change", () => setTodos({ filter: "all" }));
activeBtn.addEventListener("change", () => setTodos({ filter: "active" }));
completedBtn.addEventListener("change", () =>
  setTodos({ filter: "completed" }),
);

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

  document.addEventListener("dragstart", ({ target }) => {
    from = getDraggableParent(target)?.id;
    to = undefined;
  });

  document.addEventListener("dragover", e => {
    e.preventDefault();
  });

  document.addEventListener("drop", ({ target }) => {
    to = getDraggableParent(target)?.id;
    if (from && to && from !== to) {
      const idxFrom = todos.list.findIndex(({ id }) => id == from);
      const idxTo = todos.list.findIndex(({ id }) => id == to);
      setTodos({ list: moveArrayItem(todos.list, idxFrom, idxTo) });
    }
  });
}
