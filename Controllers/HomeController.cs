using Microsoft.AspNetCore.Mvc;

namespace TrEstherApp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
