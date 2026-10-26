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
import { DAY_OPTIONS, GRADE_OPTIONS } from "@/lib/constants/options";
import { mentorProfileSchema } from "@/lib/validation/schemas";
import type { MentorProfile, Profile, Subject } from "@/types/domain";

type ProfileFormValues = z.input<typeof mentorProfileSchema>;
type ProfileInput = z.output<typeof mentorProfileSchema>;

interface ProfileFormProps {
  profile: Profile;
  mentor?: MentorProfile;
  subjects: Subject[];
}

export function ProfileForm({ profile, mentor, subjects }: ProfileFormProps) {
  const firstSlot = mentor?.availability[0];
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
      mentorSubjectIds: mentor?.subjects.map((subject) => subject.subjectId) ?? [],
      mentorTopics: mentor?.subjects.flatMap((subject) => subject.topics).filter((topic, index, items) => items.indexOf(topic) === index).join(", ") ?? "",
      proficiencyLevel: mentor?.subjects[0]?.proficiencyLevel ?? 3,
      availableDays: mentor?.availability.map((slot) => slot.dayOfWeek) ?? [],
      availableStartTime: firstSlot?.startTime.slice(0, 5) ?? "17:00",
      availableEndTime: firstSlot?.endTime.slice(0, 5) ?? "19:00",
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
        <FormField error={errors.displayName?.message} htmlFor="displayName" label="닉네임">
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
        <section className="space-y-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <fieldset>
            <legend className="text-sm font-semibold text-zinc-900">멘토링 가능한 과목</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <label className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-3 text-sm" key={subject.id}>
                  <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={subject.id} {...register("mentorSubjectIds")} />
                  {subject.name}
                </label>
              ))}
            </div>
            {errors.mentorSubjectIds ? <p className="mt-2 text-xs font-medium text-red-700">{errors.mentorSubjectIds.message}</p> : null}
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
          <FormField error={errors.introduction?.message} htmlFor="introduction" label="멘토 소개">
            <textarea className={textareaStyles} id="introduction" {...register("introduction")} />
          </FormField>
          <FormField error={errors.maxActiveMentees?.message} htmlFor="maxActiveMentees" label="최대 멘티 수">
            <input className={inputStyles} id="maxActiveMentees" max={10} min={1} type="number" {...register("maxActiveMentees", { valueAsNumber: true })} />
          </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField error={errors.mentorTopics?.message} htmlFor="mentorTopics" label="자신 있는 세부 단원">
              <input className={inputStyles} id="mentorTopics" placeholder="예: 미적분, 함수, 수열" {...register("mentorTopics")} />
            </FormField>
            <FormField error={errors.proficiencyLevel?.message} htmlFor="proficiencyLevel" label="숙련도">
              <input className={inputStyles} id="proficiencyLevel" max={5} min={1} type="number" {...register("proficiencyLevel", { valueAsNumber: true })} />
            </FormField>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-zinc-900">가능한 요일</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {DAY_OPTIONS.map((day) => (
                <label className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-3 text-sm" key={day.value}>
                  <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={day.value} {...register("availableDays")} />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField htmlFor="availableStartTime" label="가능 시작 시간">
              <input className={inputStyles} id="availableStartTime" type="time" {...register("availableStartTime")} />
            </FormField>
            <FormField htmlFor="availableEndTime" label="가능 종료 시간">
              <input className={inputStyles} id="availableEndTime" type="time" {...register("availableEndTime")} />
            </FormField>
          </div>
        </section>
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
