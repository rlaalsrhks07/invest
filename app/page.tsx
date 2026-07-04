import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("slug", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <section className="rounded-2xl bg-black p-8 text-white">
        <div className="text-sm opacity-70">진로 투자 대결</div>
        <h1 className="mt-2 text-4xl font-bold">투자로 만나는 미래 진로</h1>
        <p className="mt-4 text-lg opacity-90">
          조별 링크를 선택해 투자 페이지로 이동하세요.
        </p>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-2">
        {teams?.map((team) => (
          <Link
            key={team.id}
            href={`/team/${team.slug}`}
            className="rounded-xl border p-5 hover:bg-gray-50"
          >
            <div className="text-xl font-bold">{team.name}</div>
            <div className="mt-1 text-sm text-gray-500">
              /team/{team.slug}
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <Link
          href="/admin"
          className="inline-block rounded-lg bg-black px-5 py-3 font-bold text-white"
        >
          관리자 페이지
        </Link>
      </section>
    </main>
  );
}