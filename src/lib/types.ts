export interface LineSpec {
  pre: string;
  t: string[];
  post: string;
  /**
   * If set, marks t.slice(unionAt) as a "value, '|', value, '|', value..."
   * union whose members may be tapped in any order — real union types
   * (`A | B | C`) don't have a canonical member order, so the exercise
   * shouldn't reject a correct-but-differently-ordered answer.
   */
  unionAt?: number;
}

export interface ExerciseSpec {
  file: string;
  goal: string;
  lines: LineSpec[];
  pool: string[];
  hint: string;
  out: string[];
}

export interface StepSpec {
  kicker: string;
  heading: string;
  body: string[];
  code?: string[];
  note: string;
  ex: ExerciseSpec;
}

export interface Chapter {
  num: string;
  title: string;
  sub: string;
  steps: StepSpec[];
}
