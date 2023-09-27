/**
 * Moves an element within an array from one position to another.
 *
 * @param {Array} arr - The array in which the element should be moved.
 * @param {number} from - The current index of the element to move.
 * @param {number} to - The index to which the element should be moved.
 * @returns {Array} A new array with the element moved to the specified position.
 */
export function moveArrayItem(arr, from, to) {
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
 * @returns {Promise<Array>} A promise that resolves with an array of random todo items title of each is
 *                           of 12 or less words.
 */
export function getRandomTodosFromBaconipsum({
  from = 4,
  to = 7,
  checkedRate = 0.3,
}) {
  // return Promise.reject("While debugging");
  const todos = [];
  const sentences = Math.floor(Math.random() * (to - from + 1) + from);
  return fetch(
    `https://baconipsum.com/api/?type=ameat-and-filler&sentences=${sentences}`,
  )
    .then(res => res.json())
    .then(([sentences]) => {
      sentences
        .split(".")
        .map(sentence =>
          sentence
            .split(" ")
            .reduce(
              (title, word) =>
                (title.split(" ").length <= 6
                  ? title + " " + word
                  : title
                ).trim(),
              "",
            ),
        )
        .forEach(title => {
          const checked = Math.random() < checkedRate;
          const id = todos.length + 1;
          if (title) todos.push({ id, title, checked });
        });
      return todos;
    });
}

/**
 * Creates a logger function that appends log messages to a <pre> element in the body of the document.
 *
 * @param {string} title - The title to be displayed before each log message.
 * @returns {function} A logger function that takes an item to be logged.
 *
 * @example
 * // Create a logger with a specific title
 * const myLogger = createLogger("My Logger");
 *
 * // Log a message
 * myLogger("Hello, world!");
 *
 * // Log an object
 * myLogger({ key: 'value' });
 */
export function createLogger(title) {
  const pre = document.createElement("pre");
  pre.style = "margin:2rem";
  document.querySelector("body").appendChild(pre);

  /**
   * @param {any} item - The item to be logged.
   */
  return function (item) {
    pre.textContent =
      `${title}:\n` +
      (typeof item === "object"
        ? JSON.stringify(item, null, 2)
        : `logger: ${item ? item : "nothing"}`);
  };
}
