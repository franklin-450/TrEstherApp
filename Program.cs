using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;
using System.Text.Json;
using TrEstherApp.Models;

var builder = WebApplication.CreateBuilder(args);

// ✅ MVC + Razor Runtime Compilation
builder.Services.AddControllersWithViews()
    .AddRazorRuntimeCompilation();

var app = builder.Build();

// ✅ Production pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

// ✅ Ensure data folder exists
var dataFolder = Path.Combine(app.Environment.ContentRootPath, "Data");
if (!Directory.Exists(dataFolder))
    Directory.CreateDirectory(dataFolder);

// ✅ Minimal API endpoint for messages
app.MapGet("/api/messages", () =>
{
    var file = Path.Combine(dataFolder, "messages.json");
    if (!File.Exists(file)) return Results.Json(Array.Empty<Message>());
    var json = File.ReadAllText(file);
    var messages = JsonSerializer.Deserialize<List<Message>>(json) ?? new List<Message>();
    return Results.Json(messages);
});

// ✅ MVC route
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
