import { useEffect, useMemo, useRef, useState } from 'react';

interface TypewriterHtmlProps {
  html: string;
  className?: string;
  speed?: number;
  startDelay?: number;
}

type HtmlToken =
  | {
      type: 'tag';
      value: string;
    }
  | {
      type: 'text';
      value: string;
    };

function tokenizeHtml(html: string): HtmlToken[] {
  const matches = html.match(/<[^>]+>|[^<]+/g) ?? [];

  return matches.map((value) => {
    if (value.startsWith('<')) {
      return {
        type: 'tag',
        value,
      };
    }

    return {
      type: 'text',
      value,
    };
  });
}

export function TypewriterHtml({
  html,
  className = '',
  speed = 18,
  startDelay = 350,
}: TypewriterHtmlProps) {
  const [displayedHtml, setDisplayedHtml] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const timeoutRef = useRef<number | null>(null);
  const tokens = useMemo(() => tokenizeHtml(html), [html]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setDisplayedHtml(html);
      setIsTyping(false);
      return;
    }

    let tokenIndex = 0;
    let charIndex = 0;
    let output = '';

    setDisplayedHtml('');
    setIsTyping(true);

    function clearCurrentTimeout() {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function typeNext() {
      const currentToken = tokens[tokenIndex];

      if (!currentToken) {
        setDisplayedHtml(output);
        setIsTyping(false);
        return;
      }

      if (currentToken.type === 'tag') {
        output += currentToken.value;
        tokenIndex += 1;
        charIndex = 0;
        setDisplayedHtml(output);
        timeoutRef.current = window.setTimeout(typeNext, 0);
        return;
      }

      output += currentToken.value[charIndex] ?? '';
      charIndex += 1;
      setDisplayedHtml(output);

      if (charIndex >= currentToken.value.length) {
        tokenIndex += 1;
        charIndex = 0;
      }

      timeoutRef.current = window.setTimeout(typeNext, speed);
    }

    timeoutRef.current = window.setTimeout(typeNext, startDelay);

    return () => {
      clearCurrentTimeout();
    };
  }, [html, tokens, speed, startDelay]);


  function addCursorToTypedHtml(html: string, isTyping: boolean) {
  const cursor = `<span class="typewriter-cursor ${
    isTyping ? 'is-typing' : 'is-finished'
  }" aria-hidden="true"></span>`;

  // If the current typed HTML ends with closing tags like </strong></p>,
  // insert the cursor before those closing tags so it stays after the text.
  const trailingClosingTags = /((?:\s*<\/[^>]+>)+\s*)$/;

  if (trailingClosingTags.test(html)) {
    return html.replace(trailingClosingTags, `${cursor}$1`);
  }

  return `${html}${cursor}`;
}

  return (
    <div className={`${className} typewriter-html`}>
      <div className="typewriter-stage">
        <div
          className="typewriter-measure"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div
            className="typewriter-visible"
            dangerouslySetInnerHTML={{
                __html: addCursorToTypedHtml(displayedHtml, isTyping),
            }}
            />
      </div>
    </div>
  );
}