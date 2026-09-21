import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ink/app-shell";
import { CrunchStudio } from "@/components/ink/crunch-studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell>
      <CrunchStudio />
    </AppShell>
  );
}
