import React from 'react';
import reducer from './reducer';
import {createStore} from 'redux';
import {
  useDispatch as useDispatchGeneric,
  useMappedState as useMappedStateGeneric,
} from 'redux-react-hook';

export function makeStore() {
  return createStore(reducer, {
    lastUpdated: 0,
    todos: ['alpha', 'beta', 'gamma'],
  });
}

export const Context = React.createContext(null);

export function useMappedState(mapState) {
  // Wrap the generic useMappedState so that you don't have to pass in the store Context all over
  // If you want to pass only a subset of state, this is also the place to do it. For example,
  // if your store schema has an undo stack, and you only want to pass the current state.
  return useMappedStateGeneric(Context, mapState);
}

export function useDispatch() {
  return useDispatchGeneric(Context);
}
