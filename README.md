# Unetra Global - Authentication App

A modern, secure authentication application built with Next.js 16, Supabase, and Tailwind CSS. Features LinkedIn SSO and email/password authentication with a beautiful, accessible UI.

## 🚀 Features

- **Multiple Authentication Methods**
  - LinkedIn OAuth integration
  - Email/password authentication
  - Secure session management

- **Modern UI/UX**
  - Dark/light mode support
  - Responsive design
  - Accessible components (WCAG compliant)
  - Loading states and error handling
  - Toast notifications

- **Security & Performance**
  - Server-side rendering (SSR)
  - Protected routes with middleware
  - Secure cookie handling
  - Input validation and sanitization

- **Developer Experience**
  - TypeScript support
  - ESLint configuration
  - Tailwind CSS with custom design system
  - Modular component architecture

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unetra-global
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.local` file and update with your actual values:
   ```bash
   cp .env.local .env.local.example
   ```

   Update the following variables in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # LinkedIn OAuth (optional - if using custom integration)
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   
   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key_here
   
   # App Configuration
   NEXT_PUBLIC_BASE_PATH=/member-portal
   ```

4. **Set up Supabase**
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your URL and anon key
   - Enable LinkedIn provider in Authentication > Providers
   - Configure your LinkedIn OAuth app redirect URL: `https://your-project.supabase.co/auth/v1/callback`

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication callbacks
│   ├── dashboard/         # Protected dashboard page
│   ├── login/            # Login page
│   └── page.tsx          # Home page (redirects to dashboard/login)
├── components/            # Reusable UI components
│   ├── auth/             # Authentication-specific components
│   └── ui/               # Generic UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configurations
│   └── utils.ts          # General utilities
└── middleware.ts         # Next.js middleware for auth
```

## 🔐 Authentication Flow

### LinkedIn OAuth
1. User clicks "Continue with LinkedIn"
2. Redirected to LinkedIn OAuth
3. After approval, redirected to `/auth/callback`
4. Session created and user redirected to dashboard

### Email/Password
1. User enters email and password
2. For signup: Confirmation email sent
3. For login: Immediate authentication
4. Redirected to dashboard on success

### Protected Routes
- All routes except `/login` and `/auth/*` require authentication
- Middleware automatically redirects unauthenticated users to login
- Session state managed with Supabase Auth

## 🎨 UI Components

### Core Components
- **Button**: Variant-based button with LinkedIn styling
- **Input**: Accessible form inputs with validation states
- **Card**: Flexible card layouts for content organization
- **Loading**: Spinner components for loading states
- **Toast**: Notification system for user feedback

### Authentication Components
- **LinkedInButton**: OAuth login with loading states
- **EmailAuthForm**: Email/password form with validation
- **ProtectedRoute**: HOC for route protection

## 🔧 Configuration

### Tailwind CSS
The app uses Tailwind CSS v4 with custom CSS variables for theming:
- Light/dark mode support
- Custom color palette
- LinkedIn brand colors
- Responsive design utilities

### Supabase Setup
1. **Database**: No additional tables required (uses auth.users)
2. **Authentication**: 
   - Email provider enabled
   - LinkedIn OAuth configured
   - Email confirmations (optional)
3. **Policies**: Default auth policies are sufficient

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🧪 Testing

### Manual Testing Checklist
- [ ] LinkedIn OAuth flow works
- [ ] Email signup creates account
- [ ] Email login authenticates user
- [ ] Protected routes redirect to login
- [ ] Dashboard displays user information
- [ ] Sign out functionality works
- [ ] Dark/light mode toggle
- [ ] Responsive design on mobile
- [ ] Accessibility with screen readers
- [ ] Error handling for invalid credentials

### Automated Testing
```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build

# Run unit tests
npm test
```

## 🔒 Security Considerations

- Environment variables are properly scoped
- Supabase handles secure session management
- CSRF protection via Supabase Auth
- Input validation on all forms
- Secure cookie handling in middleware
- No sensitive data in client-side code

## 🎯 Accessibility Features

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios
- Focus management
- Error announcements

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Next.js documentation](https://nextjs.org/docs)
3. Open an issue in this repository
