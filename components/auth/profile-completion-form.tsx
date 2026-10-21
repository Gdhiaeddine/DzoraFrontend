'use client'

import React, { useState } from 'react'
import { User as UserIcon, Calendar, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { User } from '@/lib/api'

interface ProfileCompletionFormProps {
  onSuccess: (user: User) => void
}

export function ProfileCompletionForm({ onSuccess }: ProfileCompletionFormProps) {
  const { completeProfile, user } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez renseigner votre prénom et nom de famille.')
      return
    }

    setLoading(true)
    try {
      const updatedUser = await completeProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? dateOfBirth.trim() : undefined,
      })
      onSuccess(updatedUser)
    } catch (err: any) {
      setError(err.message || 'Impossible de mettre à jour votre profil. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl bg-[#E7F2EF]/60 border border-[#D0E5DE] p-3.5 text-xs text-[#006B55] flex items-start gap-2.5">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#006B55]" />
        <div>
          <p className="font-bold">Numéro de téléphone vérifié !</p>
          <p className="text-[11px] text-[#005544] mt-0.5">
            Dernière étape : dites-nous comment vous appeler.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700">
            Prénom <span className="text-[#006B55]">*</span>
          </label>
          <div className="relative mt-1.5">
            <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="ex: Dhia"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-9 pr-3 text-xs outline-none transition focus:border-[#006B55] focus:bg-white text-[#102A2A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">
            Nom <span className="text-[#006B55]">*</span>
          </label>
          <div className="relative mt-1.5">
            <input
              type="text"
              required
              placeholder="ex: Guettaf"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] px-3.5 text-xs outline-none transition focus:border-[#006B55] focus:bg-white text-[#102A2A]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">
          Date de naissance <span className="text-[11px] font-normal text-slate-400">(optionnel)</span>
        </label>
        <div className="relative mt-1.5">
          <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-[#F7FAF9] pl-9 pr-3 text-xs outline-none transition focus:border-[#006B55] focus:bg-white text-[#102A2A]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006B55] text-xs font-bold text-white shadow-md shadow-[#006B55]/20 hover:bg-[#005544] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin text-white" />
        ) : (
          <>
            <span>Commencer mes achats</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-slate-400">
        Vos adresses de livraison seront renseignées lors de votre première commande.
      </p>
    </form>
  )
}
