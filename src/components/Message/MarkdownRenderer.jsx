import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";
import {
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  RiCheckLine,
  RiFileCopyLine,
} from "react-icons/ri";

import "./MarkdownRenderer.scss";


/* =========================================================
   Code Block
   ========================================================= */

function CodeBlock({
  className,
  children,
}) {
  const [copied, setCopied] =
    useState(false);

  const language =
    /language-(\w+)/.exec(
      className || ""
    )?.[1] || "text";

  const code = String(children).replace(
    /\n$/,
    ""
  );


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1800
      );

    } catch {
      // Clipboard unavailable.
    }
  };


  return (
    <div className="code-block">

      <div className="code-block__header">

        <span className="code-block__lang">
          {language}
        </span>

        <button
          type="button"
          className="code-block__copy"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <RiCheckLine />
          ) : (
            <RiFileCopyLine />
          )}

          {copied
            ? "Copied"
            : "Copy"}
        </button>

      </div>

      <div className="code-block__body">

        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            background: "transparent",
            fontSize: "0.85rem",
          }}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>

      </div>

    </div>
  );
}


/* =========================================================
   Detect block-level React children
   ========================================================= */

function containsBlockElement(children) {
  return React.Children.toArray(
    children
  ).some((child) => {

    if (!React.isValidElement(child)) {
      return false;
    }

    const type = child.type;

    return (
      type === CodeBlock ||
      type === "div" ||
      type === "pre" ||
      type === "ul" ||
      type === "ol" ||
      type === "table" ||
      type === "blockquote"
    );
  });
}


/* =========================================================
   Markdown Renderer
   ========================================================= */

export default function MarkdownRenderer({
  content,
}) {
  return (
    <div className="markdown-body">

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}

        components={{

          /* -----------------------------------------------
             Inline code / fenced code
             ----------------------------------------------- */

          code({
            inline,
            className,
            children,
            ...props
          }) {

            if (inline) {

              return (
                <code
                  className="inline-code"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                className={className}
              >
                {children}
              </CodeBlock>
            );
          },


          /* -----------------------------------------------
             Paragraph Fix
             
             ReactMarkdown can create:
             
             <p>
               <div>code...</div>
             </p>
             
             which is invalid HTML.
             
             When a paragraph contains a block element,
             return the children directly instead.
             ----------------------------------------------- */

          p({
            children,
          }) {

            if (
              containsBlockElement(
                children
              )
            ) {
              return (
                <>
                  {children}
                </>
              );
            }

            return (
              <p>{children}</p>
            );
          },


          /* -----------------------------------------------
             List item
             ----------------------------------------------- */

          li({
            children,
          }) {

            return (
              <li>
                {children}
              </li>
            );
          },


          /* -----------------------------------------------
             Fenced code block wrapper

             react-markdown can otherwise place a custom block
             renderer inside a paragraph/list item. Returning the
             block directly keeps the DOM valid and removes the
             <pre> inside <p> warning.
             ----------------------------------------------- */

          pre({ children }) {
            return <>{children}</>;
          },

          /* -----------------------------------------------
             Links
             ----------------------------------------------- */

          a({
            href,
            children,
            ...props
          }) {

            const isExternal =
              href?.startsWith(
                "http://"
              ) ||
              href?.startsWith(
                "https://"
              );

            return (
              <a
                href={href}
                target={
                  isExternal
                    ? "_blank"
                    : undefined
                }
                rel={
                  isExternal
                    ? "noopener noreferrer"
                    : undefined
                }
                {...props}
              >
                {children}
              </a>
            );
          },

        }}
      >
        {content || ""}
      </ReactMarkdown>

    </div>
  );
}