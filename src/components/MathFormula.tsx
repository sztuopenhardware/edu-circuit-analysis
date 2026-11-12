import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  tex: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  tex,
  block = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return tex;
    }
  }, [tex, block]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/** Renders prose containing inline $...$ LaTeX segments and **bold** text */
export const RichTextWithMath: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const parts = useMemo(() => {
    const tokens: { type: 'text' | 'math' | 'bold'; value: string }[] = [];
    const mathRegex = /\$([^$]+)\$/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    while ((match = mathRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        pushBoldTokens(text.slice(lastIdx, match.index), tokens);
      }
      tokens.push({ type: 'math', value: match[1] });
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) {
      pushBoldTokens(text.slice(lastIdx), tokens);
    }
    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === 'math') return <MathFormula key={idx} tex={p.value} />;
        if (p.type === 'bold') return <strong key={idx}>{p.value}</strong>;
        return <React.Fragment key={idx}>{p.value}</React.Fragment>;
      })}
    </span>
  );
};

function pushBoldTokens(
  segment: string,
  out: { type: 'text' | 'math' | 'bold'; value: string }[]
) {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = boldRegex.exec(segment)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', value: segment.slice(last, m.index) });
    }
    out.push({ type: 'bold', value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < segment.length) {
    out.push({ type: 'text', value: segment.slice(last) });
  }
}
