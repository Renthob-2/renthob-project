import { BackButton } from "@/components/BackButton";
import { TenantActivityList } from "@/components/dashboard/TenantActivityList";

export default function ApplicationsPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <BackButton />
        <h1 className="mt-4 text-3xl font-bold">Applications and tours</h1>
        <p className="mt-2 text-muted-foreground">
          Follow the status of applications and viewing requests submitted through Renthob.
        </p>
        <div className="mt-8">
          <TenantActivityList />
        </div>
      </div>
    </main>
  );
}
