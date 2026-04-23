"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  children: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-[16px] font-bold text-[#23251D] dark:text-[#EAECF6] mt-3 mb-1.5">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[15px] font-bold text-[#23251D] dark:text-[#EAECF6] mt-3 mb-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[14px] font-bold text-[#23251D] dark:text-[#EAECF6] mt-2 mb-1">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-[14px] font-semibold text-[#23251D] dark:text-[#EAECF6] mt-2 mb-1">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#23251D] dark:text-[#EAECF6]">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#EB9D2A] underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  code: ({ className: cls, children }) => {
    const isInline = !cls;
    if (isInline) {
      return (
        <code className="px-1 py-0.5 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[13px] font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className={`${cls ?? ""} font-mono text-[13px]`}>{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="p-3 rounded-md bg-[#E5E7E0] dark:bg-[#2a2b2f] overflow-x-auto my-2 text-[13px]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#D2D3CC] dark:border-[#3a3b3f] pl-3 italic my-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-[#D2D3CC] dark:border-[#3a3b3f] my-3" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#E5E7E0]/50 dark:bg-[#2a2b2f]/50">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-[#D2D3CC] dark:border-[#3a3b3f] px-2 py-1 text-left font-semibold text-[#23251D] dark:text-[#EAECF6]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[#D2D3CC] dark:border-[#3a3b3f] px-2 py-1 align-top">
      {children}
    </td>
  ),
};

export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <div
      className={`text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed ${className ?? ""}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
