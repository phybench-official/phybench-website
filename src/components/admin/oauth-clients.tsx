"use client";

// 下游应用（OAuth 客户端）管理：创建、查看、启用/禁用、删除。
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface OAuthClient {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  scopes: string[];
  isConfidential: boolean;
  disabled: boolean;
  createdAt: string;
}

interface CreatedSecret {
  clientId: string;
  clientSecret: string;
}

const ALL_SCOPES = ["openid", "profile", "email", "offline_access"];

export default function OAuthClientsPage({ issuer }: { issuer: string }) {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);

  // 创建表单状态
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [postLogoutRedirectUris, setPostLogoutRedirectUris] = useState("");
  const [scopes, setScopes] = useState<string[]>([
    "openid",
    "profile",
    "email",
  ]);
  const [isConfidential, setIsConfidential] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedSecret | null>(null);

  // 已注册应用的登出回跳白名单就地编辑（一次只编辑一个）。
  // 之所以要有它而不是只在创建表单里给一个框：需要配这个白名单的客户端
  // 早就存在了，只能创建时填等于仍然要开 psql。
  const [logoutEditId, setLogoutEditId] = useState<string | null>(null);
  const [logoutEditValue, setLogoutEditValue] = useState("");
  const [logoutSaving, setLogoutSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/oauth-clients");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setClients(data.clients);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "加载客户端失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleScope = (s: string) => {
    if (s === "openid") return; // openid 必选
    setScopes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("请填写应用名称");
    const uris = redirectUris
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (uris.length === 0) return toast.error("请至少填写一个回调地址");
    const logoutUris = postLogoutRedirectUris
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/oauth-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          redirectUris: uris,
          // 没填就不发这个 key。后端两处都以 Array.isArray 为门卫，
          // 「不发」和「发空数组」语义不同：后者在 PATCH 上等于主动清空白名单。
          // 创建时两者结果相同，但保持同一个约定，免得以后复制这段代码出事。
          ...(logoutUris.length > 0
            ? { postLogoutRedirectUris: logoutUris }
            : {}),
          scopes,
          isConfidential,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建失败");
      setCreated({ clientId: data.clientId, clientSecret: data.clientSecret });
      toast.success("创建成功，请立即保存 client_secret");
      setName("");
      setDescription("");
      setRedirectUris("");
      setPostLogoutRedirectUris("");
      setScopes(["openid", "profile", "email"]);
      setIsConfidential(true);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDisabled = async (c: OAuthClient) => {
    try {
      const res = await fetch(`/api/admin/oauth-clients/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !c.disabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "操作失败");
      toast.success(c.disabled ? "已启用" : "已禁用");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    }
  };

  const saveLogoutUris = async (c: OAuthClient) => {
    const uris = logoutEditValue
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    setLogoutSaving(true);
    try {
      const res = await fetch(`/api/admin/oauth-clients/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // 只发这一个 key：PATCH 的其余字段都以 Array.isArray / typeof 为门卫，
        // 不发就不会被覆盖。空数组是**有意**的清空，不是「没填」。
        body: JSON.stringify({ postLogoutRedirectUris: uris }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      toast.success(uris.length === 0 ? "已清空登出回跳白名单" : "已保存");
      setLogoutEditId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setLogoutSaving(false);
    }
  };

  const remove = async (c: OAuthClient) => {
    if (!confirm(`确认删除应用「${c.name}」？该应用将立即无法登录。`)) return;
    try {
      const res = await fetch(`/api/admin/oauth-clients/${c.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "删除失败");
      toast.success("已删除");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} 已复制`),
      () => toast.error("复制失败"),
    );
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">下游应用（OAuth 客户端）管理</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          在此注册的应用可通过本站以 OIDC 方式间接登录 UAAA。Issuer：
          <code className="bg-muted ml-1 rounded px-1">{issuer}</code>
        </p>
      </div>

      {/* 新建客户端后一次性展示的凭据 */}
      {created && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 dark:bg-green-950/30">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-green-700 dark:text-green-400">
              创建成功 · 请立即保存以下凭据（仅此一次）
            </h2>
            <button
              onClick={() => setCreated(null)}
              className="text-sm text-green-700 hover:underline dark:text-green-400"
            >
              我已保存，关闭
            </button>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>
                client_id: <b>{created.clientId}</b>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(created.clientId, "client_id")}
              >
                复制
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="break-all">
                client_secret: <b>{created.clientSecret}</b>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(created.clientSecret, "client_secret")}
              >
                复制
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 创建表单 */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">注册新应用</h2>
        <div className="space-y-1">
          <label className="text-sm font-medium">应用名称 *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：PhyBench 排行榜前端"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">描述（可选）</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="用途说明"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            回调地址 redirect_uri（每行一个，精确匹配）*
          </label>
          <Textarea
            value={redirectUris}
            onChange={(e) => setRedirectUris(e.target.value)}
            rows={3}
            placeholder={"https://app.example.com/api/auth/callback/phybench"}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            登出后回跳地址 post_logout_redirect_uri（每行一个，可选）
          </label>
          <Textarea
            value={postLogoutRedirectUris}
            onChange={(e) => setPostLogoutRedirectUris(e.target.value)}
            rows={2}
            placeholder={"https://app.example.com/"}
          />
          <p className="text-muted-foreground text-xs">
            必须与下游登出后实际跳转的地址<b>逐字节相同</b>
            ，含协议、端口和结尾斜杠。不匹配时登出照常完成、
            <b>但静默忽略回跳</b>
            ，用户会停在一个 JSON 页面上 ——
            症状很像「端点没生效」，实际是这里配错了。
            留空则该应用不允许带回跳地址登出。
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">授权 scope</label>
          <div className="flex flex-wrap gap-3">
            {ALL_SCOPES.map((s) => (
              <label key={s} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={scopes.includes(s)}
                  disabled={s === "openid"}
                  onChange={() => toggleScope(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isConfidential}
            onChange={(e) => setIsConfidential(e.target.checked)}
          />
          机密客户端（有后端，校验 client_secret；前端 SPA 请取消勾选并使用
          PKCE）
        </label>
        <Button onClick={handleCreate} disabled={submitting}>
          {submitting ? "创建中…" : "创建应用"}
        </Button>
      </div>

      {/* 客户端列表 */}
      <div className="space-y-3">
        <h2 className="font-semibold">已注册应用（{clients.length}）</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">加载中…</p>
        ) : clients.length === 0 ? (
          <p className="text-muted-foreground text-sm">暂无应用</p>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {c.disabled && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-400">
                      已禁用
                    </span>
                  )}
                  {!c.isConfidential && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      公共/PKCE
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDisabled(c)}
                  >
                    {c.disabled ? "启用" : "禁用"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(c)}
                  >
                    删除
                  </Button>
                </div>
              </div>
              {c.description && (
                <p className="text-muted-foreground text-sm">{c.description}</p>
              )}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">client_id:</span>
                  <span>{c.clientId}</span>
                  <button
                    onClick={() => copy(c.clientId, "client_id")}
                    className="text-blue-600 hover:underline"
                  >
                    复制
                  </button>
                </div>
                <div>
                  <span className="text-muted-foreground">scope:</span>{" "}
                  {c.scopes.join(" ")}
                </div>
                <div>
                  <span className="text-muted-foreground">redirect_uris:</span>
                  <ul className="ml-4 list-disc">
                    {c.redirectUris.map((u) => (
                      <li key={u} className="break-all">
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      post_logout_redirect_uris:
                    </span>
                    {logoutEditId !== c.id && (
                      <button
                        onClick={() => {
                          setLogoutEditId(c.id);
                          setLogoutEditValue(
                            c.postLogoutRedirectUris.join("\n"),
                          );
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        编辑
                      </button>
                    )}
                  </div>
                  {logoutEditId === c.id ? (
                    <div className="mt-1 space-y-2">
                      <Textarea
                        value={logoutEditValue}
                        onChange={(e) => setLogoutEditValue(e.target.value)}
                        rows={2}
                        placeholder={"https://app.example.com/"}
                        className="font-mono text-xs"
                      />
                      <p className="text-muted-foreground">
                        每行一个，与下游落地地址<b>逐字节相同</b>
                        （含结尾斜杠）。不匹配 = 静默不回跳，用户停在 JSON 页。
                        清空则收回该应用带回跳登出的能力。
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveLogoutUris(c)}
                          disabled={logoutSaving}
                        >
                          {logoutSaving ? "保存中…" : "保存"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLogoutEditId(null)}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : c.postLogoutRedirectUris.length === 0 ? (
                    <span className="text-muted-foreground ml-1">
                      未配置（该应用登出后不回跳）
                    </span>
                  ) : (
                    <ul className="ml-4 list-disc">
                      {c.postLogoutRedirectUris.map((u) => (
                        <li key={u} className="break-all">
                          {u}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
