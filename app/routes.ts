import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("unauthorized", "routes/unauthorized.tsx"),
    layout("routes/admin.tsx", [
        route("admin/jobs", "routes/admin/jobs._index.tsx"),
        route("admin/jobs/:id", "routes/admin/jobs.$id.tsx"),
        route("admin/jobs/new", "routes/admin/jobs.new.tsx"),
        route("admin/jobs/:id/edit", "routes/admin/jobs.$id.edit.tsx"),
        route("admin/applications/:id", "routes/admin/applications.$id.tsx"),
    ]),
    layout("routes/applicant.tsx", [
        route("applicant/jobs", "routes/applicant/jobs._index.tsx"),
        route("applicant/jobs/:id", "routes/applicant/jobs.$id.tsx"),
    ]),
] satisfies RouteConfig;
