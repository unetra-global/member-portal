"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "./auth-styles.css";

// Custom LinkedIn "In" Icon (Official branding style)
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    width="24" height="24"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export default function LoginPage() {
  const [isPanelActive, setIsPanelActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Error messages
  const [loginError, setLoginError] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router, supabase.auth]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
      } else {
        // Success - redirect is handled by useEffect or here
        const { data: { user } } = await supabase.auth.getUser();
        const redirectPath = user?.user_metadata?.profile_completed ? '/dashboard' : '/profile/complete';
        router.push(redirectPath);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegError(null);
    const form = e.currentTarget;

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        setRegError(error.message);
      } else {
        alert("Registration successful! Please check your email to verify your account.");
        setIsPanelActive(false); // Switch to login
      }
    } catch (error) {
      console.error('Error:', error);
      setRegError('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time validation logic simplified for React
  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegPassword(val);
  };

  return (
    <div className="auth-container-wrapper bg-white dark:bg-gray-900">
      <div className={`auth-wrapper ${isPanelActive ? 'panel-active' : ''}`} id="authWrapper">

        {/* Sign Up Form */}
        <div className="auth-form-box register-form-box">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <div className="social-container">
              <button type="button" className="linkedin-btn">
                <LinkedInIcon className="w-5 h-5 fill-white" />
                Continue with LinkedIn
              </button>
            </div>
            <span>or use your email for registration</span>

            {regError && <div className="text-red-500 text-sm mb-2">{regError}</div>}

            <input
              type="email"
              placeholder="Email Address"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            <div className="input-group">
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={regPassword}
                onChange={handlePasswordInput}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
              />
              <div
                className="toggle-password"
                onClick={() => setShowRegPassword(!showRegPassword)}
              >
                {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
            </div>
            <div className="input-group">
              <input
                type={showRegConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
              />
              <div
                className="toggle-password"
                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
              >
                {showRegConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
            </button>
            <div className="mobile-switch">
              <p>Already have an account?</p>
              <button type="button" onClick={() => setIsPanelActive(false)}>Sign In</button>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-box login-form-box">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <div className="social-container">
              <button type="button" className="linkedin-btn">
                <LinkedInIcon className="w-5 h-5 fill-white" />
                Continue with LinkedIn
              </button>
            </div>
            <span>or use your account</span>

            {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}

            <input
              type="email"
              placeholder="Email Address"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <div className="input-group">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <div
                className="toggle-password"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
            </div>
            <a href="#">Forgot your password?</a>
            <button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>
            <div className="mobile-switch">
              <p>Don't have an account?</p>
              <button type="button" onClick={() => setIsPanelActive(true)}>Sign Up</button>
            </div>
          </form>
        </div>

        {/* Overlay Panel */}
        <div className="slide-panel-wrapper">
          <div className="slide-panel">
            <div className="panel-content panel-content-left">
              <h1>Welcome Back!</h1>
              <p>Stay connected by logging in with your credentials and continue your experience</p>
              <button className="transparent-btn" onClick={() => setIsPanelActive(false)}>Sign In</button>
            </div>
            <div className="panel-content panel-content-right">
              <h1>Hey There!</h1>
              <p>Begin your amazing journey by creating an account with us today</p>
              <button className="transparent-btn" onClick={() => setIsPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
