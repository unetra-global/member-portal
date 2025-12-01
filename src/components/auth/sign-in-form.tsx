"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"

interface SignInFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}



export function SignInForm({ onSuccess, onError }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      setErrors({})

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors(prev => ({
            ...prev,
            general: 'Invalid email or password. Please check your credentials and try again.'
          }))
        } else {
          setErrors(prev => ({
            ...prev,
            general: error.message
          }))
        }
        onError?.(error.message)
      } else {
        onSuccess?.()
      }
    } catch {
      const errorMessage = 'An unexpected error occurred. Please try again.'
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }))
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            disabled={isLoading}
          >
            Forgot your password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 font-medium"
          disabled={isLoading}
          aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  )
}