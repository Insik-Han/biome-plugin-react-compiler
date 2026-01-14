// @ts-nocheck
import { useRef } from "react";

function Component() {
  const ref = useRef(null);
  // Invalid: accessing ref.current during render
  const value = ref.current;
  return <div>{value}</div>;
}
