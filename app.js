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

const BOOKMARKLET_CODE = `javascript:(async function(){const solverUrl="https://aqua-water.github.io/FBswitcher/solver.js";function loadScript(src){return new Promise((resolve,reject)=>{if(window.FBSwitcher&&window.FBSwitcher.solveUrl){resolve();return;}const script=document.createElement("script");script.src=src+"?t="+Date.now();script.onload=resolve;script.onerror=reject;document.body.appendChild(script);});}function normalizeColor(input){const value=String(input||"").trim();const colorMap={"白":"白","黄":"黄","绿":"绿","蓝":"蓝","橙":"橙","红":"红",white:"白",yellow:"黄",green:"绿",blue:"蓝",orange:"橙",red:"红",w:"白",y:"黄",g:"绿",b:"蓝",o:"橙",r:"红"};const lower=value.toLowerCase();if(value in colorMap)return colorMap[value];if(lower in colorMap)return colorMap[lower];return null;}try{const currentUrl=location.href;if(!currentUrl.startsWith("https://alg.cubing.net/")&&!currentUrl.startsWith("http://alg.cubing.net/")){alert("请先在 alg.cubing.net 页面中使用此书签。");return;}const leftBridgeInput=prompt("请输入左桥色：\\n可输入：白、黄、绿、蓝、橙、红","蓝");if(leftBridgeInput===null)return;const bottomBridgeInput=prompt("请输入桥底色：\\n可输入：白、黄、绿、蓝、橙、红","白");if(bottomBridgeInput===null)return;const pColor=normalizeColor(leftBridgeInput);const qColor=normalizeColor(bottomBridgeInput);if(!pColor||!qColor){alert("颜色输入无效。请使用：白、黄、绿、蓝、橙、红。");return;}await loadScript(solverUrl);const newUrl=window.FBSwitcher.solveUrl(pColor,qColor,currentUrl);if(!newUrl){alert("当前输入无法转换到目标状态。");return;}location.href=newUrl;}catch(error){alert("FBswitcher 执行失败：\\n"+error.message);}})();`;

const copyBookmarkletButton = document.getElementById("copyBookmarkletButton");

if (copyBookmarkletButton) {
  copyBookmarkletButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(BOOKMARKLET_CODE);
      showMessage("书签链接已复制。请手动新建书签，并把书签网址粘贴为该内容。", false);
    } catch {
      showMessage("复制失败，请右键手动复制书签链接。");
    }
  });
}

const bridgeImage = document.getElementById("bridgeImage");

if (bridgeImage) {
  const bridgeImages = [
    "./image/image1.png",
    "./image/image2.png",
  ];

  let bridgeImageIndex = 0;

  setInterval(() => {
    bridgeImage.classList.add("fade-out");

    setTimeout(() => {
      bridgeImageIndex = (bridgeImageIndex + 1) % bridgeImages.length;
      bridgeImage.src = bridgeImages[bridgeImageIndex];
      bridgeImage.classList.remove("fade-out");
    }, 250);
  }, 2000);
}
