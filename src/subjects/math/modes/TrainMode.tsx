import { ClassicMode } from "./ClassicMode";
import type { ModeResult, PlaylistItem } from "../engine/types";

/** Chain questions with train framing */
export function TrainMode(props: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
}) {
  return (
    <div className="train-wrap">
      <div className="train-banner">🚂 车厢填对，火车就往前开！</div>
      <ClassicMode {...props} />
    </div>
  );
}
