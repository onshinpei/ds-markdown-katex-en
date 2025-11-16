import { useMemo, useRef, useState } from 'react';

import Markdown, { ConfigProvider } from 'ds-markdown';
import { katexPlugin } from 'ds-markdown/plugins';

import type { MarkdownRef } from 'ds-markdown';
import dataJson from './data.json';

import 'ds-markdown/katex.css';

function throttle<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
  let lastTime = 0;
  return (...args: T) => {
    const now = Date.now();
    if (now - lastTime > delay) {
      fn(...args);
      lastTime = now;
    }
  };
}

const App: React.FC<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}> = ({ theme, setTheme }) => {
  const [answerContent, setAnswerContent] = useState('');
  const messageDivRef = useRef<HTMLDivElement>(null!);

  const markdownRef = useRef<MarkdownRef>(null!);

  const [mathOpen, setMathOpen] = useState(true);

  const scrollCacheRef = useRef<{
    type: 'manual' | 'auto';
    needAutoScroll: boolean;
    prevScrollTop: number;
  }>({
    type: 'manual',
    needAutoScroll: true,
    prevScrollTop: 0,
  });

  const onClick = () => {
    setAnswerContent(dataJson.content);
  };
  const onReset = () => {
    setAnswerContent('');
  };

  const throttleOnTypedChar = useMemo(() => {
    return throttle(() => {
      if (!scrollCacheRef.current.needAutoScroll) return;
      const messageDiv = messageDivRef.current;
      // Auto scroll to bottom
      if (messageDiv) {
        messageDiv.scrollTo({
          top: messageDiv.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 50);
  }, []);

  const onScroll = useMemo(() => {
    return throttle((e: React.UIEvent<HTMLDivElement>) => {
      // If scrolling up, it means manual scrolling, so stop auto scrolling down
      // console.log(e.currentTarget.scrollTop - scrollCacheRef.current.prevScrollTop);
      if (e.currentTarget.scrollTop < scrollCacheRef.current.prevScrollTop) {
        scrollCacheRef.current.needAutoScroll = false;
      }
      scrollCacheRef.current.prevScrollTop = e.currentTarget.scrollTop;
    }, 50);
  }, []);

  const interval = 5;
  const flag = true;
  const timerType = flag ? 'requestAnimationFrame' : 'setTimeout';

  return (
    <ConfigProvider katexConfig={{ errorColor: '#00f' }}>
      <div className="ds-message-actions">
        <div style={{marginBottom: 10}}>
          {answerContent ? (
            <button className="start-btn" onClick={onReset}>
              Reset
            </button>
          ) : (
            <button className="start-btn" onClick={onClick}>
              Click to Show
            </button>
          )}
          <span style={{ marginLeft: 30 }}>What is the Pythagorean Theorem</span>
        </div>
        <div className="theme-btns">
          <button
            className="theme-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button className="theme-btn" onClick={() => setMathOpen(!mathOpen)}>
            {mathOpen ? 'Disable' : 'Enable'} Math Rendering
          </button>
          <button
            className="theme-btn"
            onClick={() => markdownRef.current.stop()}
          >
            Pause
          </button>

          <button
            className="theme-btn"
            onClick={() => markdownRef.current.resume()}
          >
            Resume
          </button>
        </div>
      </div>
      <div className="ds-message-box" ref={messageDivRef} onScroll={onScroll}>
        <div className="ds-message-list">
          <Markdown
            ref={markdownRef}
            interval={interval}
            answerType="answer"
            onTypedChar={throttleOnTypedChar}
            timerType={timerType}
            theme={theme}
            math={{ splitSymbol: 'bracket' }}
            plugins={mathOpen ? [katexPlugin] : []}
          >
            {answerContent}
          </Markdown>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default App;
