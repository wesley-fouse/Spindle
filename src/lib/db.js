import { supabase } from "./supabase";

export async function fetchMyEntries(userId) {
  const { data, error } = await supabase.from("entries").select("*").eq("user_id", userId);
  if (error) throw error; return data || [];
}
export async function upsertEntry(userId, album, patch) {
  const row = {
    user_id: userId,
    album_id: String(album.album_id || album.id),
    title: album.title, artist: album.artist, artist_id: album.artist_id || null,
    year: album.year || null, genre: album.genre || null, art: album.art || null,
    ...patch,
  };
  const { data, error } = await supabase.from("entries").upsert(row, { onConflict: "user_id,album_id" }).select().single();
  if (error) throw error; return data;
}
export async function deleteEntry(userId, albumId) {
  const { error } = await supabase.from("entries").delete().eq("user_id", userId).eq("album_id", String(albumId));
  if (error) throw error;
}
export async function fetchAlbumReviews(albumId) {
  const { data, error } = await supabase.from("entries")
    .select("rating,note,listened_on,updated_at,profiles(username,display_name)")
    .eq("album_id", String(albumId)).eq("listened", true).not("note", "is", null).neq("note", "")
    .order("updated_at", { ascending: false }).limit(50);
  if (error) throw error; return data || [];
}
export async function fetchFeed(userId) {
  const { data: f } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
  const ids = (f || []).map(x => x.following_id);
  if (!ids.length) return [];
  const { data, error } = await supabase.from("entries")
    .select("*,profiles(username,display_name)")
    .in("user_id", ids).eq("listened", true)
    .order("listened_on", { ascending: false }).order("updated_at", { ascending: false }).limit(60);
  if (error) throw error; return data || [];
}
export async function getProfile(userId) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}
export async function getProfileByUsername(u) {
  const { data } = await supabase.from("profiles").select("*").eq("username", u).maybeSingle();
  return data;
}
export async function updateProfile(userId, patch) {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single();
  if (error) throw error; return data;
}
export async function searchUsers(q) {
  if (!q.trim()) return [];
  const { data } = await supabase.from("profiles").select("id,username,display_name")
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).limit(10);
  return data || [];
}
export async function fetchUserEntries(userId) {
  const { data } = await supabase.from("entries").select("*").eq("user_id", userId).eq("listened", true)
    .order("listened_on", { ascending: false });
  return data || [];
}
export async function follow(me, target) { await supabase.from("follows").upsert({ follower_id: me, following_id: target }); }
export async function unfollow(me, target) { await supabase.from("follows").delete().eq("follower_id", me).eq("following_id", target); }
export async function amFollowing(me, target) {
  const { data } = await supabase.from("follows").select("following_id").eq("follower_id", me).eq("following_id", target).maybeSingle();
  return !!data;
}
export async function fetchFollowing(userId) {
  const { data } = await supabase.from("follows").select("profiles!follows_following_id_fkey(id,username,display_name)").eq("follower_id", userId);
  return (data || []).map(r => r.profiles).filter(Boolean);
}
export async function fetchFollowers(userId) {
  const { data } = await supabase.from("follows").select("profiles!follows_follower_id_fkey(id,username,display_name)").eq("following_id", userId);
  return (data || []).map(r => r.profiles).filter(Boolean);
}
