export interface LineSpec {
  pre: string;
  t: string[];
  post: string;
}

export interface SlideSpec {
  kicker: string;
  heading: string;
  body: string[];
  code?: string[];
  note: string;
}

export interface ExerciseSpec {
  file: string;
  goal: string;
  lines: LineSpec[];
  pool: string[];
  hint: string;
  out: string[];
}

export interface Chapter {
  num: string;
  title: string;
  sub: string;
  slides: SlideSpec[];
  ex: ExerciseSpec;
}
