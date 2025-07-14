import { useEffect, useRef } from "react";

/**
 * Logs why a component re-rendered: which props or state changed.
 * @param name - Name of the component (for logging)
 * @param props - Props object (optional)
 * @param state - State object (optional)
 */
export function useWhyDidYouUpdate(
  name: string,
  props?: Record<string, any>,
  state?: Record<string, any>
) {
  const prevProps = useRef<Record<string, any> | null>(null);
  const prevState = useRef<Record<string, any> | null>(null);

  useEffect(() => {
    if (prevProps.current || prevState.current) {
      const changedProps: Record<string, [any, any]> = {};
      const changedState: Record<string, [any, any]> = {};

      if (props && prevProps.current) {
        Object.keys({ ...props, ...prevProps.current }).forEach(key => {
          if (props[key] !== prevProps.current![key]) {
            changedProps[key] = [prevProps.current![key], props[key]];
          }
        });
      }

      if (state && prevState.current) {
        Object.keys({ ...state, ...prevState.current }).forEach(key => {
          if (state[key] !== prevState.current![key]) {
            changedState[key] = [prevState.current![key], state[key]];
          }
        });
      }

      if (Object.keys(changedProps).length > 0) {
        console.log(`[why-did-you-update] ${name} - props changed:`, changedProps);
      }
      if (Object.keys(changedState).length > 0) {
        console.log(`[why-did-you-update] ${name} - state changed:`, changedState);
      }
      if (
        Object.keys(changedProps).length === 0 &&
        Object.keys(changedState).length === 0
      ) {
        console.log(`[why-did-you-update] ${name} - re-rendered but no prop/state changes detected`);
      }
    }

    prevProps.current = props || null;
    prevState.current = state || null;
  });
}
