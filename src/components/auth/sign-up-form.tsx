"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"

interface SignUpFormProps {
  onSuccess?: (email?: string) => void
  onError?: (error: string) => void
}



export function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const supabase = createClient()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        onError?.(error.message)
      } else {
        onSuccess?.(formData.email)
      }
    } catch (error) {
      onError?.("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "" }
    if (password.length < 6) return { strength: 1, text: "Too short" }
    if (password.length < 8) return { strength: 2, text: "Weak" }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, text: "Weak" }
    return { strength: 3, text: "Strong" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="space-y-6">


      {/* Email Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="signup-email" className="sr-only">
          Email address
        </label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          disabled={isLoading}
          className={errors.email ? "border-destructive" : ""}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          autoComplete="email"
          required
        />
        {errors.email && (
          <p id="signup-email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="signup-password" className="sr-only">
          Password
        </label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            disabled={isLoading}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "signup-password-error" : "password-strength"}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full ${
                    level <= passwordStrength.strength
                      ? passwordStrength.strength === 1
                        ? "bg-red-500"
                        : passwordStrength.strength === 2
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p id="password-strength" className="text-xs text-muted-foreground">
              Password strength: {passwordStrength.text}
            </p>
          </div>
        )}
        
        {errors.password && (
          <p id="signup-password-error" className="text-sm text-destructive" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="signup-confirm-password" className="sr-only">
          Confirm password
        </label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            disabled={isLoading}
            className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "signup-confirm-password-error" : undefined}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        
        {/* Password Match Indicator */}
        {formData.confirmPassword && formData.password && (
          <div className="flex items-center gap-2 text-xs">
            {formData.password === formData.confirmPassword ? (
              <>
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-red-500" />
                <span className="text-red-600">Passwords don't match</span>
              </>
            )}
          </div>
        )}
        
        {errors.confirmPassword && (
          <p id="signup-confirm-password-error" className="text-sm text-destructive" role="alert">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="#" className="underline hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-foreground">
          Privacy Policy
        </a>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-medium" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
    </div>
  )
}