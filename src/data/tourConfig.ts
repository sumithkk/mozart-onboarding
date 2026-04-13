// src/data/tourConfig.ts

import type { TourPage } from '@/store/useTourStore'

export type TourStep = {
  id: string
  selector: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const tourConfig: Record<TourPage, TourStep[]> = {
  // 🧩 WORKBENCH
  workbench: [
    {
      id: 'upload',
      selector: '[data-tour="upload-area"]',
      title: 'Upload Area',
      description: 'Drag and drop files here to start.',
      position: 'right',
    },
    {
      id: 'create-folder',
      selector: '[data-tour="create-folder"]',
      title: 'Create Folder',
      description: 'Organize your work.',
      position: 'bottom',
    },
  ],

  // 💬 COMPOSE
  compose: [
    {
      id: 'chat-input',
      selector: '[data-tour="chat-input"]',
      title: 'Chat Input',
      description: 'Ask questions about your documents here.',
      position: 'top',
    },
    {
      id: 'model-selector',
      selector: '[data-tour="model-selector"]',
      title: 'Model Selector',
      description: 'Choose between GPT-4, Claude, or Cohere.',
      position: 'bottom',
    },
  ],

  // ⚙️ SETTINGS
  settings: [
    {
      id: 'profile',
      selector: '[data-tour="user-profile"]',
      title: 'User Profile',
      description: 'Update your avatar and name.',
      position: 'right',
    },
    {
      id: 'preferences',
      selector: '[data-tour="preferences"]',
      title: 'Preferences',
      description: 'Customize your theme and notifications.',
      position: 'left',
    },
  ],

  // 🔗 INTEGRATIONS
  integrations: [
    {
      id: 'google-drive',
      selector: '[data-tour="google-drive"]',
      title: 'Connect Google Drive',
      description: 'Sync your files directly from Drive.',
      position: 'right',
    },
  ],

  // 📊 ANALYTICS
  analytics: [
    {
      id: 'token-usage',
      selector: '[data-tour="token-usage"]',
      title: 'Token Usage',
      description: 'Track your LLM consumption here.',
      position: 'top',
    },
    {
      id: 'cost-analysis',
      selector: '[data-tour="cost-analysis"]',
      title: 'Cost Analysis',
      description: 'View your estimated spend.',
      position: 'top',
    },
  ],
}
