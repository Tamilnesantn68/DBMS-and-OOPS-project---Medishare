# Build stage — Maven + Temurin 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# Run stage — small JRE image, memory tuned for free-tier containers
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/medicine-redistribution-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-Xss512k", "-jar", "app.jar"]
