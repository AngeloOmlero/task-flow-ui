# TaskBoard - Modern Task Management UI# task-ui

A modern, responsive task management web application UI similar to ClickUp, built with Vue 3, TypeScript, and custom CSS.This template should help get you started developing with Vue 3 in Vite.

## 🎯 Features## Recommended IDE Setup

- **Multi-Board Support**: Create and manage multiple boards, each containing multiple tasks[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

- **Kanban Board View**: Drag-and-drop tasks between status columns (To Do, In Progress, In Review, Done)

- **Responsive Design**: Fully responsive for desktop and tablet screens## Recommended Browser Setup

- **Real-Time Updates**: WebSocket support for live task and comment changes

- **Task Management**: Create, edit, delete tasks with priority levels and due dates- Chromium-based browsers (Chrome, Edge, Brave, etc.):

- **Comments**: Add comments to tasks for team collaboration - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

- **User Authentication**: Sign in and register functionality - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)

- **Modern UI**: Clean, minimalistic styling with soft colors, rounded corners, and smooth animations- Firefox:

- **Sidebar Navigation**: Quick access to all boards - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

- **Search Functionality**: Search across tasks and boards - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

- **User Profiles**: Profile management and team member visibility

## Type Support for `.vue` Imports in TS

## 🏗️ Project Structure

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

````

src/## Customize configuration

├── assets/

│   └── global.css              # Global styles and CSS variablesSee [Vite Configuration Reference](https://vite.dev/config/).

├── components/

│   ├── TopNavBar.vue           # Top navigation with profile and search## Project Setup

│   ├── Sidebar.vue             # Board navigation sidebar

│   ├── KanbanBoard.vue         # Main kanban board layout```sh

│   ├── TaskCard.vue            # Individual task card componentnpm install

│   ├── BaseModal.vue           # Reusable modal component```

│   ├── CreateBoardModal.vue    # Create board modal

│   ├── CreateTaskModal.vue     # Create task modal### Compile and Hot-Reload for Development

│   ├── TaskDetailsModal.vue    # Task details and comments

│   └── index.ts                # Component exports```sh

├── pages/npm run dev

│   ├── Dashboard.vue           # Main dashboard page```

│   ├── Login.vue               # Login page

│   ├── Register.vue            # Registration page### Type-Check, Compile and Minify for Production

│   └── NotFound.vue            # 404 page

├── stores/```sh

│   ├── auth.ts                 # Authentication state (Pinia)npm run build

│   ├── board.ts                # Board and task state (Pinia)```

│   └── ui.ts                   # UI state (modals, sidebar, notifications)
├── services/
│   ├── api.ts                  # Axios instance with interceptors
│   └── index.ts                # API service exports
├── types/
│   └── index.ts                # TypeScript type definitions
├── router/
│   └── index.ts                # Vue Router configuration
├── App.vue                     # Root component
└── main.ts                     # Entry point
````

## 🎨 Design System

### Color Palette

The app uses a carefully curated color system with CSS variables for consistency:

```css
/* Primary */
--color-primary: #6366f1 /* Indigo - Primary actions */ --color-primary-light: #818cf8
  /* Light indigo */ --color-primary-dark: #4f46e5 /* Dark indigo */ /* Neutral */
  --color-gray-50: #f9fafb /* Lightest backgrounds */ --color-gray-900: #111827 /* Darkest text */
  /* Status Colors */ --color-todo: #f3f4f6 /* Gray for To Do */ --color-in-progress: #dbeafe
  /* Blue for In Progress */ --color-in-review: #fef3c7 /* Yellow for In Review */
  --color-done: #dcfce7 /* Green for Done */ /* Priority Colors */ LOW: #dcfce7 /* Green */
  MEDIUM: #fef3c7 /* Yellow */ HIGH: #fed7aa /* Orange */ URGENT: #fee2e2 /* Red */;
```

### Typography

- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Font Sizes**: xs (0.75rem) through 2xl (1.5rem)
- **Font Weights**: Regular (400), Medium (500), Semi-Bold (600)
- **Line Height**: 1.5 for body text, 1.2 for headings

### Spacing Scale

Consistent spacing using CSS variables: xs (0.25rem) → sm (0.5rem) → md (1rem) → lg (1.5rem) → xl (2rem) → 2xl (3rem)

### Border Radius

- Small: 0.375rem
- Medium: 0.5rem
- Large: 0.75rem
- XL: 1rem
- Full: 9999px

### Shadows

Depth through consistent shadows from `--shadow-sm` to `--shadow-xl`

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with sidebar and multi-column kanban view
- **Tablet** (≤1024px): Optimized kanban columns, responsive grid
- **Mobile** (≤768px): Sidebar collapses, single-column layouts, mobile-optimized

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0 or >=22.12.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL (if using a backend)
# VITE_API_BASE_URL=http://localhost:8080/api
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
npm run preview
```

### Type Checking

```bash
npm run type-check
```

## 📋 Component Documentation

### TopNavBar

- **Features**: Search functionality, user profile dropdown, notifications
- **Responsive**: Username hidden on mobile, menu icons adapt
- **Interactions**: Profile menu toggle, logout functionality

### Sidebar

- **Features**: Board list, create board button, active board highlighting
- **Responsive**: Collapses on mobile with animation
- **Interactions**: Click to select board, quick create button

### KanbanBoard

- **Features**: Drag-and-drop between columns, task count display, empty states
- **Columns**: To Do, In Progress, In Review, Done
- **Interactions**: Drag tasks between columns, quick task creation

### TaskCard

- **Features**: Title, description (truncated), priority badges, due dates
- **Avatars**: Assignee display with +N overflow handling
- **Interactions**: Click to view details, drag to move, comment count display

### BaseModal

- **Features**: Customizable size (sm/md/lg), close button, footer area
- **Animations**: Smooth fade-in and scale animations
- **Responsive**: Adapts to mobile screens with 95vw max width

### CreateBoardModal

- **Fields**: Title (required), Description (optional, 500 char limit)
- **Validation**: Title validation, char counter
- **Behavior**: Clears on close, creates and selects board

### CreateTaskModal

- **Fields**: Title, Priority, Due Date, Description, Assignees
- **Validation**: Title required, priority optional
- **Behavior**: Creates task in current board

### TaskDetailsModal

- **Sections**: Details, Assignees, Due Date, Comments
- **Features**: Comment form with validation, author avatars
- **Interactions**: Edit button (future), add comments, view history

## 🔄 State Management (Pinia Stores)

### Auth Store (`stores/auth.ts`)

```typescript
- user: User | null
- token: string | null
- isAuthenticated: boolean
- setAuth(response): Set user and token
- clearAuth(): Clear all auth data
- setUser(user): Update user info
```

### Board Store (`stores/board.ts`)

```typescript
- boards: Board[]
- currentBoardId: number | null
- tasks: Task[]
- tasksByStatus: Map<string, Task[]>
- comments: Map<number, Comment[]>
- Methods for CRUD operations on boards, tasks, and comments
```

### UI Store (`stores/ui.ts`)

```typescript
- activeModal: ModalType | null
- sidebarOpen: boolean
- selectedTaskId: number | null
- searchQuery: string
- isLoading: boolean
- notification: {message, type} | null
- Methods for modal control, sidebar toggle, notifications
```

## 🔌 API Integration

All API calls use axios through `services/api.ts` with:

- Automatic Bearer token injection in headers
- 401 error handling (redirects to login)
- Consistent request/response formatting

### API Endpoints

```
Authentication
  POST /api/auth/register       # Create new account
  POST /api/auth/login          # Sign in
  GET /api/auth/me              # Get current user

Boards
  GET /api/boards               # List all boards
  POST /api/boards              # Create board
  PUT /api/boards/:boardId      # Update board
  DELETE /api/boards/:boardId   # Delete board
  POST /api/boards/:boardId/members  # Add member

Tasks
  POST /api/boards/:boardId/tasks     # Create task
  PUT /api/boards/:boardId/tasks/:id  # Update task
  DELETE /api/boards/:boardId/tasks/:id # Delete task

Comments
  POST /api/tasks/:taskId/comments    # Create comment
```

## 🎬 Animations

The app uses smooth, modern animations:

- **Fade In**: `fadeIn` - Modal overlays and backgrounds
- **Slide In**: `slideIn` - Modal content and notifications
- **Slide In Left**: `slideInLeft` - Profile menu
- **Tasks Transition**: Smooth animations when tasks move between columns
- **Hover Effects**: Subtle color and shadow transitions on interactive elements

All animations use CSS variables for timing: `--transition-fast` (150ms), `--transition-base` (200ms), `--transition-slow` (300ms)

## 🔐 Authentication

- Mock authentication on login/register pages (ready for API integration)
- JWT token stored in localStorage
- Automatic redirect to login if token expires or is missing
- Protected routes that require authentication
- User info displayed in top navigation

## 📡 Real-Time Updates (Ready)

WebSocket support ready for implementation:

- Live task updates across multiple users
- Real-time comment notifications
- Board member activity tracking
- Status change broadcasts
- Member presence indicators

## 🎯 Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] File/attachment uploads for tasks
- [ ] Advanced filtering and sorting
- [ ] Custom task statuses per board
- [ ] Time tracking for tasks
- [ ] Activity timeline/history
- [ ] User mentions in comments (@mentions)
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Calendar view
- [ ] List and Table views
- [ ] Dark mode
- [ ] Advanced team collaboration
- [ ] Custom fields per board
- [ ] Webhook integrations

## 💡 Development Tips

1. **Add a new page**: Create in `src/pages/`, add route to `src/router/index.ts`
2. **Add a new component**: Create in `src/components/`, export from `index.ts`
3. **Create a new store**: Create in `src/stores/`, use with `useStore()` composable
4. **Make API calls**: Use services from `src/services/` for consistency
5. **Styling**: Use CSS variables from `global.css` for design consistency
6. **Type-safe**: Define types in `src/types/index.ts`

## 🛠️ IDE Setup

Recommended setup:

- **IDE**: [VSCode](https://code.visualstudio.com/)
- **Extensions**:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vue support)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (Code formatting)
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## 📦 Dependencies

- **Vue 3**: Progressive JavaScript framework
- **Pinia**: State management for Vue
- **Vue Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Vite**: Next-generation build tool
- **TypeScript**: Type safety
- **@vueuse/core**: Vue composition utilities
- **@dnd-kit**: Drag and drop toolkit

## 📝 License

MIT
