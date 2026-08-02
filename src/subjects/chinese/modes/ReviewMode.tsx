import { ClassicMode } from "./ClassicMode";
import type { ModeResult, PlaylistItem } from "../engine/types";

export function ReviewMode(props: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
}) {
  return (
    <div className="mode review-wrap">
      <div className="story-banner">
        <span className="story-mascot">🐛</span>
        <div>
          <strong>错题小毛虫</strong>
          <p>复习这些题，小毛虫就会变成蝴蝶～</p>
        </div>
      </div>
      <ClassicMode {...props} />
    </div>
  );
}
