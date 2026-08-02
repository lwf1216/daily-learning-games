import { ClassicMode } from "./ClassicMode";
import type { ModeResult, PlaylistItem } from "../engine/types";

/** 词语小火车：复用经典答题交互，皮肤不同 */
export function TrainMode(props: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
}) {
  return (
    <div className="mode train-wrap">
      <div className="story-banner">
        <span className="story-mascot">🚂</span>
        <div>
          <strong>词语小火车</strong>
          <p>每一节车厢填对，火车就向前开！</p>
        </div>
      </div>
      <ClassicMode {...props} />
    </div>
  );
}
