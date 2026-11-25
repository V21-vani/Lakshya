# Builds and runs the Spring Boot backend (used by Render; works with any Docker host).
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
RUN ./mvnw -B -q package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# H2 file database lives here; it resets when the container is replaced.
RUN mkdir -p data
ENV H2_CONSOLE=false
EXPOSE 8080
# Keep memory within small free-tier instances (512 MB)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
