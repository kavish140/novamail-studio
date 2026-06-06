import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { getCodeSnippets } from "@/lib/mock-data";

export function CodeTabs({ className }: { className?: string }) {
  const apiUrl = import.meta.env.VITE_SUPABASE_URL 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
    : "https://api.novamail.app/v1/send-email";
  const snippets = getCodeSnippets(apiUrl);

  return (
    <Tabs defaultValue="node" className={className}>
      <TabsList className="bg-surface/70 flex-wrap h-auto p-1">
        <TabsTrigger value="node">Node.js</TabsTrigger>
        <TabsTrigger value="python">Python</TabsTrigger>
        <TabsTrigger value="php">PHP</TabsTrigger>
        <TabsTrigger value="go">Go</TabsTrigger>
        <TabsTrigger value="ruby">Ruby</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
      </TabsList>
      <TabsContent value="node" className="mt-4">
        <CodeBlock filename="send-email.ts" language="typescript" code={snippets.node} />
      </TabsContent>
      <TabsContent value="python" className="mt-4">
        <CodeBlock filename="send_email.py" language="python" code={snippets.python} />
      </TabsContent>
      <TabsContent value="php" className="mt-4">
        <CodeBlock filename="send_email.php" language="php" code={snippets.php} />
      </TabsContent>
      <TabsContent value="go" className="mt-4">
        <CodeBlock filename="main.go" language="go" code={snippets.go} />
      </TabsContent>
      <TabsContent value="ruby" className="mt-4">
        <CodeBlock filename="send_email.rb" language="ruby" code={snippets.ruby} />
      </TabsContent>
      <TabsContent value="curl" className="mt-4">
        <CodeBlock filename="terminal" language="bash" code={snippets.curl} />
      </TabsContent>
    </Tabs>
  );
}