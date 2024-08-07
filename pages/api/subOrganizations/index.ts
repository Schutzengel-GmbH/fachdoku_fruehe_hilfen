import { superTokensNextWrapper } from "supertokens-node/nextjs";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import supertokens from "supertokens-node";
import { backendConfig } from "@/config/backendConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { SessionRequest } from "supertokens-node/framework/express";
import { Response } from "express";
import { prisma } from "@/db/prisma";
import { Prisma, Role } from "@prisma/client";
import { logger as _logger } from "@/config/logger";
import { FullSubOrganization } from "@/types/prismaHelperTypes";

supertokens.init(backendConfig());

export interface ISubOrganizations {
  subOrganizations?: FullSubOrganization[];
  subOrganization?: FullSubOrganization;
  error?:
    | "INTERNAL_SERVER_ERROR"
    | "METHOD_NOT_ALLOWED"
    | "FORBIDDEN"
    | "ORGANIZATION_ID_REQUIRED";
}

export default async function subOrganizations(
  req: NextApiRequest & SessionRequest,
  res: NextApiResponse<ISubOrganizations> & Response
) {
  const logger = _logger.child({
    endpoint: "/subOrganizations",
    method: req.method,
    query: req.query,
    cookie: req.headers.cookie,
    body: req.body,
  });

  logger.info("accessed endpoint");

  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res
  );

  const { organizationId } = req.query as { organizationId: string };
  if (!organizationId)
    return res.status(400).json({ error: "ORGANIZATION_ID_REQUIRED" });

  const user = await prisma.user
    .findUnique({
      where: { authId: req.session.getUserId() },
    })
    .catch((err) => logger.error(err));

  if (!user) return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

  switch (req.method) {
    case "GET":
      const subOrganizations = await prisma.subOrganization
        .findMany({
          where: { organizationId },
          include: {
            User: { include: { organization: true, subOrganizations: true } },
          },
        })
        .catch((err) => logger.error(err));

      if (!subOrganizations)
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

      return res
        .status(200)
        .json({ subOrganizations: subOrganizations || undefined });

    case "POST":
      const createInput = JSON.parse(
        req.body
      ) as Prisma.SubOrganizationCreateInput;

      if (user.role !== Role.ADMIN) {
        if (
          user.role === Role.USER ||
          user.organizationId !== createInput.organization.connect.id
        )
          return res.status(403).json({ error: "FORBIDDEN" });
      }

      const newOrg = await prisma.subOrganization
        .create({
          data: createInput,
          include: {
            User: { include: { organization: true, subOrganizations: true } },
          },
        })
        .catch((err) => logger.error(err));

      if (!newOrg)
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
      return res.status(200).json({ subOrganization: newOrg });

    default:
      return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
}

