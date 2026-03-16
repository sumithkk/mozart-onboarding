## Version [0.1.1] - 2025-06-20

### Major Features & Enhancements

#### Google Drive Integration
- **Google Authentication**: Added vue3-google-login for seamless Google authentication
- **Google File Picker**: Complete implementation of custom Google Drive file picker with:
  - Breadcrumb navigation and folder handling
  - File type display and loading states
  - Enhanced sorting criteria and status handling
  - Toggle select functionality for multiple file selection
  - Back functionality and improved navigation flow
- **Google Drive Onboarding**: Added minimizable onboarding component with popup styling

#### AI Model Enhancements
- **Gemini AI Models**: Added support for Gemini AI models in the model store
- **Model Management**: Segregated model options to different tabs for better organization
- **Current Model Component**: New dedicated component for model selection and display

#### File Management System
- **File Status Management**: Comprehensive file status tracking and management
- **Anonymization Features**: 
  - Added anonymization terms functionality
  - File anonymization capabilities with terms modal
  - Role-based file permissions with FileBadge component
- **File Validation**: Refactored file validation functions for improved clarity
- **File Type Support**: Enhanced support for various file types with better display

#### RAG (Retrieval-Augmented Generation) Updates
- **Vector Search**: Updated vector-search functionality with improved input handling
- **API Enhancements**: Updated file retrieval API to include userId and added papaparse types
- **RAG Sidebar**: Enhanced with Integrations and Workbench navigation

### UI/UX Improvements

#### Component Refactoring
- **Input Components**: Major refactor of input components including:
  - AIChatInput and DefaultTextInput with compose tools toggle
  - Improved toggle button styling
  - Enhanced layout and functionality for SelectModelPopover
- **Chat Interface**: 
  - Improved scroll button styling in Chat component
  - Better message display and interaction
  - Fixed print functionality

#### Responsive Design & Styling
- **Mobile Optimization**: 
  - Mobile detection in user login functionality
  - SortFilterBar visibility adjustments for small screens
  - Improved responsiveness across components
- **Dark Mode**: Enhanced dark mode support and consistent styling
- **UI Consistency**: 
  - Streamlined class attributes and enhanced accessibility
  - Consistent styling across Dropdown, SimpleInput, and other components
  - Improved hover effects and loading states

#### Navigation & Layout
- **Dashboard Header**: Multiple updates for improved layout and functionality
- **Sidebar Components**: 
  - ProfileSidebar enhancements with better styling
  - RAG sidebar updates with new navigation options
  - Improved sidebar and header consistency
- **Breadcrumb Navigation**: Enhanced breadcrumb system for better navigation flow

### Technical Improvements

#### Performance & Stability
- **Lifecycle Management**: Added onUnmounted lifecycle hooks for proper cleanup
- **State Management**: 
  - Enhanced user permission store and local storage handling
  - Improved conversation state management with proper reset functionality
- **Component Loading**: Better loading states and error handling across components

#### Code Quality
- **Accessibility**: Enhanced accessibility features across form components
- **Code Organization**: Better component structure and improved maintainability
- **Type Safety**: Added proper TypeScript definitions and type safety improvements

#### Security & Permissions
- **User Permissions**: Enhanced user permission system with role-based access
- **Authentication Flow**: Improved authentication code retrieval and handling
- **Session Management**: Better user session handling and management

### Bug Fixes
- **Print Functionality**: Fixed printing issues in various components
- **File Picker**: Resolved file selection and navigation issues
- **Form Validation**: Improved form validation and error handling
- **Responsive Layout**: Fixed layout issues on different screen sizes

### Development Experience
- **Component Structure**: Better organization of reusable components
- **Documentation**: Improved code documentation and component props
- **Build Process**: Enhanced build configuration and dependency management

---

**Contributors:** imvprakash-rm, DhrruvRM, vivek-rm, PijushRM, Vaibhav Prakash, pijush@ryan-miranda.com

**Total Commits:** 50+ commits covering comprehensive feature additions, UI improvements, and technical enhancements

**Migration Notes:** This release includes significant UI component refactoring. Please test thoroughly in your environment before deploying to production.
