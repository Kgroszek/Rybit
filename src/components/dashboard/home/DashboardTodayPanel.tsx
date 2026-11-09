import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import type {
  DashboardTask,
  DashboardTaskIcon,
} from "@/components/dashboard/home/types";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export function DashboardTodayPanel({
  tasks,
}: {
  tasks: DashboardTask[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          Na dziś
        </p>

        <CardTitle className="mt-1">
          Rzeczy, które wymagają uwagi
        </CardTitle>

        <CardDescription>
          Najważniejsze zadania związane
          z wyprawami, checklistą i
          sprzętem.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {tasks.length > 0 ? (
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <TaskRow
                key={task.key}
                task={task}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-success-border bg-success-subtle p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface text-success-foreground">
                <CheckListIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-text">
                  Wszystko gotowe
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Nie masz teraz żadnych
                  pilnych rzeczy do
                  zrobienia w Rybio.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
}: {
  task: DashboardTask;
}) {
  return (
    <Link
      href={task.href}
      className="group -mx-2 flex min-h-[76px] items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-muted"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary group-hover:text-white">
        <TaskIcon
          type={task.icon}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-extrabold text-text transition-colors group-hover:text-primary-700">
            {task.title}
          </p>

          {task.badge && (
            <Badge variant="warning">
              {task.badge}
            </Badge>
          )}
        </div>

        <p className="mt-1 truncate text-xs leading-5 text-text-secondary">
          {task.description}
        </p>
      </div>

      <ArrowRightIcon className="h-4 w-4 shrink-0 text-text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function TaskIcon({
  type,
}: {
  type: DashboardTaskIcon;
}) {
  const className = "h-5 w-5";

  switch (type) {
    case "users":
      return (
        <UsersIcon
          className={className}
        />
      );
    case "fish":
      return (
        <FishIcon
          className={`${className} -scale-x-100`}
        />
      );
    case "checklist":
      return (
        <CheckListIcon
          className={className}
        />
      );
    case "backpack":
      return (
        <BackpackIcon
          className={className}
        />
      );
    case "calendar":
      return (
        <CalendarIcon
          className={className}
        />
      );
    case "summary":
      return (
        <CheckListIcon
          className={className}
        />
      );
  }
}
