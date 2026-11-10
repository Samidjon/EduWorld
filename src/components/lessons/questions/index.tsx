"use client";

import type { QuestionTypeProps } from "./types";
import SingleChoice from "./SingleChoice";
import MultipleChoice from "./MultipleChoice";
import TrueFalse from "./TrueFalse";
import DragDrop from "./DragDrop";
import Matching from "./Matching";
import FillBlank from "./FillBlank";
import Ordering from "./Ordering";
import NumberInput from "./NumberInput";
import WordBuilding from "./WordBuilding";
import ImageSelection from "./ImageSelection";
import AudioRecognition from "./AudioRecognition";
import Drawing from "./Drawing";
import MathInput from "./MathInput";
import CodeBlocks from "./CodeBlocks";

export type { QuestionTypeProps } from "./types";
export {
  SingleChoice,
  MultipleChoice,
  TrueFalse,
  DragDrop,
  Matching,
  FillBlank,
  Ordering,
  NumberInput,
  WordBuilding,
  ImageSelection,
  AudioRecognition,
  Drawing,
  MathInput,
  CodeBlocks,
};

/**
 * Renders the answer UI for any question. Each component is keyed by q.id so local state
 * (selection, typed text, drawing, program) never leaks from one question to the next.
 */
export function QuestionInput(props: QuestionTypeProps) {
  const { q, ...rest } = props;
  switch (q.type) {
    case "single": return <SingleChoice key={q.id} q={q} {...rest} />;
    case "multiple": return <MultipleChoice key={q.id} q={q} {...rest} />;
    case "true_false": return <TrueFalse key={q.id} q={q} {...rest} />;
    case "drag_drop": return <DragDrop key={q.id} q={q} {...rest} />;
    case "matching": return <Matching key={q.id} q={q} {...rest} />;
    case "fill_blank": return <FillBlank key={q.id} q={q} {...rest} />;
    case "ordering": return <Ordering key={q.id} q={q} {...rest} />;
    case "number_input": return <NumberInput key={q.id} q={q} {...rest} />;
    case "word_building": return <WordBuilding key={q.id} q={q} {...rest} />;
    case "image_selection": return <ImageSelection key={q.id} q={q} {...rest} />;
    case "audio_recognition": return <AudioRecognition key={q.id} q={q} {...rest} />;
    case "drawing": return <Drawing key={q.id} q={q} {...rest} />;
    case "math_input": return <MathInput key={q.id} q={q} {...rest} />;
    case "code_blocks": return <CodeBlocks key={q.id} q={q} {...rest} />;
  }
}

export default QuestionInput;
