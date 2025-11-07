import { useMediaQuery } from "react-responsive";

import { Tooltip } from "~/components/ui";
import { publicConfig } from "~/lib/config/public";

interface RevisionCardProps {
  isAdmin: boolean;
}

export const RevisionCard = ({ isAdmin }: RevisionCardProps) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  if (!isAdmin) {
    return null;
  }

  const { buildTime, commitSha = "~" } = publicConfig.deploymentInfo;

  const revision = commitSha?.slice(0, 7);
  const built = `${new Date(buildTime).toLocaleDateString()} ${new Date(buildTime).toLocaleTimeString()}`;

  const navigateToCommit = () => {
    window.open(`https://github.com/andrii-maglovanyi/mandrii/commit/${commitSha}`, "_blank");
  };

  return (
    <div className={`mt-2 flex cursor-default justify-between gap-2 text-xs text-neutral-500`}>
      <Tooltip label={commitSha} position={isMobile ? "right" : "left"}>
        <button
          className={`cursor-pointer rounded-md border-0 bg-neutral-500 px-1 py-0.5 text-neutral-50 no-underline`}
          onClick={navigateToCommit}
        >
          {revision}
        </button>
      </Tooltip>
      {built}
    </div>
  );
};
