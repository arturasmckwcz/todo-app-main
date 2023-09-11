/**
 * Creates a state management function with validation and rendering capabilities.
 *
 * @param {Object} options - Configuration options for the state.
 * @param {Object} options.initialState - The initial state object.
 * @param {Function} [options.validate] - A validation function to validate new state values.
 * @param {Function} [options.render] - A rendering function to update the UI with the new state.
 *
 * @returns {[Object, Function]} - A tuple containing the current state and a function to update it.
 *
 * @example
 * // Create a state management function
 * const [state, setState] = createState({
 *   initialState: { count: 0 },
 *   validate: (newState) => newState.count >= 0,
 *   render: (state) => {
 *     // Update the UI with the new state
 *     document.getElementById('count').textContent = state.count;
 *   }
 * });
 *
 * // Update the state
 * setState({ count: 5 }); // Updates state and renders the UI
 */
export default function createState({ initialState, validate, render }) {
  const state = { ...initialState };

  function setState(newState) {
    const isValid = typeof validate === 'function' ? validate(newState) : true;
    if (isValid)
      Object.keys(newState).forEach(key => {
        state[key] = newState[key];
      });

    if (typeof render === 'function') render(state);
  }
  return [state, setState];
}
