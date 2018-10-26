import {useContext, useEffect, useRef, useState} from 'react';
import {Action, Dispatch, Store} from 'redux';
import shallowEqual from './shallowEqual';

/**
 * Your passed in mapState function should be memoized to avoid
 * resubscribing every render. If you use other props in mapState, use
 * useCallback to memoize the resulting function, otherwise define the mapState
 * function outside of the component:
 *
 * const mapState = useCallback(
 *   state => state.todos.get(id),
 *   // The second parameter to useCallback tells you
 *   [id],
 * );
 * const todo = useMappedState(mapState);
 */
export function useMappedState<TState, TResult>(
  storeContext: React.Context<Store<TState>>,
  mapState: (state: TState) => TResult,
): TResult {
  const store = useContext(storeContext);
  const runMapState = () => mapState(store.getState());

  const [mappedState, setMappedState] = useState(() => runMapState());

  // If the store or mapState change, rerun mapState
  const prevStore = usePrevious(store);
  const prevMapState = usePrevious(mapState);
  if (prevStore !== store || prevMapState !== mapState) {
    setMappedState(runMapState());
  }

  // We use a ref to store the last result of mapState in local component
  // state. This way we can compare with the previous version to know if
  // the component should re-render. Otherwise, we'd have pass mappedState
  // in the array of memoization paramaters to the second useEffect below,
  // which would cause it to unsubscribe and resubscribe from Redux everytime
  // the state changes.
  const lastRenderedMappedState = usePrevious(mappedState);

  useEffect(
    () => {
      // Run the mapState callback and if the result has changed, make the
      // component re-render with the new state.
      const checkForUpdates = () => {
        const newMappedState = runMapState();
        if (!shallowEqual(newMappedState, lastRenderedMappedState)) {
          setMappedState(newMappedState);
        }
      };

      // Pull data from the store on first render.
      checkForUpdates();

      // Subscribe to the store to be notified of subsequent changes.
      const unsubscribe = store.subscribe(checkForUpdates);

      // The return value of useEffect will be called when unmounting, so
      // we use it to unsubscribe from the store.
      return unsubscribe;
    },
    [store, mapState],
  );
  return mappedState;
}

export function useDispatch<TAction extends Action>(
  storeContext: React.Context<Store<any, TAction>>,
): Dispatch<TAction> {
  const store = useContext(storeContext);
  return store.dispatch;
}

function usePrevious<T>(value: T): T {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
