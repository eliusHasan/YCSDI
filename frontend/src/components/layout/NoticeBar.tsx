import { Megaphone } from "lucide-react";

const NOTICE_TEXT =
  "দেশব্যাপী শাখা অনুমোদন কার্যক্রম চলমান রয়েছে। একজন উদ্যোক্তা হিসেবে আপনার কম্পিউটার ও কারিগরি প্রশিক্ষণ কেন্দ্রকে নতুনভাবে বিস্তৃত করার এখনই উপযুক্ত সময়। কর্মমুখী শিক্ষার প্রসারের মাধ্যমে একটি দক্ষ ও স্বনির্ভর প্রজন্ম গড়ে তুলতে আমাদের সাথে একসাথে এগিয়ে আসুন।";

export function NoticeBar() {
  return (
    <div className="bg-theme-soft text-theme-dark overflow-hidden">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-theme-dark px-4 py-2 text-[11px] font-black uppercase tracking-widest text-theme-soft">
          <Megaphone size={14} />
          নোটিশঃ
        </div>
        <div className="relative flex-1 overflow-hidden">
          {/* Duplicated content so the loop is seamless at -50% */}
          <div className="animate-notice-marquee flex w-max whitespace-nowrap py-2">
            <span className="px-8 text-[13px] font-bold">{NOTICE_TEXT}</span>
            <span className="px-8 text-[13px] font-bold" aria-hidden="true">
              {NOTICE_TEXT}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
