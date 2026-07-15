import { PLUGIN_REGISTRY_URL } from "@/constant/env";

// 官方插件清单里的一条(entry 已解析成绝对 URL)
export type OfficialPluginEntry = {
    id: string;
    name: string;
    version: string;
    description?: string;
    icon?: string;
    url: string;
};

type RawEntry = { id?: string; name?: string; version?: string; description?: string; icon?: string; entry?: string; url?: string };
type RawManifest = { plugins?: RawEntry[] };

// 拉取官方插件清单;entry(相对文件名)按清单地址解析成绝对 URL,再走既有 URL 安装流程
export async function fetchOfficialPlugins(registryUrl: string = PLUGIN_REGISTRY_URL): Promise<OfficialPluginEntry[]> {
    const response = await fetch(registryUrl, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`获取官方插件列表失败 (HTTP ${response.status})`);
    const data = (await response.json()) as RawManifest;
    const list = Array.isArray(data?.plugins) ? data.plugins : [];
    return list
        .filter((item): item is RawEntry & { id: string } => Boolean(item && item.id && (item.entry || item.url)))
        .map((item) => ({
            id: item.id,
            name: item.name || item.id,
            version: item.version || "0.0.0",
            description: item.description,
            icon: item.icon,
            url: item.url ? item.url : new URL(item.entry as string, registryUrl).toString(),
        }));
}
