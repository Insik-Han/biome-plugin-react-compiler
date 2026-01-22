// INVALID: Reading/writing ref.current during render

import React, { useRef } from "react";

function BadRefComponent() {
  const inputRef = useRef<HTMLInputElement>(null);

  // BAD: Reading ref.current during render
  const value = inputRef.current?.value;

  // BAD: Writing ref.current during render
  // @ts-expect-error - intentionally showing invalid code
  inputRef.current = document.createElement("input");

  return <input ref={inputRef} value={value} />;
}

function AnotherBadRefComponent({ data }: { data: string }) {
  const countRef = useRef(0);

  // BAD: Modifying ref during render
  countRef.current = countRef.current + 1;

  return <div>Render count: {countRef.current}</div>;
}

export { BadRefComponent, AnotherBadRefComponent };
