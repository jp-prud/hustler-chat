import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MemoizedMarkdown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
};
