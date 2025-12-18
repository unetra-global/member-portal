"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, Facebook, Linkedin, Mail } from "lucide-react";
import "./auth-styles.css";

// SVG Google Icon component since Lucide doesn't have it standard
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
    width="24" height="24"
  >
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
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
    // Custom validity logic can be added here if strict adherence to legacy is needed, 
    // but basic HTML5 attributes + explicit checks on submit are usually better in React.
  };

  return (
    <div className="auth-container-wrapper bg-white dark:bg-gray-900">
      <div className={`auth-wrapper ${isPanelActive ? 'panel-active' : ''}`} id="authWrapper">

        {/* Sign Up Form */}
        <div className="auth-form-box register-form-box">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="#" aria-label="Google"><GoogleIcon className="w-5 h-5" /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
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
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="#" aria-label="Google"><GoogleIcon className="w-5 h-5" /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
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
