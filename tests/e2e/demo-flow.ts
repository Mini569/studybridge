import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { strict as assert } from "node:assert";
import { chromium, type Browser, type Page } from "@playwright/test";

const baseUrl = "http://localhost:3000";

async function assertNoHorizontalOverflow(page: Page, description: string) {
  const { viewportWidth, contentWidth } = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));

  assert(contentWidth <= viewportWidth + 1, `${description}: content ${contentWidth}px exceeds viewport ${viewportWidth}px.`);
}

async function isServerReady() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await isServerReady()) {
      return;
    }
    await delay(1_000);
  }

  throw new Error("Timed out waiting for the Next.js dev server.");
}

function startServer() {
  const child = process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", "npm run dev"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NEXT_PUBLIC_DEMO_MODE: "true",
        },
        stdio: "pipe",
      })
    : spawn("npm", ["run", "dev"], {
        cwd: process.cwd(),
        detached: true,
        env: {
          ...process.env,
          NEXT_PUBLIC_DEMO_MODE: "true",
        },
        stdio: "pipe",
      });

  child.stdout.on("data", (chunk: Buffer) => process.stdout.write(`[dev] ${chunk.toString()}`));
  child.stderr.on("data", (chunk: Buffer) => process.stderr.write(`[dev] ${chunk.toString()}`));

  return child;
}

async function stopServer(server: ChildProcessWithoutNullStreams | null) {
  if (!server || server.exitCode !== null) {
    return;
  }

  if (process.platform === "win32" && server.pid) {
    await new Promise<void>((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      killer.on("exit", () => resolve());
      killer.on("error", () => resolve());
    });
    return;
  }

  if (server.pid) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill("SIGTERM");
    }
  }

  await delay(1_000);

  if (server.pid) {
    try {
      process.kill(-server.pid, "SIGKILL");
    } catch {
      // The process group already exited normally.
    }
  }
}

async function run() {
  const serverAlreadyRunning = await isServerReady();
  const server = serverAlreadyRunning ? null : startServer();
  let browser: Browser | null = null;

  try {
    await waitForServer();

    browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(baseUrl);
    await page.getByRole("heading", { name: "배움을 연결하고 함께 성장하세요" }).waitFor({ state: "visible" });

    await page.getByRole("link", { name: "데모 대시보드 보기" }).click();
    await page.getByRole("heading", { name: "대시보드" }).waitFor({ state: "visible" });

    await page.getByRole("link", { name: "멘토 찾기" }).first().click();
    await page.getByRole("heading", { name: "멘토 찾기" }).waitFor({ state: "visible" });
    assert(await page.getByText("박지호").isVisible(), "Expected mentor list to include 박지호.");

    await page.goto(`${baseUrl}/requests/new`);
    await page.getByLabel("제목").fill("미적분 접선 문제를 같이 풀고 싶어요");
    await page.getByLabel("과목").selectOption("subject-math");
    await page.getByLabel("세부 단원 또는 주제").fill("미적분, 함수");
    await page
      .getByLabel("현재 어려운 점")
      .fill("접선의 기울기와 극값 조건을 연결해서 문제를 푸는 과정이 어려워 대표 유형을 연습하고 싶습니다.");
    await page.getByLabel("화요일").check();
    await page.getByRole("button", { name: /도움 요청 작성/ }).click();
    await page.waitForURL(/\/requests/, { timeout: 10_000 });
    await page.getByRole("heading", { name: "학습 도움 요청" }).waitFor({ state: "visible" });

    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${baseUrl}/mentors`);
      await page.getByRole("heading", { name: "멘토 찾기" }).waitFor({ state: "visible" });
      await assertNoHorizontalOverflow(page, `멘토 찾기 ${width}px`);

      const columns = await page.locator("article").first().evaluate((card) =>
        getComputedStyle(card.parentElement!).gridTemplateColumns.split(" ").length,
      );
      assert.equal(columns, width >= 1280 ? 3 : width >= 768 ? 2 : 1, `Unexpected mentor columns at ${width}px.`);

      if (width < 1024) {
        await page.locator('summary[aria-label="메뉴 열기"]').click();
        await page.getByRole("navigation", { name: "주요 메뉴" }).first().getByRole("link", { name: "내 신청" }).waitFor({ state: "visible" });
        await assertNoHorizontalOverflow(page, `열린 메뉴 ${width}px`);
        const menuBounds = await page.getByRole("navigation", { name: "주요 메뉴" }).first().locator("..").boundingBox();
        assert(menuBounds && menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= width + 1, `Menu exceeds ${width}px viewport.`);
        assert(menuBounds.y + menuBounds.height <= height + 1, `Menu ends at ${menuBounds.y + menuBounds.height}px beyond ${height}px viewport height.`);
      }
    }

    await page.setViewportSize({ width: 320, height: 800 });
    for (const path of ["/dashboard", "/requests/new", "/applications", "/signup"]) {
      await page.goto(`${baseUrl}${path}`);
      await assertNoHorizontalOverflow(page, `${path} 320px`);
    }

    console.log("E2E demo flow passed.");
  } finally {
    await browser?.close();
    await stopServer(server);
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
