import { ClassicMode } from "./ClassicMode";
import type { ModeResult, PlaylistItem } from "../engine/types";

/** 错题复习怪：用经典答题壳 + 怪物皮；做对会计入连对，连对 2 次移出错题本 */
export function ReviewMode(props: {
  item: PlaylistItem;
  day: number;
  sound: boolean;
  onFinish: (r: ModeResult) => void;
}) {
  return (
    <div className="review-wrap">
      <div className="review-banner">
        <span>🐛</span>
        <div>
          <strong>错题小怪物出现了！</strong>
          <p>同一题连续做对 2 次才会逃走；再错会重新计数</p>
        </div>
      </div>
      <ClassicMode {...props} />
    </div>
  );
}
