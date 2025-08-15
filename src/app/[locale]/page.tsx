import { MixpanelTracker } from "~/components/layout";

export default function HomePage() {
  return (
    <>
      <h2
        className={`
          w-fit bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl
          font-bold text-transparent
        `}
      >
        Hi there 👋
      </h2>

      <div className={`
        rounded-lg bg-gradient-to-r from-primary to-secondary p-[1px]
      `}>
        <div className="rounded-lg bg-surface p-6">
          <h3 className="text-2xl font-bold">This website is under construction</h3>
          <p className="mt-2">
            I am working on it, so please come back later. In the meantime, you can check out my other projects.
          </p>
        </div>
      </div>
      <MixpanelTracker event="Viewed Index Page" />
    </>
  );
}
