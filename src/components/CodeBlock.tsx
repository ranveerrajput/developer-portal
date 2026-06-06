import { Copy } from "lucide-react";
import { Button } from "./Button";

export function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{label}</span>
        <Button variant="ghost" type="button" aria-label={`Copy ${label}`} onClick={() => void navigator.clipboard.writeText(code)}>
          <Copy size={16} />
        </Button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
