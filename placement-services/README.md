# Placement Services (Member 2)

Spring Boot 3.3 / Java 17 / Maven. Port **8082**.
Judge0 code execution, eligibility engine, e-mail notifications, PDF reports.

## Folder structure
```
placement-services
├── pom.xml
└── src
    ├── main
    │   ├── java/com/vtu/placement
    │   │   ├── PlacementServicesApplication.java
    │   │   ├── config      Judge0Properties, AppConfig (WebClient bean + CORS)
    │   │   ├── controller  CodeExecutionController, EligibilityController,
    │   │   │               NotificationController, ReportController
    │   │   ├── service     Judge0Service, SubmissionService, EligibilityService,
    │   │   │               EmailService, PdfReportService
    │   │   ├── model       Submission (entity)
    │   │   ├── repository  SubmissionRepository
    │   │   ├── dto         CodeExecutionDtos, EligibilityDtos, NotificationDtos,
    │   │   │               ReportDtos, ApiError
    │   │   └── exception   ExternalServiceException, GlobalExceptionHandler
    │   └── resources/application.properties
    └── test/java/com/vtu/placement/service
        ├── EligibilityServiceTest.java
        └── Judge0ServiceTest.java
```

## Run locally
1. Install JDK 17+ and Maven 3.9+.
2. (Only for e-mail) Create a Gmail **App Password** and export:
   ```
   export MAIL_USERNAME=youraddress@gmail.com
   export MAIL_PASSWORD=your-16-char-app-password
   ```
3. Unit tests (no internet/SMTP needed): `mvnw.cmd test` (Windows) or `./mvnw test`
4. Start: `mvnw.cmd spring-boot:run` -> http://localhost:8082

Judge0 uses the free public instance https://ce.judge0.com by default (rate limited).
For RapidAPI set `JUDGE0_API_KEY` and `judge0.base-url=https://judge0-ce.p.rapidapi.com`.

## Test with curl

Run code (Python, 2 test cases):
```
curl -X POST localhost:8082/api/execution/run -H "Content-Type: application/json" -d '{
  "studentId":1,"problemId":10,"language":"python",
  "sourceCode":"a,b=map(int,input().split())\nprint(a+b)",
  "testCases":[{"input":"2 3","expectedOutput":"5","hidden":false},
               {"input":"10 20","expectedOutput":"30","hidden":true}]}'
```

Eligibility:
```
curl -X POST localhost:8082/api/eligibility/check -H "Content-Type: application/json" -d '{
  "student":{"studentId":1,"name":"Asha","email":"asha@example.com","aptitudeScore":75,
             "codingScore":70,"problemsSolved":15,"cgpa":8.2,"backlogs":0,"skills":["Java","SQL"]},
  "criteria":{"driveId":5,"companyName":"Infosys","minAptitudeScore":60,"minCodingScore":50,
              "minProblemsSolved":10,"minCgpa":7.0,"maxBacklogs":0,
              "requiredSkills":["Java","SQL"],"minSkillMatchPercent":100}}'
```

Drive announcement e-mail:
```
curl -X POST localhost:8082/api/notifications/drive-announcement -H "Content-Type: application/json" -d '{
  "recipients":["you@gmail.com"],"companyName":"Infosys","role":"Systems Engineer",
  "applicationDeadline":"2026-12-10","details":"Online test followed by interview."}'
```

PDF report:
```
curl -X POST localhost:8082/api/reports/student -H "Content-Type: application/json" -o report.pdf -d '{
  "studentId":1,"studentName":"Asha","email":"asha@example.com","aptitudeScore":75,"codingScore":70,
  "problemsSolved":15,
  "assessments":[{"title":"Aptitude Test 1","type":"QUIZ","score":18,"maxScore":25,"date":"2026-11-10"}],
  "eligibilities":[]}'
```

## API contract summary
| Method | Path | Purpose |
|---|---|---|
| POST | /api/execution/run | Run code, not stored |
| POST | /api/execution/submit | Run all tests, store submission |
| GET | /api/execution/history/{studentId} | Submission history |
| GET | /api/execution/stats/{studentId} | totalSubmissions, problemsSolved |
| POST | /api/eligibility/check | One student vs one drive |
| POST | /api/eligibility/check-bulk | Many students vs one drive |
| POST | /api/notifications/email | Generic mail (202) |
| POST | /api/notifications/eligibility-result | Eligibility mail (202) |
| POST | /api/notifications/drive-announcement | Drive broadcast (202) |
| POST | /api/reports/student | Returns application/pdf |

Errors: `{timestamp,status,error,message,details[]}` with 400 (validation / unsupported language),
502 (Judge0 down), 500 (unexpected).

## Integrating with Member 1
- Put this service behind the same JWT filter (or API gateway); `/api/**` here assumes the caller is already authenticated.
- Replace H2 by MySQL in `application.properties` and add the driver to `pom.xml`.
- `studentId`/`problemId` are plain IDs; convert to `@ManyToOne` once Member 1's entities exist.
