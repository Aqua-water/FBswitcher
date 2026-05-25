function showMessage(text, isError = true) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.style.color = isError ? "#dc2626" : "#16a34a";
}

document.getElementById("runButton").addEventListener("click", () => {
  const FBcolor = document.getElementById("FBcolor").value;
  const Dcolor = document.getElementById("Dcolor").value;
  const url = document.getElementById("urlInput").value.trim();

  const resultSection = document.getElementById("resultSection");
  const output = document.getElementById("urlOutput");

  resultSection.classList.add("hidden");
  output.value = "";
  showMessage("");

  try {
    if (!url.startsWith("https://alg.cubing.net/") && !url.startsWith("http://alg.cubing.net/")) {
      throw new Error("请输入 alg.cubing.net 类型的链接。");
    }

    const newUrl = solveUrl(FBcolor, Dcolor, url);

    if (newUrl === null) {
      throw new Error("当前输入无法在限制条件下转换到目标状态。");
    }

    output.value = newUrl;
    resultSection.classList.remove("hidden");
    showMessage("转换成功。", false);
  } catch (error) {
    showMessage(error.message);
  }
});

document.getElementById("copyButton").addEventListener("click", async () => {
  const output = document.getElementById("urlOutput").value;

  try {
    await navigator.clipboard.writeText(output);
    showMessage("已复制。", false);
  } catch {
    showMessage("复制失败，请手动复制输出框内容。");
  }
});

document.getElementById("openButton").addEventListener("click", () => {
  const output = document.getElementById("urlOutput").value;

  if (output) {
    window.open(output, "_blank");
  }
});
