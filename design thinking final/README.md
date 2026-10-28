# CAMPUS • The College Companion Web Application

> **Design Thinking Project — 3rd Semester**  
> A high-fidelity, data-grounded single-campus web application matching all design specifications, backed by Supabase PostgreSQL, Authentication, and real campus schedule data.

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🏛️ Project Overview

**CAMPUS** is designed to solve real daily campus friction points for students, faculty, and administrative staff. Built around a cohesive, warm editorial aesthetic, it integrates real-time classroom availability, campus calendars, faculty cabin directories, maintenance issue ticketing, peer-to-peer marketplace, and lost-and-found recovery.

---

## 🎨 Visual Identity & Design System

The application strictly implements the design tokens from the design references:

| Token | Value | Role / Usage |
|---|---|---|
| **Canvas** | `#FBF9F5` / `#FAF8F5` | Warm, non-sterile off-white background |
| **Headline Accent** | `#3D775F` | Accent color for uppercase hero words (`SPOT.`, `SPACE.`, `EVENTS.`, `FACULTY.`, `Sell.`, `Found`) |
| **Brand / Primary** | `#155137` | Solid action buttons, search pills, active status dots |
| **Charcoal** | `#121614` | Primary high-contrast text |
| **Charcoal Muted** | `#66706B` | Secondary descriptions and metadata labels |
| **Display Font** | `Barlow Condensed` | Uppercase headings and metric counters |
| **Body Font** | `Plus Jakarta Sans` | Interface elements, labels, and paragraph copy |

---

## 🚀 Core Features & Pages

### 1. Homepage (`1) HOMEPAGE.jpeg`)
- **Hero Banner:** Full-width editorial hero with accent underline and `#3D775F` "SPOT." tagline.
- **6 Pastel Feature Cards:** Quick navigators with customized icon containers and descriptions for Spaces, Calendar, Faculty, Issues, Marketplace, and Lost & Found.
- **Side-by-Side Calendar Card:** Left mini-calendar month widget paired horizontally with real-time upcoming events list on the right.
- **Live Classroom Availability Snapshot:** Quick view of vacant rooms right now.

### 2. Spaces & Timetable (`2) Spaces.jpeg`)
- **63 Verified Academic Classrooms:** Grounded exclusively in the verified academic dataset across Floors 1–4 (quarantined utility rooms excluded).
- **2,646 Schedule Slots:** Full weekly timetable matrix (Periods 1–7, Monday to Saturday).
- **Non-Scrolling Left Filter Column:** Filter by room availability (*All, Free Now, Occupied*), floor number (*Floors 1–4*), amenities (*AC, Charging Points*), and room type.
- **Interactive Timetable Drawer:** Click any classroom to inspect its daily periods, subject codes, faculty assignments, and full weekly schedule modal.

### 3. Events & Calendar (`3) Calendar.jpeg`)
- **Month / Year / List Views:** Interactive calendar grid with day-by-day dot indicators.
- **Category Filters:** Academic, Club, Seminars, Cultural, Administrative, and Holidays.
- **Side-by-Side Day Agenda:** Selecting any day reveals its scheduled events, venue details, and registration links.

### 4. Faculty Directory (`4) Faculty.jpeg`)
- **Directory Search:** Real-time search across names, designations, and departments.
- **Department & Subject Filters:** Computer Science, AI & ML, Electronics, Humanities, and Mathematics.
- **3-Column Faculty Cards:** Photo, designation, department, cabin location, and subject tags.
- **Faculty Profile Drawer:** Detailed office hours, research bio, email/phone links, and cabin navigation.

### 5. Issues System (`5) Issues - Normal User.jpeg` + `5) Issues - Admin User.jpeg`)
- **Normal Student View:**
  - Hero banner with quick ticket reporting CTA.
  - Category status tabs (*All, In Progress, Resolved*).
  - Slide-in Report Drawer featuring 3×3 category grid, classroom dropdown, photo upload box, and description textarea.
- **Maintenance Admin Operations Dashboard:**
  - 4 Key Metric Stat Cards (*Total Registered, In Progress, Resolved, Avg Resolution Time*).
  - Searchable, sortable operations table with priority tags and ticket numbers (`#0241`–`#0232`).
  - Slide-in assignment drawer to update ticket status (*Registered → In Progress → Resolved*), assign technician, and log activity timeline.

### 6. Campus Marketplace (`6) Marketplace.jpeg`)
- **Browse Items:** 3-column card grid with price badges in `₹`, condition tags, location pins, and wishlist hearts.
- **Item Details:** Multi-photo preview carousel with thumbnails, full specs, and **Share Contact** safe peer flow.
- **My Listings:** User listing management with view counters and **Mark as Sold** status toggles.
- **My Purchases:** Purchase history with active/completed status tracking.
- **Post an Item:** Modal to publish items directly to the database.

### 7. Lost & Found Recovery (`7) lost and found.jpeg`)
- **4-Column Recovery Grid:** 12 items matching the design reference with color-coded `Lost` (coral) and `Found` (mint green) badges.
- **Filters:** Item type checkboxes with counts, Lost vs. Found filter, Date range radio buttons, and Location dropdown.
- **Item Claim Flow:** Privacy shield safeguarding student phone numbers until verified ownership proof is submitted.
- **Report Item Modal:** Submit lost or found reports with photo uploads and privacy flags.

### 8. Global Command Palette & Navigation
- **Command Palette (`Ctrl+K` / `Cmd+K`):** Global search across all 63 classrooms, events, faculty members, marketplace listings, and lost items.
- **Notification Drawer:** Real-time campus alert popover with unread indicators and category badges.
- **User Role Switcher:** Instant toggle between **Student** view and **Maintenance Admin** perspective.
- **Mobile Responsive Drawer:** Collapsible navigation menu for smartphones and tablets.

---

## 🛠️ Tech Stack & Setup

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Deployment:** Vercel (configured via `vercel.json`)

### Running Locally

```bash
# Clone the repository
git clone https://github.com/nilotpal-lab/Design_Thinking.git
cd "Design_Thinking/design thinking final"

# Install dependencies
npm install

# Start development server with LAN support (accessible across same Wi-Fi)
npm run dev -- --host
```

Local access: `http://localhost:5173/`  
LAN access (for friends on same Wi-Fi): `http://<your-local-ip>:5173/`

### Building for Production

```bash
npm run build
```

---

## 🚢 Deployment to Vercel

The repository includes a ready-to-deploy [`vercel.json`](./vercel.json) configuration:
1. Push to your GitHub repository (`main` branch).
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import `https://github.com/nilotpal-lab/Design_Thinking`.
4. Set root directory to `design thinking final` (or deploy root directly).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

---

## 📄 License & Credits

Developed for the **Design Thinking** coursework (Semester 3). Classrooms and timetable data ingested from campus academic snapshots.
