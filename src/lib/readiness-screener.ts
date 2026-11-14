export type YesNo = "yes" | "no";
export type OptionalYesNo = YesNo | "";

export interface ReadinessAnswers {
  timeInUs: "under2" | "2to10" | "over10" | "unsure" | "";
  currentStatus: "none" | "tps" | "daca" | "lawful" | "pending" | "other" | "";
  priorRemoval: YesNo | "unsure" | "";
  ownsHome: OptionalYesNo;
  ownsBusiness: OptionalYesNo;
}

export interface ReadinessPlan {
  organizeCaseFile: true;
  counselReviewUrgent: boolean;
  showHome: boolean;
  showBusiness: boolean;
}

export const EMPTY_READINESS_ANSWERS: ReadinessAnswers = {
  timeInUs: "",
  currentStatus: "",
  priorRemoval: "",
  ownsHome: "",
  ownsBusiness: "",
};

export function isReadinessScreenComplete(answers: ReadinessAnswers): boolean {
  return Boolean(
    answers.timeInUs &&
      answers.currentStatus &&
      answers.priorRemoval &&
      answers.ownsHome &&
      answers.ownsBusiness,
  );
}

/**
 * Produces planning priorities only. It never determines immigration relief,
 * detention relief, program eligibility, or a person's legal standing.
 */
export function buildReadinessPlan(answers: ReadinessAnswers): ReadinessPlan {
  return {
    organizeCaseFile: true,
    counselReviewUrgent: answers.priorRemoval === "yes" || answers.priorRemoval === "unsure",
    showHome: answers.ownsHome === "yes",
    showBusiness: answers.ownsBusiness === "yes",
  };
}
