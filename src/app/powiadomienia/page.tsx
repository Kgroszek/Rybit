import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await prisma.userNotification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      message: true,
      href: true,
      type: true,
      isRead: true,
      createdAt: true,
    },
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const formattedNotifications = notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  }));

  return (
    <DashboardLayout>
      <NotificationsList
        notifications={formattedNotifications}
        unreadCount={unreadCount}
      />
    </DashboardLayout>
  );
}