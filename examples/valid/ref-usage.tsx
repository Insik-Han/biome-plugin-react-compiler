// VALID: Proper ref usage

import React, { useRef, useEffect, useCallback } from "react";

function GoodRefComponent() {
  const inputRef = useRef<HTMLInputElement>(null);

  // GOOD: Reading ref in useEffect
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // GOOD: Reading ref in event handler
  const handleClick = () => {
    const value = inputRef.current?.value;
    console.log(value);
  };

  // GOOD: Reading ref in useCallback
  const handleSubmit = useCallback(() => {
    if (inputRef.current) {
      console.log(inputRef.current.value);
    }
  }, []);

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>Log Value</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

function CounterWithRef() {
  const countRef = useRef(0);

  // GOOD: Modifying ref in event handler
  const increment = () => {
    countRef.current += 1;
    console.log("Count:", countRef.current);
  };

  return <button onClick={increment}>Increment</button>;
}

export { GoodRefComponent, CounterWithRef };
