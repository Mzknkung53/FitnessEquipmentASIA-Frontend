import { PageTransition } from "@/components/page-transition";

/** A message in place of a staff page's content (no access, database not ready, …). */
export function StaffNotice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <PageTransition>
      <main className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <div className="flex max-w-[640px] flex-col gap-2 rounded-2xl border border-[#26231f] bg-night-2 p-6">
          <p className="text-lg font-semibold">{title}</p>
          {children && <div className="text-[15px] text-muted-night">{children}</div>}
        </div>
      </main>
    </PageTransition>
  );
}

/**
 * True when a Supabase error means a migration has not been applied yet
 * (PostgREST cannot find the table, view or function).
 */
export function isMissingMigration(error: { code?: string; message: string }) {
  return error.code === "PGRST205" || error.code === "PGRST202" || /schema cache|does not exist/i.test(error.message);
}

export function MigrationNeeded({ file }: { file: string }) {
  return (
    <StaffNotice title="ฐานข้อมูลยังไม่ได้อัปเดตสำหรับหน้านี้">
      <p>
        เปิด Supabase → SQL Editor แล้วรันไฟล์ <code className="font-mono text-white">supabase/migrations/{file}</code> จาก repo Backend
        จากนั้นรีเฟรชหน้านี้
      </p>
    </StaffNotice>
  );
}
