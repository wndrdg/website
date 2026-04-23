import { Badge } from "@/components/crm/ui/badge";
import { LIFECYCLE_STAGE_CONFIG } from "@/lib/crm/utils/constants";
import type { LifecycleStage as LifecycleStageType } from "@/lib/crm/types";

interface Props {
  stage: LifecycleStageType;
  className?: string;
}

export function LifecycleStageBadge({ stage, className }: Props) {
  const config = LIFECYCLE_STAGE_CONFIG[stage];

  return (
    <Badge variant="outline" className={className} style={{ borderColor: config.color, color: config.color }}>
      {config.label}
    </Badge>
  );
}
