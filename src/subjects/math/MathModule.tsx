import mathStyles from "./App.css?inline";
import MathApp from "./App";
import { SubjectShadowHost } from "../../components/SubjectShadowHost";

interface MathModuleProps {
  programDay: number;
  onComplete: (sourceDay: number) => void;
}

export function MathModule({ programDay, onComplete }: MathModuleProps) {
  return (
    <SubjectShadowHost styles={mathStyles} label={`数学第 ${programDay} 天`}>
      <MathApp initialDay={programDay} onDayComplete={onComplete} />
    </SubjectShadowHost>
  );
}
