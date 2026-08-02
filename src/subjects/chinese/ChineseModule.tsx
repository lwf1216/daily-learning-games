import chineseStyles from "./App.css?inline";
import ChineseApp from "./App";
import { SubjectShadowHost } from "../../components/SubjectShadowHost";

interface ChineseModuleProps {
  programDay: number;
  sourceDay: number;
  onComplete: (sourceDay: number) => void;
}

export function ChineseModule({ programDay, sourceDay, onComplete }: ChineseModuleProps) {
  return (
    <SubjectShadowHost
      styles={chineseStyles}
      label={`语文第 ${programDay} 天，内容日 ${sourceDay}`}
    >
      <ChineseApp initialDay={sourceDay} onDayComplete={onComplete} />
    </SubjectShadowHost>
  );
}
