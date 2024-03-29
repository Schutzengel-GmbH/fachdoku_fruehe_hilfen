import {
  FullAnswer,
  FullFamily,
  FullQuestion,
  FullResponse,
  IAnswerSelectOtherValues,
} from "@/types/prismaHelperTypes";
import {
  getAge,
  getBoolString,
  getDisabilityString,
  getEducationString,
  getGenderString,
} from "@/utils/utils";
import { Answer, Question, SelectOption } from "@prisma/client";

export function getFamiliesJson(families: FullFamily[]) {
  let humanReadable: object[] = [];

  for (const family of families) {
    let kinder = family?.children?.reduce(
      (prev, curr, i) => ({
        ...prev,
        [i + 1]: {
          alter: getAge(curr.dateOfBirth),
          geschlecht: getGenderString(curr.gender),
          behinderung: getDisabilityString(curr.disability),
          mehrling: getBoolString(curr.isMultiple),
          fruehgeburt: getBoolString(curr.isPremature),
          psych_diagnose: getBoolString(curr.psychDiagosis),
        },
      }),
      {}
    );

    let bezugspersonen = family?.caregivers?.reduce(
      (prev, curr, i) => ({
        ...prev,
        [i + 1]: {
          alter: getAge(curr.dateOfBirth),
          geschlecht: getGenderString(curr.gender),
          behinderung: getDisabilityString(curr.disability),
          migrationshintergrund: getBoolString(curr.migrationBackground),
          bildungsabschluss: getEducationString(curr.education),
          psych_diagnose: getBoolString(curr.psychDiagosis),
        },
      }),
      {}
    );

    let verantwortlich = {
      organisation: family.createdBy?.organization?.name || "keine",
      unterorganisationen:
        family.createdBy?.subOrganizations?.map((s) => s.name) || [],
    };

    humanReadable.push({
      familiennummer: family.number,
      betreuungsbeginn: family.beginOfCare,
      betreuungsende: family.endOfCare,
      anzahl_kinder: family.childrenInHousehold,
      andere_fachkraefte: family.otherInstalledProfessionals,
      wohnort: family.location,
      zugang_ueber: family.comingFrom?.value || family.comingFromOtherValue,
      kinder,
      bezugspersonen,
      verantwortlich,
    });
  }

  return JSON.stringify(humanReadable);
}

export function getFullResponseJson(data: FullResponse[]) {
  let humanReadableRes: object[] = [];

  for (let response of data) {
    let obj = response.answers.reduce(
      (prev, curr, i) => ({
        ...prev,
        [curr.question.questionText]: getAnswer(curr),
      }),
      {}
    );

    let kinder = response.family?.children?.reduce(
      (prev, curr, i) => ({
        ...prev,
        [i + 1]: {
          alter: getAge(curr.dateOfBirth),
          geschlecht: getGenderString(curr.gender),
          behinderung: getDisabilityString(curr.disability),
          mehrling: getBoolString(curr.isMultiple),
          fruehgeburt: getBoolString(curr.isPremature),
          psych_diagnose: getBoolString(curr.psychDiagosis),
        },
      }),
      {}
    );

    let bezugspersonen = response.family?.caregivers?.reduce(
      (prev, curr, i) => ({
        ...prev,
        [i + 1]: {
          alter: getAge(curr.dateOfBirth),
          geschlecht: getGenderString(curr.gender),
          behinderung: getDisabilityString(curr.disability),
          migrationshintergrund: getBoolString(curr.migrationBackground),
          bildungsabschluss: getEducationString(curr.education),
          psych_diagnose: getBoolString(curr.psychDiagosis),
        },
      }),
      {}
    );

    obj["verantwortlich"] = {
      name: response.user?.name || "",
      organisation: response.user?.organization?.name || "keine",
      unterorganisationen:
        response.user?.subOrganizations?.map((s) => s.name) || [],
    };

    obj["familie"] = response.family
      ? {
          ["familiennummer"]: response.family.number,
          kinder,
          bezugspersonen,
          betreuungsbeginn: response.family.beginOfCare,
          betreuungsende: response.family.endOfCare || "",
        }
      : undefined;

    humanReadableRes.push(obj);
  }

  return JSON.stringify(humanReadableRes, null, 2);
}

function getAnswer(
  a: Answer & {
    question: Question & { selectOptions: SelectOption[] };
    answerSelect: SelectOption[];
  }
) {
  switch (a.question.type) {
    case "Text":
      return a.answerText;
    case "Bool":
      return a.answerBool;
    case "Int":
      return a.answerInt;
    case "Num":
      return a.answerNum;
    case "Select":
      let ans = [];
      for (let option of a.question.selectOptions) {
        let op = a.answerSelect.find((o) => o.id === option.id);
        if (option.isOpen) {
          if (op)
            ans.push(
              (a.answerSelectOtherValues as IAnswerSelectOtherValues)?.find(
                (v) => v.selectOptionId === option.id
              ).value
            );
        } else if (op) ans.push(op.value);
      }
      return ans;
    case "Date":
      return a.answerDate;
    case "Scale":
      return (
        a.question.selectOptions.findIndex(
          (o) => o.id === a.answerSelect[0]?.id
        ) + 1
      );
  }
}

