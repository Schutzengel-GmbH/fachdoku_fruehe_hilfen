import { superTokensNextWrapper } from "supertokens-node/nextjs";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import supertokens from "supertokens-node";
import { backendConfig } from "../../../../../config/backendConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { SessionRequest } from "supertokens-node/framework/express";
import { Response } from "express";
import { prisma } from "../../../../../db/prisma";
import { Prisma, Role } from "@prisma/client";

supertokens.init(backendConfig());

export interface IResponses {
  responses?: Prisma.ResponseGetPayload<{}>[];
  response?: Prisma.ResponseGetPayload<{}>;
  error?:
    | "INTERNAL_SERVER_ERROR"
    | "METHOD_NOT_ALLOWED"
    | "NOT_FOUND"
    | "FORBIDDEN";
}

export default async function responses(
  req: NextApiRequest & SessionRequest,
  res: NextApiResponse & Response
) {
  // we first verify the session
  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res
  );
  // if it comes here, it means that the session verification was successful
  const { survey: surveyId } = req.query;

  let session = req.session;
  const user = await prisma.user
    .findUnique({
      where: { authId: session.getUserId() },
    })
    .catch((err) => console.log(err));

  if (!user) return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

  const survey = await prisma.survey
    .findUnique({ where: { id: surveyId as string } })
    .catch((err) => console.log(err));

  if (!survey) return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

  // we need to check if the user is allowed to access this survey
  if (
    (user.role === Role.USER || user.role === Role.ORGCONTROLLER) &&
    survey.organizationId &&
    user.organizationId !== survey.organizationId
  )
    return res.status(403).json({ error: "FORB" });

  let where: Prisma.ResponseWhereInput = {
    survey: { id: surveyId as string },
  };
  // if the user is USER, we need to filter the responses to only theirs,
  // if the user is ORGCONTROLLER, we need to filter the responses to only their organization's
  if (user.role === Role.USER) where.userId = user.id;
  if (user.role === Role.ORGCONTROLLER) {
    where.OR = [
      { survey: { organizationId: null } },
      { survey: { organizationId: user.organizationId } },
    ];
    where.user = { organizationId: user.organizationId };
  }

  switch (req.method) {
    case "GET":
      const responses = await prisma.response
        .findMany({ where })
        .catch((err) => console.log(err));

      if (!responses)
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

      return res.status(200).json({ responses });

    case "POST":
      const newResponse = await prisma.response
        .create({
          data: {
            name: req.body.name,
            child: req.body.child,
            caregiver: req.body.caregiver,
            family: req.body.family,
            survey: { connect: { id: survey.id } },
            user: { connect: { id: user.id } },
          },
        })
        .catch((err) => console.log(err));

      if (!newResponse)
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

      return res.status(200).json({ response: newResponse });

    default:
      return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
}