# Sidebar & TopNav Layout — Technical Explanation

## Overview

This update replaces the monolithic `BaseLayout.jsx` with a clean, modular layout architecture split into three dedicated components inside `frontend/src/components/layout/`:

| File              | Responsibility                                            |
|-------------------|-----------------------------------------------------------|
| `Sidebar.jsx`     | Persistent vertical navigation panel                      |
| `TopNav.jsx`      | Horizontal top bar with user info, notifications, logout  |
| `MainLayout.jsx`  | Composes Sidebar + TopNav + `<Outlet />` for nested routes |

---

## Component Details

### 1. `Sidebar.jsx`

**Logo:** Displays "CPT" inside a gradient badge with the full name "Campus Placement Tracker" beside it. When collapsed, only the badge is visible.

**Navigation Links:** Five routes with `lucide-react` icons:
- `/` → Dashboard (`LayoutDashboard`)
- `/companies` → Companies (`Building2`)
- `/records` → My Records (`FileText`)
- `/analytics` → Analytics (`BarChart3`)
- `/profile` → Profile (`User`)

**Active Route Highlighting:** Uses `react-router-dom`'s `useLocation()` to compare the current pathname against each nav item. The active link gets:
- A left-edge colored indicator bar
- Primary color tint on text and background
- Visual distinction from inactive gray links

**Responsive Collapse:**
- **Desktop:** A "Collapse" toggle button at the sidebar bottom switches between full-width (256px) and icon-only (72px) modes. Labels and text are hidden when collapsed; icons remain with tooltips.
- **Mobile:** The sidebar is off-screen by default (`-translate-x-full`). Tapping the hamburger menu in `TopNav` slides it in with a semi-transparent backdrop overlay. Tapping outside or on a link closes it.

**Styling:** Dark theme sidebar (`gray-900` → `gray-950` gradient) to create visual separation from the light content area.

---

### 2. `TopNav.jsx`

**Left Section:**
- Hamburger menu button (visible only on mobile `lg:hidden`) that triggers the sidebar overlay
- Dynamic page title derived from the current route pathname

**Right Section:**
- **Bell icon** — notification placeholder with a red dot indicator (ready for future integration)
- **User info** — avatar circle with the user's name pulled from `AuthContext` (`user.full_name` or `user.email`)
- **Logout button** — calls `AuthContext.logout()` to clear the token and auth state, then redirects to `/login` via `useNavigate()`

**Styling:** Glassmorphism-style header with `bg-white/80 backdrop-blur-md` for a modern floating appearance.

---

### 3. `MainLayout.jsx`

Orchestrates the full authenticated page layout:

```
┌──────────────────────────────────────────────────┐
│  Sidebar  │  TopNav                              │
│           │──────────────────────────────────────│
│           │                                      │
│           │  <Outlet />  (page content)           │
│           │                                      │
└──────────────────────────────────────────────────┘
```

- Manages `collapsed` (desktop sidebar toggle) and `mobileOpen` (mobile sidebar toggle) states
- Passes state/handlers down to `Sidebar` and `TopNav` as props
- Uses `<Outlet />` from `react-router-dom` to render nested child routes

---

## Routing Changes (`App.jsx`)

**Before:** Each protected route individually wrapped content with `<ProtectedRoute><BaseLayout><Page /></BaseLayout></ProtectedRoute>`.

**After:** Uses React Router's **layout route pattern**:

```jsx
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route index            element={<Dashboard />} />
  <Route path="companies" element={<Companies />} />
  <Route path="records"   element={<Records />} />
  <Route path="analytics" element={<Analytics />} />
  <Route path="profile"   element={<Profile />} />
</Route>
```

This is cleaner because:
1. `ProtectedRoute` and `MainLayout` are applied **once** to all child routes
2. Adding a new protected page requires only one new `<Route>` line
3. The layout (sidebar/topnav) is mounted once and persists across page navigations — no re-renders of the shell

---

## File Structure

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       ← NEW
│   │   ├── TopNav.jsx        ← NEW
│   │   └── MainLayout.jsx    ← NEW
│   ├── BaseLayout.jsx        ← still present (legacy, no longer imported)
│   └── ProtectedRoute.jsx    ← unchanged
├── store/
│   └── AuthContext.jsx        ← unchanged (provides user, logout)
└── App.jsx                    ← MODIFIED (layout route pattern)
```

---

## Key Dependencies

| Package           | Usage                                      |
|-------------------|--------------------------------------------|
| `react-router-dom`| `useLocation`, `NavLink`, `Outlet`, routing |
| `lucide-react`    | Icons for nav items, bell, logout, menu     |
| `tailwindcss`     | Utility-first styling with custom theme     |
