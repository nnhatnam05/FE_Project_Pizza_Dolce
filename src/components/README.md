# Components Structure

## Overview
This directory contains all React components organized by feature and functionality.

## Structure
```
src/components/
├── common/           # Shared/reusable components
│   ├── Layout/      # Layout components (Header, Footer, Sidebar)
│   ├── UI/          # Basic UI components (Button, Modal, etc.)
│   └── Protected/   # Authentication & protection components
├── features/         # Feature-based components
│   ├── auth/        # Authentication related
│   ├── dashboard/   # Dashboard & analytics
│   ├── food/        # Food management
│   ├── table/       # Table management
│   └── order/       # Order management
├── pages/           # Page-level components
│   ├── Home/        # Homepage
│   └── Admin/       # Admin pages
└── styles/          # Global styles and theme
```

## Naming Conventions
- Components: PascalCase (e.g., `FoodList.jsx`)
- Files: kebab-case (e.g., `food-list.css`)
- Folders: kebab-case (e.g., `food-management/`)

## Component Organization
Each feature folder contains:
- `index.jsx` - Main component
- `components/` - Sub-components
- `hooks/` - Custom hooks
- `utils/` - Helper functions
- `styles/` - Component-specific styles 