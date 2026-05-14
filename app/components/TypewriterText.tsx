"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

// 텍스트가 ChatGPT처럼 한 글자씩 흐르듯 나타나게 하는 컴포넌트.
// text가 바뀌면 처음부터 다시 타이핑.
// 부모 요소의 스타일을 그대로 따라간다 (텍스트 노드만 반환).
export function TypewriterText({
  text,
  speed = 50,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      onComplete?.();
      return;
    }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return <>{displayed}</>;
}
