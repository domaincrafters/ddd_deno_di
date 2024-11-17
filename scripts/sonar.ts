import scanner from "@sonarqube/sonarqube";
scanner(
  {
    serverUrl: "https://sonarcloud.io/",
    options: {
      "sonar.token": Deno.env.get("SONARQUBE_TOKEN"),
      "sonar.host.url": "https://sonarcloud.io/",
      "sonar.projectKey": "domaincrafters.deno.di",
      "sonar.projectName": "domaincrafters.deno.di",
      "sonar.organization": "domaincrafters",
      "sonar.newCodePeriod": "previous_version",
      "sonar.qualitygate": "DDD",
      "sonar.sources": "src",
      "sonar.tests": "tests",
      "sonar.javascript.lcov.reportPaths": "coverage.lcov",
      "sonar.branch.name": "main",
    },
  },
  (error: unknown) => {
    if (error) {
      console.error("SonarQube analysis failed:", error);
      Deno.exit(1);
    } else {
      console.log("SonarQube analysis is complete");
    }
  }
);