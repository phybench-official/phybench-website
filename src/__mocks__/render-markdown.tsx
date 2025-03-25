import React from 'react';

// 简单模拟Markdown渲染组件
export default function RenderMarkdown({ content }: { content: string }) {
  // 简单模拟Markdown解析行为
  const parsedContent = content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/```(\w*)\n([\s\S]*?)```/gm, '<code>$2</code>')
    .replace(/\$([^$]+)\$/g, '<span class="katex">$1</span>');
    
  return <div data-testid="mocked-markdown" dangerouslySetInnerHTML={{ __html: parsedContent }} />;
}

// filepath: /Users/wcy/phybench-website/src/__mocks__/style-mock.js
