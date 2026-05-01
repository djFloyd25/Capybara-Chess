# Stage 1 — build the JAR
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper and pom first (cached unless pom changes)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN ./mvnw package -DskipTests -q

# Stage 2 — lean runtime image
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
