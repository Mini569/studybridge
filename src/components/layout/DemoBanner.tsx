import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-950">
      <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm">
        <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>
          데모 모드입니다. Supabase 환경변수가 없으면 샘플 데이터로 화면을 확인하며, 가입·신청·저장 작업은 실제 DB에 반영되지 않습니다.
        </span>
      </div>
    </div>
  );
}
