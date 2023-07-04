import { AdminPanelSettings, AccountBox, Poll } from "@mui/icons-material";
import { Prisma, Role } from "@prisma/client";

export const navigationList: {
  title: string;
  icon: JSX.Element;
  url: string;
  canAccess: (
    user: Prisma.UserGetPayload<{ include: { organization: true } }>
  ) => boolean;
}[] = [
  {
    title: "Profil",
    icon: <AccountBox />,
    url: "/me",
    canAccess: (user) => (user ? true : false),
  },
  {
    title: "Admin Dashboard",
    icon: <AdminPanelSettings />,
    url: "/adminDashboard",
    canAccess: (user) =>
      user &&
      (user.role === Role.ADMIN ||
        user.role === Role.CONTROLLER ||
        user.role === Role.ORGCONTROLLER),
  },
  {
    title: "Survey Dashboard",
    icon: <Poll />,
    url: "/surveyDashboard",
    canAccess: (user) =>
      user &&
      (user.role === Role.ADMIN ||
        user.role === Role.CONTROLLER ||
        user.role === Role.ORGCONTROLLER),
  },
];