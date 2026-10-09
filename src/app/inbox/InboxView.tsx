"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useRequireAuth } from "@/components/AuthProvider";
import { accountName } from "@/lib/account";
import { forumName, isModerator, timeAgo } from "@/lib/forum";
import { collabEmail } from "@/lib/socials";
import {
  BRAND_NAME,
  FOLDERS,
  KIND_ICON,
  MESSAGE_MAX,
  MESSAGE_SUBJECTS,
  OTHER_SUBJECT,
  SALE_SUBJECTS,
  SUBJECT_MAX,
  brandContactId,
  deleteNotification,
  folderOf,
  groupConversations,
  listMessages,
  listNotifications,
  markConversationRead,
  markNotificationsRead,
  messageRecipient,
  sendAnnouncement,
  sendMessage,
  watchInbox,
  type FolderKey,
  type Message,
  type Notification,
} from "@/lib/inbox";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

// The name others see on messages you send.
function senderName(user: User | null, moderator: boolean): string {
  if (moderator) return BRAND_NAME;
  return forumName(user) || accountName(user) || (user?.email ?? "").split("@")[0] || "Member";
}

// The composer's subject picker: a fixed list, "Other" (type your own), or "reply" to keep the conversation's subject.
const REPLY = "__reply";

const EMPTY_TEXT: Record<FolderKey, { icon: string; title: string; text: React.ReactNode }> = {
  all: { icon: "📥", title: "You're all caught up.", text: "Messages, forum replies, website updates and group events all land here." },
  messages: { icon: "✉️", title: "No messages yet.", text: "" },
  offers: {
    icon: "💰",
    title: "No offers yet.",
    text: (
      <>
        Make your{" "}
        <Link href="/collection" className="text-[#D9A43A]">
          collection
        </Link>{" "}
        public and anyone can make an offer on your watches. Make your{" "}
        <Link href="/wishlist" className="text-[#D9A43A]">
          wishlist
        </Link>{" "}
        public and people can offer to sell you the watches on it. Offers land here and in your email.
      </>
    ),
  },
  alerts: {
    icon: "🏷️",
    title: "No price alerts yet.",
    text: (
      <>
        Turn on <span className="text-slate-200">🔔 Price alert</span> for a watch on your{" "}
        <Link href="/wishlist" className="text-[#D9A43A]">
          wishlist
        </Link>{" "}
        and we&apos;ll tell you when it&apos;s listed at or below your target price.
      </>
    ),
  },
  forum: {
    icon: "💬",
    title: "No forum alerts yet.",
    text: (
      <>
        Replies to your posts, and new activity in discussions or subjects you <span className="text-slate-200">Follow</span> in the{" "}
        <Link href="/forum" className="text-[#D9A43A]">
          forum
        </Link>
        , show up here.
      </>
    ),
  },
  updates: { icon: "📢", title: "No website updates yet.", text: "News and new features from Brandon's Brands will appear here." },
  events: { icon: "📅", title: "No group events yet.", text: "Watch meetups, group events and updates will appear here." },
};

export default function InboxView() {
  const { user, guestMode, loading: authLoading } = useRequireAuth();
  const userId = !guestMode ? user?.id ?? null : null;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // ?member=<handle> comes from a "Message" button on a public collection or wishlist.
  const memberHandle = params.get("member");
  const [member, setMember] = useState<{ handle: string; id: string | null; name: string; note?: string } | null>(null);
  const memberReady = member && member.handle === memberHandle ? member : null;
  const toId = params.get("to") ?? memberReady?.id ?? null;
  const toName = params.get("name") ?? memberReady?.name ?? "";
  const folderParam = params.get("folder") ?? (params.get("tab") === "messages" ? "messages" : null);
  const folder: FolderKey =
    toId || memberHandle ? "messages" : FOLDERS.some((f) => f.key === folderParam) ? (folderParam as FolderKey) : "all";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderator, setModerator] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [pickedId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [subjectChoice, setSubjectChoice] = useState<string | null>(null);
  const [otherSubject, setOtherSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadEnd = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [n, m] = await Promise.all([listNotifications(userId, 300), listMessages(userId)]);
      setNotifications(n);
      setMessages(m);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your inbox.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void load();
    void isModerator(userId).then(setModerator);
    void brandContactId().then(setBrandId);
    return watchInbox(userId, () => void load());
  }, [userId, load]);

  useEffect(() => {
    if (!userId || !memberHandle) return;
    let live = true;
    messageRecipient(memberHandle)
      .then((r) => {
        if (!live) return;
        if (!r) setMember({ handle: memberHandle, id: null, name: "", note: "That member couldn't be found. They may have changed their public name." });
        else if (r.user_id === userId) setMember({ handle: memberHandle, id: null, name: r.display_name, note: "That's your own public list. 🙂" });
        else setMember({ handle: memberHandle, id: r.user_id, name: r.display_name });
      })
      .catch((err) => live && setMember({ handle: memberHandle, id: null, name: "", note: err instanceof Error ? err.message : "Couldn't find that member." }));
    return () => {
      live = false;
    };
  }, [userId, memberHandle]);

  // A "Message" link (?to=…&name=…) opens that conversation until another one is picked.
  const activeId = pickedId ?? toId;

  const conversations = useMemo(() => (userId ? groupConversations(messages, userId) : []), [messages, userId]);
  const active = conversations.find((c) => c.otherId === activeId);
  const activeName = active?.otherName || (activeId === toId ? toName : "") || (activeId === brandId ? BRAND_NAME : "Member");
  const thread = useMemo(() => messages.filter((m) => m.sender_id === activeId || m.recipient_id === activeId), [messages, activeId]);

  const unreadByFolder = useMemo(() => {
    const counts: Record<FolderKey, number> = { all: 0, messages: 0, offers: 0, alerts: 0, forum: 0, updates: 0, events: 0 };
    for (const n of notifications) if (!n.read_at) counts[folderOf(n.kind)] += 1;
    counts.messages = conversations.reduce((sum, c) => sum + c.unread, 0);
    counts.all = counts.messages + counts.offers + counts.alerts + counts.forum + counts.updates + counts.events;
    return counts;
  }, [notifications, conversations]);

  const shown = folder === "all" ? notifications : notifications.filter((n) => folderOf(n.kind) === folder);
  const unreadShown = shown.filter((n) => !n.read_at);

  // Opening a conversation marks its messages read.
  useEffect(() => {
    if (!userId || !activeId || folder !== "messages") return;
    if (thread.some((m) => m.recipient_id === userId && !m.read_at)) {
      void markConversationRead(userId, activeId).then(() =>
        setMessages((cur) =>
          cur.map((m) => (m.sender_id === activeId && m.recipient_id === userId && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m)),
        ),
      );
    }
    threadEnd.current?.scrollIntoView({ block: "end" });
  }, [userId, activeId, thread, folder]);

  const goFolder = (next: FolderKey) => {
    setActiveId(null);
    router.replace(next === "all" ? pathname : `${pathname}?folder=${next}`, { scroll: false });
  };

  const openConversation = (otherId: string) => {
    setActiveId(otherId);
    setSendError(null);
    setSubjectChoice(null);
    setOtherSubject("");
    if (folder !== "messages" || toId || memberHandle) router.replace(`${pathname}?folder=messages`, { scroll: false });
  };

  // The conversation's current subject (the most recent one used), for replies.
  const threadSubject = [...thread].reverse().find((m) => m.subject)?.subject ?? null;
  const choice = subjectChoice ?? (thread.length ? REPLY : "");
  const subjectToSend = choice === REPLY ? threadSubject : choice === OTHER_SUBJECT ? otherSubject.trim() : choice;
  const subjectMissing = !thread.length && !subjectToSend;
  const saleTip = SALE_SUBJECTS.has(choice === REPLY ? threadSubject ?? "" : choice);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId || !activeId || !draft.trim()) return;
    if (subjectMissing || (choice === OTHER_SUBJECT && !otherSubject.trim())) {
      setSendError(choice === OTHER_SUBJECT ? "Type a subject for your message." : "Pick a subject for your message.");
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const sent = await sendMessage({
        recipient_id: activeId,
        recipient_name: activeName.slice(0, 60),
        sender_name: senderName(user, moderator).slice(0, 60),
        subject: subjectToSend || null,
        body: draft,
      });
      setMessages((cur) => (cur.some((m) => m.id === sent.id) ? cur : [...cur, sent]));
      setDraft("");
      setSubjectChoice(null);
      setOtherSubject("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Couldn't send that.");
    } finally {
      setSending(false);
    }
  };

  const openNotification = async (n: Notification) => {
    if (!n.read_at) {
      await markNotificationsRead([n.id]).catch(() => {});
      setNotifications((cur) => cur.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
    if (!n.link) return;
    if (/^https?:\/\//.test(n.link)) window.open(n.link, "_blank", "noopener");
    else router.push(n.link);
  };

  const markShownRead = async () => {
    const ids = unreadShown.map((n) => n.id);
    await markNotificationsRead(ids).catch(() => {});
    const now = new Date().toISOString();
    setNotifications((cur) => cur.map((n) => (ids.includes(n.id) ? { ...n, read_at: now } : n)));
  };

  const removeNotification = async (id: string) => {
    await deleteNotification(id).catch(() => {});
    setNotifications((cur) => cur.filter((n) => n.id !== id));
  };

  if (authLoading) return <div className="p-10 text-center text-slate-300">Loading inbox…</div>;

  if (!userId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-slate-300">
        <p className="text-lg font-semibold text-white">Your inbox is for members.</p>
        <p className="mt-2">
          <Link href="/login" className="font-semibold text-[#D9A43A]">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-semibold text-[#D9A43A]">
            create an account
          </Link>{" "}
          to get messages, forum alerts, website updates and group events.
        </p>
      </div>
    );
  }

  const showBrandStarter = brandId && brandId !== userId && !conversations.some((c) => c.otherId === brandId);
  const folderInfo = FOLDERS.find((f) => f.key === folder)!;
  const unreadConversations = conversations.filter((c) => c.unread);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-14">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Inbox</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Your messages &amp; alerts</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Inbox folders">
            {FOLDERS.map((f) => {
              const activeFolder = folder === f.key;
              const count = unreadByFolder[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => goFolder(f.key)}
                  aria-current={activeFolder ? "page" : undefined}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm transition ${
                    activeFolder ? "border-blue-400/40 bg-blue-500/15 text-blue-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="whitespace-nowrap">
                    <span className="mr-2">{f.icon}</span>
                    {f.name}
                  </span>
                  {count ? <span className="shrink-0 rounded-full bg-[#D9A43A] px-2 text-[11px] font-bold text-black">{count}</span> : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {error ? <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-10 text-center text-amber-200">{error}</div> : null}

          {!error && folder !== "messages" ? (
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3 px-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {folderInfo.icon} {folderInfo.name}
                  </h2>
                  <p className="text-sm text-slate-400">{folderInfo.hint}</p>
                </div>
                {unreadShown.length ? (
                  <button type="button" onClick={markShownRead} className="shrink-0 text-xs font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
                    Mark all read
                  </button>
                ) : null}
              </div>

              {moderator && (folder === "updates" || folder === "events") ? (
                <AnnouncementComposer kind={folder === "updates" ? "site_update" : "group_event"} onSent={() => void load()} />
              ) : null}

              {folder === "all" && unreadConversations.length ? (
                <ul className="mb-2">
                  {unreadConversations.map((c) => (
                    <li key={c.otherId}>
                      <button type="button" onClick={() => openConversation(c.otherId)} className="flex w-full items-start gap-3 rounded-2xl px-2 py-3 text-left hover:bg-white/5">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#D9A43A]" />
                        <span className="text-lg">✉️</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-white">
                            {c.unread} new message{c.unread === 1 ? "" : "s"} from {c.otherName}
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-slate-400">
                            {c.last.subject ? <span className="text-slate-200">{c.last.subject} · </span> : null}
                            {c.last.body}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">{timeAgo(c.last.created_at)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {loading ? (
                <p className="p-8 text-center text-slate-400">Loading…</p>
              ) : !shown.length && !(folder === "all" && unreadConversations.length) ? (
                <div className="p-10 text-center text-slate-300">
                  <div className="text-4xl">{EMPTY_TEXT[folder].icon}</div>
                  <p className="mt-3 font-semibold text-white">{EMPTY_TEXT[folder].title}</p>
                  <p className="mt-1 text-sm text-slate-400">{EMPTY_TEXT[folder].text}</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {shown.map((n) => (
                    <li key={n.id} className="flex items-start gap-3 rounded-2xl px-2 py-3 hover:bg-white/5">
                      <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-[#D9A43A]"}`} />
                      <span className="text-lg">{KIND_ICON[n.kind] ?? "🔔"}</span>
                      <button type="button" onClick={() => openNotification(n)} className="min-w-0 flex-1 text-left">
                        <span className={`block text-sm ${n.read_at ? "text-slate-300" : "font-semibold text-white"}`}>{n.title}</span>
                        {n.body ? <span className="mt-0.5 block whitespace-pre-wrap text-sm text-slate-400 line-clamp-3">{n.body}</span> : null}
                        <span className="mt-1 block text-xs text-slate-500">
                          {folder === "all" ? `${FOLDERS.find((f) => f.key === folderOf(n.kind))?.name} · ` : ""}
                          {timeAgo(n.created_at)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeNotification(n.id)}
                        aria-label="Remove"
                        className="shrink-0 rounded-full px-2 text-slate-500 opacity-60 hover:text-rose-300 hover:opacity-100"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {!error && folder === "messages" ? (
            <section className="grid min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 md:grid-cols-[280px_1fr]">
              <aside className={`border-white/10 md:border-r ${activeId ? "hidden md:block" : ""}`}>
                <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">Conversations</div>
                <ul>
                  {showBrandStarter ? (
                    <li>
                      <button type="button" onClick={() => openConversation(brandId!)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9A43A] text-xs font-bold text-black">BB</span>
                        <span>
                          <span className="block text-sm font-semibold text-white">Message {BRAND_NAME}</span>
                          <span className="block text-xs text-slate-400">Questions, collabs, feedback</span>
                        </span>
                      </button>
                    </li>
                  ) : null}
                  {toId && !conversations.some((c) => c.otherId === toId) ? (
                    <li>
                      <button type="button" onClick={() => setActiveId(toId)} className="flex w-full items-center gap-3 bg-white/5 px-4 py-3 text-left">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                          {(toName || "?").slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-white">New message to {toName || "member"}</span>
                      </button>
                    </li>
                  ) : null}
                  {conversations.map((c) => (
                    <li key={c.otherId}>
                      <button
                        type="button"
                        onClick={() => openConversation(c.otherId)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 ${activeId === c.otherId ? "bg-white/5" : ""}`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            c.otherName === BRAND_NAME ? "bg-[#D9A43A] text-black" : "bg-white/10 text-white"
                          }`}
                        >
                          {c.otherName === BRAND_NAME ? "BB" : c.otherName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className={`truncate text-sm ${c.unread ? "font-semibold text-white" : "text-slate-200"}`}>{c.otherName}</span>
                            <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(c.last.created_at)}</span>
                          </span>
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-slate-400">
                              {c.last.sender_id === userId ? "You: " : ""}
                              {c.last.subject ? `${c.last.subject} · ` : ""}
                              {c.last.body}
                            </span>
                            {c.unread ? <span className="shrink-0 rounded-full bg-[#D9A43A] px-1.5 text-[10px] font-bold text-black">{c.unread}</span> : null}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                  {memberHandle && memberReady?.note ? (
                    <li className="mx-3 my-3 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{memberReady.note}</li>
                  ) : null}
                  {memberHandle && !memberReady ? <li className="px-4 py-3 text-sm text-slate-400">Finding that member…</li> : null}
                  <li className="px-4 py-4 text-xs leading-5 text-slate-500">
                    {conversations.length ? "Start a new conversation" : "No messages yet. Start one"} with <span className="text-slate-300">Message</span>{" "}
                    next to a member&apos;s name in the{" "}
                    <Link href="/forum" className="text-[#D9A43A] hover:text-[#e1b54a]">
                      forum
                    </Link>{" "}
                    or on a public list in{" "}
                    <Link href="/collectors" className="text-[#D9A43A] hover:text-[#e1b54a]">
                      Collectors
                    </Link>
                    .
                  </li>
                </ul>
              </aside>

              <div className={`flex flex-col ${activeId ? "" : "hidden md:flex"}`}>
                {activeId ? (
                  <>
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(null);
                          if (toId || memberHandle) router.replace(`${pathname}?folder=messages`, { scroll: false });
                        }}
                        className="text-slate-400 hover:text-white md:hidden"
                        aria-label="Back to conversations"
                      >
                        ←
                      </button>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{activeName}</p>
                        {threadSubject ? <p className="truncate text-xs text-slate-400">{threadSubject}</p> : null}
                      </div>
                    </div>
                    <div className="max-h-[28rem] flex-1 space-y-3 overflow-y-auto px-4 py-4">
                      {!thread.length ? <p className="py-8 text-center text-sm text-slate-400">Say hello 👋</p> : null}
                      {thread.map((m, i) => {
                        const mine = m.sender_id === userId;
                        // Show the subject when it starts or changes, not on every reply.
                        const prevSubject = thread.slice(0, i).reverse().find((x) => x.subject)?.subject ?? null;
                        const showSubject = m.subject && m.subject !== prevSubject;
                        return (
                          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-[#D9A43A] text-black" : "bg-white/10 text-slate-100"}`}>
                              {showSubject ? (
                                <p className={`mb-1 text-[11px] font-bold uppercase tracking-[0.12em] ${mine ? "text-black/70" : "text-blue-200"}`}>{m.subject}</p>
                              ) : null}
                              <p className="whitespace-pre-wrap break-words">{m.body}</p>
                              <p className={`mt-1 text-[10px] ${mine ? "text-black/60" : "text-slate-400"}`}>
                                {timeAgo(m.created_at)}
                                {mine && m.read_at ? " · Read" : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={threadEnd} />
                    </div>
                    <form onSubmit={handleSend} className="border-t border-white/10 p-3">
                      {!thread.length ? (
                        <div className="mb-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-xs leading-5 text-blue-100">
                          <span className="font-semibold text-white">Before you send:</span> messages are private between you and {activeName}. Be
                          respectful, and keep personal details like your address, phone number and payment information out of messages.
                        </div>
                      ) : null}
                      <div className="mb-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <label className="block">
                          <span className="sr-only">Subject</span>
                          <select
                            value={choice}
                            onChange={(e) => {
                              setSubjectChoice(e.target.value);
                              setSendError(null);
                            }}
                            required={!thread.length}
                            className={`${input} py-2.5 text-sm ${choice ? "" : "text-slate-400"}`}
                          >
                            {thread.length ? (
                              <option value={REPLY}>{threadSubject ? `Reply · ${threadSubject}` : "Reply"}</option>
                            ) : (
                              <option value="" disabled>
                                Pick a subject…
                              </option>
                            )}
                            {MESSAGE_SUBJECTS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                            <option value={OTHER_SUBJECT}>Other (type your own)</option>
                          </select>
                        </label>
                        {choice === OTHER_SUBJECT ? (
                          <label className="block">
                            <span className="sr-only">Your subject</span>
                            <input
                              value={otherSubject}
                              onChange={(e) => setOtherSubject(e.target.value)}
                              maxLength={SUBJECT_MAX}
                              required
                              autoFocus
                              placeholder="What's it about?"
                              className={`${input} py-2.5 text-sm`}
                            />
                          </label>
                        ) : null}
                      </div>
                      {saleTip ? (
                        <p className="mb-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-[11px] leading-5 text-amber-100">
                          Buying or selling? Brandon&apos;s Brands isn&apos;t a party to sales between members, isn&apos;t responsible for them and doesn&apos;t hold or guarantee funds or verify watches.
                          Use a trusted escrow or authentication service, or meet in a safe public place, and never send money by gift card or wire to
                          someone you haven&apos;t verified.
                        </p>
                      ) : null}
                      {sendError ? <p className="mb-2 text-sm text-rose-300">{sendError}</p> : null}
                      <div className="flex gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              (e.currentTarget.form as HTMLFormElement).requestSubmit();
                            }
                          }}
                          rows={thread.length ? 2 : 4}
                          maxLength={MESSAGE_MAX}
                          aria-label="Message"
                          placeholder={`Message ${activeName}…`}
                          className={`${input} resize-none`}
                        />
                        <button
                          type="submit"
                          disabled={sending || !draft.trim() || subjectMissing}
                          className="shrink-0 self-end rounded-full bg-[#D9A43A] px-5 py-3 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-50"
                        >
                          {sending ? "…" : "Send"}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        Sending as {senderName(user, moderator)}. Enter to send, Shift+Enter for a new line. Messages between members aren&apos;t
                        checked by Brandon&apos;s Brands. Report anything inappropriate to{" "}
                        <a href={`mailto:${collabEmail}`} className="underline hover:text-slate-300">
                          {collabEmail}
                        </a>
                        .
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-slate-400">Choose a conversation.</div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Moderators only: send a website update or group event to every member's inbox.
function AnnouncementComposer({ kind, onSent }: { kind: "site_update" | "group_event"; onSent: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", link: "" });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const label = kind === "site_update" ? "website update" : "group event";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!window.confirm(`Send this ${label} to every member's inbox?`)) return;
    setBusy(true);
    setStatus(null);
    try {
      const count = await sendAnnouncement({ kind, ...form });
      setStatus({ ok: true, text: `Sent to ${count} member${count === 1 ? "" : "s"}.` });
      setForm({ title: "", body: "", link: "" });
      setOpen(false);
      onSent();
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : "Couldn't send that." });
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 px-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-[#D9A43A]/50 bg-[#D9A43A]/10 px-4 py-2 text-sm font-semibold text-[#D9A43A] hover:bg-[#D9A43A]/20"
        >
          + Send a {label} to all members
        </button>
        {status ? <span className={`text-sm ${status.ok ? "text-emerald-300" : "text-rose-300"}`}>{status.text}</span> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mb-4 grid gap-3 rounded-2xl border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-[#D9A43A]">New {label} · goes to every member · moderators only</p>
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        maxLength={150}
        required
        placeholder={kind === "site_update" ? "e.g. New: scan your wishlist from a photo" : "e.g. NJ watch meetup, Saturday Nov 14"}
        className={input}
      />
      <textarea
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
        maxLength={3000}
        rows={4}
        placeholder={kind === "site_update" ? "What's new and how to use it" : "Date, time, place and details"}
        className={input}
      />
      <input
        value={form.link}
        onChange={(e) => setForm({ ...form, link: e.target.value })}
        placeholder="Optional link, e.g. /forum or https://…"
        className={input}
      />
      {status && !status.ok ? <p className="text-sm text-rose-300">{status.text}</p> : null}
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-[#D9A43A] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-60">
          {busy ? "Sending…" : "Send to all members"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200">
          Cancel
        </button>
      </div>
    </form>
  );
}
