import { Prisma, SelectOption, Answer, SelectOption } from "@prisma/client";

export type FullResponse = Prisma.ResponseGetPayload<{
  include: {
    answers: {
      include: {
        answerSelect: true;
        question: {
          include: { defaultAnswerSelectOptions: true; selectOptions: true };
        };
      };
    };
    user: { include: { organization: true; subOrganizations: true } };
    family: {
      include: {
        caregivers: true;
        children: true;
        comingFrom: true;
        createdBy: {
          include: { organization: true; subOrganizations: true };
        };
      };
    };
    child: true;
    caregiver: true;
  };
}>;

export type FullQuestion = Prisma.QuestionGetPayload<{
  include: { selectOptions: true; defaultAnswerSelectOptions: true };
}>;

export type FullFamily = Prisma.FamilyGetPayload<{
  include: {
    caregivers: true;
    children: true;
    comingFrom: true;
    createdBy: { include: { organization: true; subOrganizations: true } };
  };
}>;

export type FullSurvey = Prisma.SurveyGetPayload<{
  include: {
    questions: {
      include: { selectOptions: true; defaultAnswerSelectOptions: true };
    };
  };
}>;

export type FullUser = Prisma.UserGetPayload<{
  include: { organization: true; subOrganizations: true };
}>;

export type FullSurveyWithResponses = Prisma.SurveyGetPayload<{
  include: {
    questions: {
      include: { selectOptions: true; defaultAnswerSelectOptions: true };
    };
    responses: {
      include: {
        survey: {
          include: {
            questions: {
              include: {
                selectOptions: true;
                defaultAnswerSelectOptions: true;
              };
            };
          };
        };
        answers: {
          include: {
            answerSelect: true;
            question: {
              include: {
                selectOptions: true;
                defaultAnswerSelectOptions: true;
              };
            };
          };
        };
        family: {
          include: { caregivers: true; children: true; comingFrom: true };
        };
        caregiver: true;
        child: true;
        user: { include: { organization: true; subOrganizations: true } };
      };
    };
  };
}>;

export type FullAnswer = Prisma.AnswerGetPayload<{
  include: {
    answerSelect: true;
    question: {
      include: {
        defaultAnswerSelectOptions: true;
        selectOptions: true;
      };
    };
  };
}>;

export type PartialAnswer = Partial<Answer> & {
  answerSelect: Partial<SelectOption>[];
};

export type IAnswerSelectOtherValue = {
  selectOptionId: string;
  value: string;
};

export type IAnswerSelectOtherValues = IAnswerSelectOtherValue[];

export type FullSubOrganization = Prisma.SubOrganizationGetPayload<{
  include: {
    User: { include: { organization: true; subOrganizations: true } };
  };
}>;
