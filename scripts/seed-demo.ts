import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface SeedUser {
  email: string;
  password: string;
  displayName: string;
  grade: 1 | 2 | 3;
  role: "student" | "admin";
  mentorEnabled: boolean;
}

const users: SeedUser[] = [
  {
    email: "minseo.demo@studybridge.local",
    password: "StudyBridge!2026",
    displayName: "김민서",
    grade: 2,
    role: "student",
    mentorEnabled: false,
  },
  {
    email: "jiho.demo@studybridge.local",
    password: "StudyBridge!2026",
    displayName: "박지호",
    grade: 3,
    role: "student",
    mentorEnabled: true,
  },
  {
    email: "admin.demo@studybridge.local",
    password: "StudyBridge!2026",
    displayName: "운영 관리자",
    grade: 3,
    role: "admin",
    mentorEnabled: true,
  },
];

async function ensureUser(user: SeedUser) {
  const { data: userList, error: listError } = await admin.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existingUser = userList.users.find((item) => item.email === user.email);
  if (existingUser) {
    return existingUser.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      display_name: user.displayName,
      grade: user.grade,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error(`Failed to create user: ${user.email}`);
  }

  return data.user.id;
}

async function main() {
  const userIds = new Map<string, string>();

  for (const user of users) {
    const id = await ensureUser(user);
    userIds.set(user.email, id);
  }

  const { data: subjects, error: subjectError } = await admin.from("subjects").select("id, name");

  if (subjectError) {
    throw subjectError;
  }

  const subjectByName = new Map((subjects ?? []).map((subject) => [subject.name, subject.id]));
  const mathSubjectId = subjectByName.get("수학");
  const csSubjectId = subjectByName.get("정보");

  if (!mathSubjectId || !csSubjectId) {
    throw new Error("Run supabase/seed.sql before npm run seed:demo.");
  }

  const minseoId = userIds.get("minseo.demo@studybridge.local");
  const jihoId = userIds.get("jiho.demo@studybridge.local");
  const adminId = userIds.get("admin.demo@studybridge.local");

  if (!minseoId || !jihoId || !adminId) {
    throw new Error("Demo users were not created.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    [
      {
        id: minseoId,
        display_name: "김민서",
        grade: 2,
        bio: "미적분과 정보 프로젝트를 배우고 싶은 학생입니다.",
        role: "student",
        onboarding_completed: true,
        mentor_enabled: false,
      },
      {
        id: jihoId,
        display_name: "박지호",
        grade: 3,
        bio: "수학 문제 풀이와 파이썬 기초를 도울 수 있습니다.",
        role: "student",
        onboarding_completed: true,
        mentor_enabled: true,
      },
      {
        id: adminId,
        display_name: "운영 관리자",
        grade: 3,
        bio: "StudyBridge 운영 테스트 계정입니다.",
        role: "admin",
        onboarding_completed: true,
        mentor_enabled: true,
      },
    ],
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  const { error: mentorSettingsError } = await admin.from("mentor_settings").upsert(
    {
      mentor_id: jihoId,
      introduction: "식을 세우는 이유부터 풀이 전략까지 같이 정리합니다.",
      max_active_mentees: 3,
      is_accepting: true,
    },
    { onConflict: "mentor_id" },
  );

  if (mentorSettingsError) {
    throw mentorSettingsError;
  }

  const { error: mentorSubjectError } = await admin.from("mentor_subjects").upsert(
    {
      mentor_id: jihoId,
      subject_id: mathSubjectId,
      proficiency_level: 5,
      topics: ["함수", "미적분", "수열"],
      preferred_grades: [1, 2, 3],
      is_active: true,
    },
    { onConflict: "mentor_id,subject_id" },
  );

  if (mentorSubjectError) {
    throw mentorSubjectError;
  }

  const { error: availabilityError } = await admin.from("availability_slots").upsert(
    [
      { user_id: jihoId, day_of_week: 2, start_time: "18:00", end_time: "20:00" },
      { user_id: jihoId, day_of_week: 4, start_time: "17:00", end_time: "19:00" },
    ],
    { onConflict: "user_id,day_of_week,start_time,end_time" },
  );

  if (availabilityError) {
    throw availabilityError;
  }

  const { data: request, error: requestError } = await admin
    .from("learning_requests")
    .upsert(
      {
        mentee_id: minseoId,
        subject_id: mathSubjectId,
        title: "미적분 접선과 극값 문제 풀이가 어려워요",
        topics: ["미적분", "함수"],
        description: "그래프에서 접선의 기울기를 구하는 문제와 극값 조건을 연결하는 과정이 헷갈립니다.",
        help_type: "problem_solving",
        desired_level: 3,
        preferred_days: [2, 4],
        preferred_start_time: "18:00",
        preferred_end_time: "20:00",
        expected_sessions: 4,
        visibility: "school",
        status: "open",
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (requestError) {
    throw requestError;
  }

  const { error: notificationError } = await admin.from("notifications").insert({
    user_id: minseoId,
    type: "admin_notice",
    title: "데모 데이터가 준비되었습니다",
    message: "멘토 찾기와 신청 흐름을 테스트할 수 있습니다.",
    link: "/dashboard",
  });

  if (notificationError) {
    throw notificationError;
  }

  console.log("Demo seed completed.");
  console.log(`Student: ${users[0].email} / ${users[0].password}`);
  console.log(`Mentor: ${users[1].email} / ${users[1].password}`);
  console.log(`Admin: ${users[2].email} / ${users[2].password}`);
  console.log(`Sample request: ${request.id}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
