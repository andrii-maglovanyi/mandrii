const uk = location.pathname.startsWith("/uk/") || new URLSearchParams(location.search).get("lang") === "uk";
if (uk) {
  document.documentElement.lang = "uk";
  document.getElementById("heading").textContent = "Ви офлайн";
  document.getElementById("description").textContent =
    "Підключіться до інтернету, щоб переглядати оновлення, карти та надсилати повідомлення. Збережені статті доступні нижче.";
  document.getElementById("retry").textContent = "Спробувати ще раз";
  document.getElementById("saved-heading").textContent = "Збережені статті";
  document.getElementById("empty").textContent = "На цьому пристрої ще немає збережених статей.";
}
document.getElementById("retry").addEventListener("click", () => {
  if (location.pathname === "/offline.html") location.assign(uk ? "/uk" : "/en");
  else location.reload();
});
const key = "mandrii-offline-articles-v1";
let articles = [];
try {
  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  if (Array.isArray(saved))
    articles = saved
      .filter(
        (item) =>
          item && typeof item.url === "string" && typeof item.title === "string" && typeof item.text === "string",
      )
      .slice(0, 20);
} catch {
  /* Offline recovery works even when storage is unavailable. */
}
function render() {
  const list = document.getElementById("saved");
  list.replaceChildren();
  document.getElementById("empty").hidden = articles.length > 0;
  articles.forEach((article) => {
    const row = document.createElement("li");
    const read = document.createElement("button");
    read.textContent = article.title;
    read.addEventListener("click", () => {
      document.getElementById("reader").hidden = false;
      document.getElementById("title").textContent = article.title;
      document.getElementById("date").textContent =
        `${uk ? "Збережено" : "Saved"}: ${new Date(article.savedAt).toLocaleDateString(uk ? "uk" : "en")}`;
      document.getElementById("content").textContent = article.text;
      document.getElementById("reader").scrollIntoView();
    });
    const remove = document.createElement("button");
    remove.textContent = uk ? "Видалити" : "Remove";
    remove.setAttribute("aria-label", `${remove.textContent}: ${article.title}`);
    remove.addEventListener("click", () => {
      articles = articles.filter((item) => item.url !== article.url);
      try {
        localStorage.setItem(key, JSON.stringify(articles));
      } catch {
        /* Storage may be blocked. */
      }
      document.getElementById("reader").hidden = true;
      render();
    });
    row.append(read, remove);
    list.append(row);
  });
}
render();
