// @ts-nocheck
import { useRef, useEffect } from "react";

// Note: This rule has false positives due to GritQL limitations
// These are "valid" patterns but will still be flagged
function Component() {
  const ref = useRef(null);

  // This is valid but will be flagged (known limitation)
  useEffect(() => {
    console.log(ref.current);
  }, []);

  return <div ref={ref} />;
}
