import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ink/app-shell";
import { RestoreStudio } from "@/components/ink/restore-studio";

export const Route = createFileRoute("/restore")({ component: RestorePage });

function RestorePage() {
  return (
    <AppShell>
      <RestoreStudio />
    </AppShell>
  );
}
