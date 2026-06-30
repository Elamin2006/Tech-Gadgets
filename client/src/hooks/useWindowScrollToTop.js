import { useEffect } from "react";

export default function useWindowScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}