import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "./CodeBlock";
import { cn } from "@/lib/utils";

interface HastNode {
  type?: string;
  value?: string;
  children?: HastNode[];
}

function getNodeText(node?: HastNode): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  if (Array.isArray(node.children)) return node.children.map(getNodeText).join("");
  return "";
}

const components: Components = {
  // react-markdown wraps block code in <pre><code>; CodeBlock renders its
  // own <pre>, so let the parent <pre> pass through untouched.
  pre: ({ children }) => <>{children}</>,
  code(props) {
    const { className, children, node, ...rest } = props as typeof props & { node?: HastNode };
    const match = /language-(\w+)/.exec(className ?? "");
    if (!match) {
      return (
        <code
          className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.85em]"
          {...rest}
        >
          {children}
        </code>
      );
    }
    const codeText = getNodeText(node).replace(/\n$/, "");
    return (
      <CodeBlock language={match[1]} codeText={codeText}>
        {children}
      </CodeBlock>
    );
  },
  a: ({ children, ...rest }) => (
    <a {...rest} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  table: ({ children, ...rest }) => (
    <div className="my-3 overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-sm" {...rest}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...rest }) => (
    <thead className="bg-secondary/60" {...rest}>
      {children}
    </thead>
  ),
  th: ({ children, ...rest }) => (
    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" {...rest}>
      {children}
    </th>
  ),
  td: ({ children, ...rest }) => (
    <td className="border-b border-border px-3 py-2 last:border-r-0" {...rest}>
      {children}
    </td>
  ),
  ul: ({ children, ...rest }) => (
    <ul className="my-2 list-disc space-y-1 pl-5" {...rest}>
      {children}
    </ul>
  ),
  ol: ({ children, ...rest }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5" {...rest}>
      {children}
    </ol>
  ),
  h1: ({ children, ...rest }) => (
    <h1 className="mb-2 mt-4 text-lg font-semibold first:mt-0" {...rest}>
      {children}
    </h1>
  ),
  h2: ({ children, ...rest }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold first:mt-0" {...rest}>
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }) => (
    <h3 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0" {...rest}>
      {children}
    </h3>
  ),
  p: ({ children, ...rest }) => (
    <p className="leading-relaxed [&:not(:first-child)]:mt-2" {...rest}>
      {children}
    </p>
  ),
  blockquote: ({ children, ...rest }) => (
    <blockquote className="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground" {...rest}>
      {children}
    </blockquote>
  ),
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("text-sm", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
