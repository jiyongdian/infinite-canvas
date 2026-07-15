// HTML 节点:沙箱 iframe 渲染 HTML,{{input}} 会替换为上游文本节点内容。
import { definePlugin, useMemo, useState } from "@infinite-canvas/plugin-sdk";
import type { CanvasNodeContentProps } from "@infinite-canvas/plugin-sdk";

function HtmlContent({ ctx }: CanvasNodeContentProps) {
    const [editing, setEditing] = useState(false);
    const value = ctx.node.metadata?.content || "";
    const upstreamText = useMemo(
        () =>
            ctx
                .getUpstream()
                .map((node) => node.metadata?.content)
                .filter(Boolean)
                .join("\n"),
        [ctx],
    );
    const html = value.replace(/\{\{\s*input\s*\}\}/g, upstreamText);

    const toggle = { position: "absolute", right: 8, top: 8, zIndex: 20, width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 8, border: `1px solid ${ctx.theme.node.stroke}`, background: `${ctx.theme.toolbar.panel}dd`, color: ctx.theme.node.text, cursor: "pointer" } as const;

    return (
        <div data-canvas-no-zoom onMouseDown={(e) => e.stopPropagation()} style={{ position: "relative", height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            <button type="button" style={toggle} onClick={() => setEditing((v) => !v)} title={editing ? "预览" : "编辑源码"}>
                {editing ? "👁" : "✎"}
            </button>
            {editing ? (
                <textarea autoFocus value={value} placeholder="<div>Hello, {{input}}</div>" onChange={(e) => ctx.updateMetadata({ content: e.target.value })} onWheel={(e) => e.stopPropagation()} style={{ height: "100%", width: "100%", resize: "none", background: "transparent", padding: 16, fontFamily: "monospace", fontSize: 12, outline: "none", border: "none", color: ctx.theme.node.text }} />
            ) : value ? (
                <iframe title="html-preview" sandbox="allow-scripts allow-forms" style={{ height: "100%", width: "100%", border: 0, borderRadius: 16, background: "#fff" }} srcDoc={html} />
            ) : (
                <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: ctx.theme.node.placeholder }}>
                    <span style={{ fontSize: 26 }}>{"</>"}</span>
                    <span style={{ fontSize: 14 }}>编辑 HTML 源码</span>
                </div>
            )}
        </div>
    );
}

export default definePlugin({
    id: "html",
    name: "HTML 节点",
    version: "1.0.0",
    description: "沙箱 iframe 渲染 HTML,支持 {{input}} 注入上游文本",
    nodes: [
        {
            type: "html:render",
            title: "HTML",
            icon: "🌐",
            description: "沙箱渲染 HTML",
            defaultSize: { width: 420, height: 320 },
            defaultMetadata: { content: "" },
            minimapColor: "#ec4899",
            Content: HtmlContent,
        },
    ],
});
