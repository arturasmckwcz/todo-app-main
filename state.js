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
