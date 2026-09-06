import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";
const username = "admin";
const password = "admin123";
const loginDuration = new Trend("login_duration");
const dashboardDuration = new Trend("dashboard_duration");
const reportDuration = new Trend("report_duration");

export const options = {
  stages: [
    { duration: "20s", target: 50 },
    { duration: "20s", target: 50 },
    { duration: "20s", target: 100 },
    { duration: "20s", target: 100 },
    { duration: "20s", target: 0 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.05"],
    login_duration: ["p(95)<1000"],
    dashboard_duration: ["p(95)<1000"],
    report_duration: ["p(95)<1000"],
  },
};

export default function () {
  if (__ITER === 0) {
    const login = http.post(
      `${baseUrl}/api/auth/login`,
      JSON.stringify({
        username: username,
        password: password,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    loginDuration.add(login.timings.duration);

    const loginOK = check(login, {
      "Login successful": (r) => r.status === 200,
    });

    if (!loginOK) {
      return;
    }
  }

  const dashboard = http.get(`${baseUrl}/admin/dashboard`, {
    tags: { endpoint: "dashboard" },
  });
  const report = http.get(`${baseUrl}/report`, {
    tags: { endpoint: "report" },
  });
  reportDuration.add(report.timings.duration);
  check(report, { "Report API accessible": (r) => r.status === 200 });
  dashboardDuration.add(dashboard.timings.duration);
  check(dashboard, { "Dashboard accessible": (r) => r.status === 200 });

  sleep(1);
}
