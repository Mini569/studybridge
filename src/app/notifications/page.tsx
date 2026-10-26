import { Bell } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { MarkAllNotificationsButton } from "@/components/notifications/MarkAllNotificationsButton";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { loadNotifications } from "@/lib/data/studybridge";

export const metadata = {
  title: "알림",
};

export default async function NotificationsPage() {
  const notifications = await loadNotifications();
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <AppShell>
      <PageHeader
        actions={notifications.length > 0 ? <MarkAllNotificationsButton /> : undefined}
        description={`읽지 않은 알림 ${unreadCount}개가 있습니다. 알림을 클릭하면 관련 페이지로 이동합니다.`}
        title="알림"
      />

      {notifications.length > 0 ? (
        <section className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState description="신청, 승인, 세션 등록, 피드백 요청 알림이 이곳에 표시됩니다." icon={Bell} title="새 알림이 없습니다" />
        </div>
      )}
    </AppShell>
  );
}
