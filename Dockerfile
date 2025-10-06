# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy everything and restore dependencies
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Stage 2: Run the published app
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copy the output from the build stage
COPY --from=build /app/out .

# Expose the default port Render uses
EXPOSE 8080

# Start the app
ENTRYPOINT ["dotnet", "TrEstherApp.dll"]
