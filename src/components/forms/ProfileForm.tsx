"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles, textareaStyles } from "@/components/forms/FormField";
import { GRADE_OPTIONS } from "@/lib/constants/options";
import { mentorProfileSchema } from "@/lib/validation/schemas";
import type { MentorProfile, Profile } from "@/types/domain";

type ProfileFormValues = z.input<typeof mentorProfileSchema>;
type ProfileInput = z.output<typeof mentorProfileSchema>;

interface ProfileFormProps {
  profile: Profile;
  mentor?: MentorProfile;
}

export function ProfileForm({ profile, mentor }: ProfileFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      displayName: profile.displayName,
      grade: profile.grade,
      bio: profile.bio ?? "",
      mentorEnabled: profile.mentorEnabled,
      introduction: mentor?.settings.introduction ?? "",
      maxActiveMentees: mentor?.settings.maxActiveMentees ?? 3,
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const mentorEnabled = watch("mentorEnabled");

  function submit(values: ProfileInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile(values);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <form className="space-y-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.displayName?.message} htmlFor="displayName" label="표시 이름">
          <input className={inputStyles} id="displayName" {...register("displayName")} />
        </FormField>
        <FormField error={errors.grade?.message} htmlFor="grade" label="학년">
          <select className={inputStyles} id="grade" {...register("grade", { valueAsNumber: true })}>
            {GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField error={errors.bio?.message} htmlFor="bio" label="자기소개">
        <textarea className={textareaStyles} id="bio" {...register("bio")} />
      </FormField>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <span>
          <span className="block text-sm font-semibold text-zinc-950">멘토 활동 여부</span>
          <span className="mt-1 block text-xs text-zinc-500">활성화하면 가능한 과목과 시간 정보가 멘토 목록에 공개됩니다.</span>
        </span>
        <input className="h-5 w-5 accent-emerald-700" type="checkbox" {...register("mentorEnabled")} />
      </label>

      {mentorEnabled ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField error={errors.introduction?.message} htmlFor="introduction" label="멘토 소개">
            <textarea className={textareaStyles} id="introduction" {...register("introduction")} />
          </FormField>
          <FormField error={errors.maxActiveMentees?.message} htmlFor="maxActiveMentees" label="최대 멘티 수">
            <input className={inputStyles} id="maxActiveMentees" max={10} min={1} type="number" {...register("maxActiveMentees", { valueAsNumber: true })} />
          </FormField>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {message}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        <Save aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "프로필 저장"}
      </Button>
    </form>
  );
}
