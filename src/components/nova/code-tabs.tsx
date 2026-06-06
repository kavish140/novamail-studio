import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { codeSnippets } from "@/lib/mock-data";

export function CodeTabs({ className }: { className?: string }) {
  return (
    <Tabs defaultValue="node" className={className}>
      <TabsList className="bg-surface/70">
        <TabsTrigger value="node">Node.js</TabsTrigger>
        <TabsTrigger value="python">Python</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
      </TabsList>
      <TabsContent value="node" className="mt-4">
        <CodeBlock filename="send-email.ts" language="typescript" code={codeSnippets.node} />
      </TabsContent>
      <TabsContent value="python" className="mt-4">
        <CodeBlock filename="send_email.py" language="python" code={codeSnippets.python} />
      </TabsContent>
      <TabsContent value="curl" className="mt-4">
        <CodeBlock filename="terminal" language="bash" code={codeSnippets.curl} />
      </TabsContent>
    </Tabs>
  );
}