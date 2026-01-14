# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

This is a file storage web app that uses ULearning's Huawei Cloud OBS for free file hosting.

**Tech Stack**: React 18 + TypeScript + TailwindCSS + Vite

**Routes** (src/App.tsx):
- `/` - FileManager (public file browser)
- `/admin` - AdminPanel (admin interface)
- `/imgbed` - ImgBed (image hosting with gallery)

**Key Components** (src/components/):
- `FileManager.tsx` - Main file browser interface
- `ImgBed.tsx` - Image bed with upload, gallery view, filtering
- `CourseFolders.tsx` - Course folder management
- `AdminPanel.tsx` - Admin configuration panel
- `FileUpload.tsx` - Drag-and-drop file upload (uses react-dropzone)
- `Login.tsx` - ULearning account authentication

**Backend**: Designed for Cloudflare Workers + D1 database (see PROJECT_SUMMARY.md for deployment)

