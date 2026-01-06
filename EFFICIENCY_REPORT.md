# Efficiency Issues Report

This report documents several efficiency issues identified in the document-guide-buddy codebase that could be improved for better performance and maintainability.

## 1. Duplicate `getPhotoUrl` Function (HIGH PRIORITY)

The `getPhotoUrl` function is duplicated across multiple files with nearly identical implementations:

**Affected files:**
- `src/pages/Discovery.tsx` (lines 41-52)
- `src/pages/Profile.tsx` (lines 112-123)
- `src/pages/Matches.tsx` (lines 33-39)
- `src/pages/Chat.tsx` (lines 69-75)

**Current implementation (repeated 4 times):**
```typescript
const getPhotoUrl = (photoPath: string) => {
  if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
  return data.publicUrl;
};
```

**Recommendation:** Extract this function to `src/lib/utils.ts` or create a dedicated `src/lib/photo-utils.ts` file.

---

## 2. Duplicate Gender Checking Logic (MEDIUM PRIORITY)

Both `Matches.tsx` and `Chat.tsx` contain identical gender-checking logic for determining chat permissions:

**Affected files:**
- `src/pages/Matches.tsx` (lines 99-109)
- `src/pages/Chat.tsx` (lines 94-102)

**Duplicated code:**
```typescript
const norm = (g?: string) => g?.trim();
const isMale = (g?: string) => ["homem", "masculino", "male", "m", "masc"].includes(norm(g || ""));
const isFemale = (g?: string) => ["mulher", "feminino", "female", "f", "fem"].includes(norm(g || ""));
const heteroPair = (isMale(myGenderLower) && isFemale(otherGenderLower)) || 
                   (isFemale(myGenderLower) && isMale(otherGenderLower));
```

**Recommendation:** Extract these helper functions to a shared utility file like `src/lib/gender-utils.ts`.

---

## 3. Duplicate Profile Fetching for Gender (MEDIUM PRIORITY)

Both `Matches.tsx` and `Chat.tsx` have separate useEffect hooks that fetch only the user's gender:

**Affected files:**
- `src/pages/Matches.tsx` (lines 20-31)
- `src/pages/Chat.tsx` (lines 22-33)

**Duplicated pattern:**
```typescript
useEffect(() => {
  const fetchMyProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("gender")
      .eq("id", user.id)
      .single();
    setMyGender(data?.gender || "");
  };
  fetchMyProfile();
}, [user]);
```

**Recommendation:** Create a custom hook like `useUserProfile` that returns the current user's profile data, or extend the existing `useAuth` hook to include profile information.

---

## 4. N+1 Query Pattern in useChat.tsx (HIGH PRIORITY)

In the `fetchMatches` function, there's an N+1 query pattern where unread message counts are fetched individually for each match:

**Location:** `src/hooks/useChat.tsx` (lines 105-115)

**Current implementation:**
```typescript
const unreadCounts = await Promise.all(
  matchesData.map(async (match) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("match_id", match.id)
      .eq("receiver_id", user.id)
      .is("read_at", null);
    return { matchId: match.id, count: count || 0 };
  })
);
```

**Recommendation:** Use a single aggregated query with GROUP BY to fetch all unread counts at once, or consider using a database view/function for this common operation.

---

## 5. Redundant Google Maps API Key Fetching (MEDIUM PRIORITY)

The Google Maps API key is fetched independently in multiple components:

**Affected files:**
- `src/pages/Map.tsx` (lines 63-76)
- `src/components/MapView.tsx` (lines 52-93)

Both components make separate calls to `supabase.functions.invoke('get-google-maps-key')`.

**Recommendation:** Fetch the API key once at a higher level (e.g., in a context provider or the Map page) and pass it down to child components, or use React Context to share the API key across components.

---

## 6. Unused Filters Parameter in useDiscovery.tsx (LOW PRIORITY)

The `filters` parameter is passed to `useDiscovery` and included in the dependency array, but the actual filtering logic doesn't appear to use these filters in the database query:

**Location:** `src/hooks/useDiscovery.tsx` (lines 40-134)

The `fetchDiscoveryUsers` function fetches all users at a location but doesn't apply the filter criteria (intentions, genders, age range, etc.) to the query.

**Recommendation:** Either implement server-side filtering by passing filter parameters to the edge function, or clearly document that filtering happens client-side after the fetch.

---

## 7. Missing Memoization for Utility Functions (LOW PRIORITY)

Several utility functions are defined inside components and recreated on every render:

**Examples:**
- `calculateDistance` in `src/pages/Map.tsx` (lines 219-232)
- `getPhotoUrl` in multiple files (as mentioned above)
- `getTimeRemaining` in `src/pages/Discovery.tsx` (lines 54-65)

**Recommendation:** Either extract these as standalone utility functions outside components, or wrap them with `useCallback` if they need access to component state/props.

---

## Summary

| Issue | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Duplicate `getPhotoUrl` | High | Low | High (DRY violation, maintenance burden) |
| N+1 Query Pattern | High | Medium | High (Performance) |
| Duplicate Gender Logic | Medium | Low | Medium (DRY violation) |
| Duplicate Profile Fetching | Medium | Medium | Medium (Unnecessary API calls) |
| Redundant API Key Fetching | Medium | Low | Medium (Unnecessary API calls) |
| Unused Filters Parameter | Low | Medium | Low (Code clarity) |
| Missing Memoization | Low | Low | Low (Minor performance) |

## Recommended Fix Order

1. **Duplicate `getPhotoUrl`** - Quick win, high impact on code maintainability
2. **N+1 Query Pattern** - Significant performance improvement
3. **Duplicate Gender Logic** - Improves code organization
4. **Redundant API Key Fetching** - Reduces unnecessary API calls
