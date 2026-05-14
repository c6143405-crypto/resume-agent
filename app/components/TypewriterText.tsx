"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

// 텍스트가 ChatGPT처럼 한 글자씩 흐르듯 나타나게 하는 컴포넌트.
// text가 바뀌면 처음부터 다시 타이핑.
// delay ms 만큼 기다린 후 타이핑 시작 → 여러 요소를 순차 배치할 때 유용.
export function TypewriterText({
  text,
  speed = 30,
  delay = 0,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");

    if (!text) {
      onComplete?.();
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startTimeout = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          if (intervalId) clearInterval(intervalId);
          onComplete?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay]);

  return <>{displayed}</>;
}
