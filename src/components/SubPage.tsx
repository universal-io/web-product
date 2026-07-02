import Nav from "./Nav";
import Footer from "./Footer";

export default function SubPage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-14 sm:px-10 sm:pb-32 sm:pt-20">
        <div className="mb-[18px] font-mono text-xs uppercase tracking-[0.12em] text-iris">
          {kicker}
        </div>
        <h1 className="text-balance text-[32px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[40px] lg:text-[44px] lg:leading-[1.1]">
          {title}
        </h1>
        {updated && (
          <p className="mt-4 font-mono text-xs tracking-[0.04em] text-faint">
            {updated}
          </p>
        )}
        <div className="mt-10 sm:mt-12">{children}</div>
      </main>
      <Footer />
    </>
  );
}
