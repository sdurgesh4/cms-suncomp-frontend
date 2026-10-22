import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PageHeader from "../../components/PageHeader";
import { notificationApi } from "../../api/notificationApi";
import type { Notification } from "../../types/notification";

export default function StudentNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await notificationApi.getAll()); }
    catch { setError("Notifications could not be loaded. Check your connection and try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const markRead = async (id: number) => {
    setWorkingId(id);
    try { await notificationApi.markAsRead(id); setItems((old) => old.map((n) => n.id === id ? { ...n, read: true } : n)); }
    catch { setError("Could not mark this notification as read. Please try again."); }
    finally { setWorkingId(null); }
  };
  const markAllRead = async () => {
    setWorkingId(-1);
    try { await notificationApi.markAllAsRead(); setItems((old) => old.map((n) => ({ ...n, read: true }))); }
    catch { setError("Could not mark notifications as read. Please try again."); }
    finally { setWorkingId(null); }
  };
  const unread = items.filter((n) => !n.read).length;
  return <Stack spacing={3}><PageHeader title="Notifications" subtitle="Announcements, updates and reminders from your institute." /><Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}><CardContent sx={{ p: { xs: 2, md: 3 } }}><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between"><Box><Typography variant="h6" fontWeight={800}>Your notifications</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{unread} unread {unread === 1 ? "notification" : "notifications"}</Typography></Box><Button variant="outlined" startIcon={<DoneAllRoundedIcon />} disabled={!unread || workingId !== null} onClick={() => void markAllRead()}>Mark all as read</Button></Stack><Divider sx={{ my: 2 }} />
    {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>{error}</Alert>}
    {loading ? <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}><CircularProgress /></Box> : items.length === 0 ? <Box sx={{ py: 7, textAlign: "center" }}><NotificationsNoneRoundedIcon sx={{ fontSize: 48, color: "text.disabled" }} /><Typography fontWeight={700} sx={{ mt: 1 }}>No notifications yet</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: .5 }}>New updates will appear here.</Typography></Box> : <Stack divider={<Divider flexItem />} spacing={0}>{items.map((n) => <Box key={n.id} sx={{ py: 2, px: { xs: 1, sm: 1.5 }, display: "flex", gap: 1.5, alignItems: "flex-start", bgcolor: n.read ? "transparent" : "action.hover", borderRadius: 2 }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: n.read ? "divider" : "primary.main", mt: .8, flexShrink: 0 }} /><Box sx={{ flex: 1, minWidth: 0 }}><Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap"><Typography fontWeight={n.read ? 600 : 800}>{n.title}</Typography>{!n.read && <Chip size="small" color="primary" label="New" />}{n.priority === "HIGH" || n.priority === "URGENT" ? <Chip size="small" color="warning" label={n.priority} /> : null}</Stack><Typography variant="body2" color="text.secondary" sx={{ mt: .75, whiteSpace: "pre-wrap" }}>{n.message}</Typography><Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</Typography></Box>{!n.read && <Button size="small" disabled={workingId !== null} onClick={() => void markRead(n.id)}>{workingId === n.id ? "Saving…" : "Mark read"}</Button>}</Box>)}</Stack>}
  </CardContent></Card></Stack>;
}
