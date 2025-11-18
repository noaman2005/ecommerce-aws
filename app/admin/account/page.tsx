"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";

interface ProfileState {
  displayName: string;
  avatarDataUrl: string | null;
}

const STORAGE_KEY = "admin-profile";

export default function AdminAccountPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [profile, setProfile] = useState<ProfileState>({ displayName: "", avatarDataUrl: null });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProfileState;
        setProfile(parsed);
      } else if (user?.name) {
        setProfile((prev) => ({ ...prev, displayName: user.name }));
      }
    } catch (error) {
      console.error("Failed to load admin profile from storage", error);
    }
  }, [user?.name]);

  const avatarFallback = useMemo(() => {
    if (profile.avatarDataUrl) return profile.avatarDataUrl;
    if (user?.name) {
      const initials = user.name
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .join("");
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials || "Admin")}&background=1E1E2F&color=ffffff`;
    }
    return `https://ui-avatars.com/api/?name=Admin&background=1E1E2F&color=ffffff`;
  }, [profile.avatarDataUrl, user?.name]);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (dataUrl) {
        setProfile((prev) => ({ ...prev, avatarDataUrl: dataUrl }));
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read selected image");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleResetAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarDataUrl: null }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!profile.displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      const payload: ProfileState = {
        displayName: profile.displayName.trim(),
        avatarDataUrl: profile.avatarDataUrl,
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }

      setUser({ ...user, name: payload.displayName });
      toast.success("Profile updated");
    } catch (error) {
      console.error("Failed to save admin profile", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading account...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Account</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Admin profile</h1>
        <p className="mt-2 text-sm text-slate-400">
          Update your admin display information. Email is read-only and tied to your Cognito account.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border border-slate-800 bg-slate-900 shadow-lg">
                <Image
                  src={avatarFallback}
                  alt="Admin avatar"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -right-2 -bottom-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-violet-500 p-2 text-white shadow-lg hover:bg-violet-400"
                aria-label="Upload new avatar"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <Button variant="outline" className="mt-4" onClick={handleResetAvatar}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset avatar
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="space-y-4">
            <Input
              label="Display name"
              value={profile.displayName}
              onChange={(event) => setProfile((prev) => ({ ...prev, displayName: event.target.value }))}
              placeholder="Admin name"
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
              <input
                value={user.email}
                readOnly
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-slate-400"
              />
              <p className="mt-1 text-xs text-slate-500">Email is managed via Cognito and cannot be changed here.</p>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-200 mb-1">Role</label>
              <input
                value={user.role}
                readOnly
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-slate-400 uppercase"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving}>
              Save profile
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
